"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  normalizePhoneNumber,
  requestAdminLoginOtp,
  verifyAdminLoginOtp,
} from "~/server/auth/admin-login";
import { revokeSession } from "~/server/auth/sessions";
import { SessionKind } from "../../../../generated/prisma/client";

export type AdminLoginState = {
  devCode?: string | null;
  message?: string;
  ok?: boolean;
  phoneNumber?: string;
  step?: "phone" | "code";
};

const phoneSchema = z.string().trim().min(6).max(32);
const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/);

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/admin") || nextPath.startsWith("//")) {
    return "/admin";
  }

  return nextPath;
}

export async function requestAdminLoginCodeAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  try {
    const phoneNumber = normalizePhoneNumber(
      phoneSchema.parse(textValue(formData, "phoneNumber")),
    );
    const result = await requestAdminLoginOtp(phoneNumber);
    const devCode =
      result.sent && process.env.NODE_ENV !== "production" ? result.code : null;

    return {
      devCode,
      message: result.sent
        ? "Engangskode er sendt."
        : "Hvis nummeret har admintilgang, sender vi en engangskode.",
      ok: true,
      phoneNumber,
      step: result.sent ? "code" : "phone",
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Kunne ikke sende kode.",
      ok: false,
      step: "phone",
    };
  }
}

export async function verifyAdminLoginCodeAction(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  try {
    await verifyAdminLoginOtp({
      code: codeSchema.parse(textValue(formData, "code")),
      phoneNumber: phoneSchema.parse(textValue(formData, "phoneNumber")),
    });
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Kunne ikke logge inn.",
      ok: false,
      phoneNumber: normalizePhoneNumber(textValue(formData, "phoneNumber")),
      step: "code",
    };
  }

  redirect(safeNextPath(textValue(formData, "next")));
}

export async function logoutAdminAction() {
  await revokeSession(SessionKind.ADMIN);
  redirect("/admin/login");
}
