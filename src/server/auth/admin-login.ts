import "server-only";

import { randomInt } from "node:crypto";
import { createAuthSession, hashSecret } from "~/server/auth/sessions";
import { getDb } from "~/server/db";
import { sendSmsBatch } from "~/server/messaging/sms";
import {
  OtpPurpose,
  SessionKind,
  SystemRole,
} from "../../../generated/prisma/client";

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

function createOtpCode() {
  return randomInt(100000, 1000000).toString();
}

function otpExpiresAt() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

async function findAdminLoginUser(phoneNumber: string) {
  const user = await getDb().user.findUnique({
    include: {
      _count: {
        select: { adminAssignments: true },
      },
    },
    where: { phoneNumber },
  });

  if (
    !user ||
    (user.systemRole !== SystemRole.GLOBAL_ADMIN &&
      user._count.adminAssignments === 0)
  ) {
    return null;
  }

  return user;
}

export async function requestAdminLoginOtp(rawPhoneNumber: string) {
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const user = await findAdminLoginUser(phoneNumber);

  if (!user) {
    return {
      code: null,
      sent: false,
    };
  }

  const code = createOtpCode();
  const db = getDb();

  await db.phoneOtpCode.updateMany({
    data: { consumedAt: new Date() },
    where: {
      consumedAt: null,
      phoneNumber,
      purpose: OtpPurpose.LOGIN,
    },
  });

  await db.phoneOtpCode.create({
    data: {
      codeHash: hashSecret(code),
      expiresAt: otpExpiresAt(),
      phoneNumber,
      purpose: OtpPurpose.LOGIN,
      userId: user.id,
    },
  });

  await sendSmsBatch({
    body: `Din Bibelbolgen admin-kode er ${code}. Koden varer i ${OTP_TTL_MINUTES} minutter.`,
    recipients: [
      {
        name: user.name,
        phoneNumber,
      },
    ],
  });

  return {
    code,
    sent: true,
  };
}

export async function verifyAdminLoginOtp({
  code,
  phoneNumber: rawPhoneNumber,
}: {
  code: string;
  phoneNumber: string;
}) {
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const otp = await getDb().phoneOtpCode.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      consumedAt: null,
      expiresAt: { gt: new Date() },
      phoneNumber,
      purpose: OtpPurpose.LOGIN,
    },
  });

  if (!otp) {
    throw new Error("Koden er utløpt eller finnes ikke.");
  }

  if (otp.attempts >= MAX_OTP_ATTEMPTS) {
    await getDb().phoneOtpCode.update({
      data: { consumedAt: new Date() },
      where: { id: otp.id },
    });
    throw new Error("For mange forsøk. Be om en ny kode.");
  }

  if (otp.codeHash !== hashSecret(code.trim())) {
    await getDb().phoneOtpCode.update({
      data: {
        attempts: { increment: 1 },
        consumedAt:
          otp.attempts + 1 >= MAX_OTP_ATTEMPTS ? new Date() : undefined,
      },
      where: { id: otp.id },
    });
    throw new Error("Koden stemmer ikke.");
  }

  const user = await findAdminLoginUser(phoneNumber);

  if (!user || user.id !== otp.userId) {
    throw new Error("Dette nummeret har ikke admintilgang.");
  }

  await getDb().phoneOtpCode.update({
    data: { consumedAt: new Date() },
    where: { id: otp.id },
  });

  await getDb().user.update({
    data: { phoneVerifiedAt: new Date() },
    where: { id: user.id },
  });

  await createAuthSession({
    kind: SessionKind.ADMIN,
    userId: user.id,
  });

  return user;
}
