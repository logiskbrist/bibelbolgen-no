import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "~/server/db";
import { SessionKind } from "../../../generated/prisma/client";

export const MEMBER_SESSION_COOKIE = "bb_member_session";
export const ADMIN_SESSION_COOKIE = "bb_admin_session";

const MEMBER_SESSION_DAYS = 365;
const ADMIN_SESSION_DAYS = 30;

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

function getLowEntropyHashKey() {
  const key =
    process.env.LOW_ENTROPY_SECRET_HASH_KEY ?? process.env.DATABASE_URL;

  if (!key) {
    throw new Error(
      "Missing LOW_ENTROPY_SECRET_HASH_KEY or DATABASE_URL for code hashing.",
    );
  }

  return key;
}

export function hashLowEntropySecret(secret: string) {
  return createHmac("sha256", getLowEntropyHashKey())
    .update(secret)
    .digest("hex");
}

export function secretHashMatches(secret: string, hash: string) {
  const candidateHashes = [hashLowEntropySecret(secret), hashSecret(secret)];

  return candidateHashes.some((candidateHash) => {
    const candidate = Buffer.from(candidateHash, "hex");
    const stored = Buffer.from(hash, "hex");

    return (
      candidate.length === stored.length && timingSafeEqual(candidate, stored)
    );
  });
}

export function getSessionCookieName(kind: SessionKind) {
  return kind === SessionKind.ADMIN
    ? ADMIN_SESSION_COOKIE
    : MEMBER_SESSION_COOKIE;
}

function defaultSessionExpiry(kind: SessionKind) {
  const days =
    kind === SessionKind.ADMIN ? ADMIN_SESSION_DAYS : MEMBER_SESSION_DAYS;

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createAuthSession({
  userId,
  kind = SessionKind.MEMBER_DEVICE,
  expiresAt = defaultSessionExpiry(kind),
}: {
  userId: string;
  kind?: SessionKind;
  expiresAt?: Date;
}) {
  const db = getDb();
  const token = createSessionToken();
  const tokenHash = hashSecret(token);

  const session = await db.authSession.create({
    data: {
      userId,
      kind,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(kind), token, {
    expires: expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { session, token };
}

export async function getSessionFromCookie(
  kind: SessionKind = SessionKind.MEMBER_DEVICE,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(kind))?.value;

  if (!token) {
    return null;
  }

  const db = getDb();
  const session = await db.authSession.findUnique({
    include: { user: true },
    where: { tokenHash: hashSecret(token) },
  });

  if (
    !session ||
    session.kind !== kind ||
    session.revokedAt ||
    session.expiresAt <= new Date()
  ) {
    return null;
  }

  await db.authSession.update({
    data: { lastUsedAt: new Date() },
    where: { id: session.id },
  });

  return session;
}

export async function revokeSession(kind: SessionKind) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(kind))?.value;

  cookieStore.delete(getSessionCookieName(kind));

  if (!token) {
    return;
  }

  await getDb().authSession.updateMany({
    data: { revokedAt: new Date() },
    where: { tokenHash: hashSecret(token), revokedAt: null },
  });
}
