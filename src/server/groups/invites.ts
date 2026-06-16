import "server-only";

import { randomBytes, randomInt } from "node:crypto";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { hashSecret } from "~/server/auth/sessions";
import { getDb } from "~/server/db";

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
      codeHash: code ? hashSecret(code) : null,
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

export async function findActiveInviteBySecret(secret: string) {
  const secretHash = hashSecret(secret.trim());
  const invite = await getDb().groupInvite.findFirst({
    include: { group: true },
    where: {
      OR: [{ tokenHash: secretHash }, { codeHash: secretHash }],
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

export async function consumeInvite(inviteId: string) {
  return getDb().groupInvite.update({
    data: {
      usedCount: {
        increment: 1,
      },
    },
    where: { id: inviteId },
  });
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
