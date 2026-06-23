import "server-only";

import { randomBytes, randomInt } from "node:crypto";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { hashLowEntropySecret, hashSecret } from "~/server/auth/sessions";
import { type Database, getDb } from "~/server/db";

type InviteStore = Pick<Database, "groupInvite">;

function createInviteToken() {
  return randomBytes(24).toString("base64url");
}

function createInviteCode() {
  return randomInt(100000, 1000000).toString();
}

export async function createGroupInvite({
  adminUserId,
  createShortCode = true,
  expiresAt,
  groupId,
  maxUses,
}: {
  adminUserId: string;
  createShortCode?: boolean;
  expiresAt?: Date;
  groupId: string;
  maxUses?: number;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  const token = createInviteToken();
  const code = createShortCode ? createInviteCode() : null;

  const invite = await getDb().groupInvite.create({
    data: {
      codeHash: code ? hashLowEntropySecret(code) : null,
      createdByUserId: adminUserId,
      expiresAt,
      groupId,
      maxUses,
      tokenHash: hashSecret(token),
    },
  });

  return {
    code,
    invite,
    token,
  };
}

export async function findActiveInviteBySecret(
  secret: string,
  db: InviteStore = getDb(),
) {
  const trimmedSecret = secret.trim();
  const tokenHash = hashSecret(trimmedSecret);
  const codeHash = hashLowEntropySecret(trimmedSecret);
  const invite = await db.groupInvite.findFirst({
    include: { group: true },
    where: {
      OR: [{ tokenHash }, { codeHash }, { codeHash: tokenHash }],
      revokedAt: null,
    },
  });

  if (!invite) {
    return null;
  }

  if (invite.expiresAt && invite.expiresAt <= new Date()) {
    return null;
  }

  if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
    return null;
  }

  return invite;
}

export async function listGroupInvitesForAdmin({
  adminUserId,
  groupId,
}: {
  adminUserId: string;
  groupId: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  return getDb().groupInvite.findMany({
    include: {
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
    where: {
      groupId,
      revokedAt: null,
    },
  });
}

export async function consumeInvite(
  inviteId: string,
  db: InviteStore = getDb(),
  now = new Date(),
) {
  const result = await db.groupInvite.updateMany({
    data: {
      usedCount: {
        increment: 1,
      },
    },
    where: {
      AND: [
        {
          OR: [
            { maxUses: null },
            { usedCount: { lt: db.groupInvite.fields.maxUses } },
          ],
        },
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      ],
      id: inviteId,
      revokedAt: null,
    },
  });

  return result.count > 0;
}

export async function revokeGroupInvite({
  adminUserId,
  groupId,
  inviteId,
}: {
  adminUserId: string;
  groupId: string;
  inviteId: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  return getDb().groupInvite.update({
    data: { revokedAt: new Date() },
    where: { id: inviteId },
  });
}
