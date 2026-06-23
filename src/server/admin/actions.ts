import "server-only";

import { z } from "zod";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import { GroupAdminRole } from "../../../generated/prisma/client";

const adminUserInputSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(2).max(160),
  phoneNumber: z.string().trim().min(6).max(32),
});

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

async function upsertUserForAdmin(input: z.infer<typeof adminUserInputSchema>) {
  return getDb().user.upsert({
    create: {
      email: input.email,
      name: input.name,
      phoneNumber: normalizePhoneNumber(input.phoneNumber),
    },
    update: {
      email: input.email,
      name: input.name,
    },
    where: {
      phoneNumber: normalizePhoneNumber(input.phoneNumber),
    },
  });
}

export async function addGroupAdmin({
  actorUserId,
  groupId,
  role = GroupAdminRole.ADMIN,
  user,
  userId,
}: {
  actorUserId: string;
  groupId: string;
  role?: GroupAdminRole;
  user?: z.input<typeof adminUserInputSchema>;
  userId?: string;
}) {
  await requireGroupAdmin(groupId, actorUserId);

  const adminUserId =
    userId ??
    (user
      ? (await upsertUserForAdmin(adminUserInputSchema.parse(user))).id
      : null);

  if (!adminUserId) {
    throw new Error("Du må velge en bruker eller oppgi ny admininfo.");
  }

  return getDb().groupAdmin.upsert({
    create: {
      createdByUserId: actorUserId,
      groupId,
      role,
      userId: adminUserId,
    },
    update: {
      role,
    },
    where: {
      groupId_userId: {
        groupId,
        userId: adminUserId,
      },
    },
  });
}

export async function removeGroupAdmin({
  actorUserId,
  groupId,
  userId,
}: {
  actorUserId: string;
  groupId: string;
  userId: string;
}) {
  await requireGroupAdmin(groupId, actorUserId);

  const adminCount = await getDb().groupAdmin.count({ where: { groupId } });

  if (adminCount <= 1) {
    throw new Error("Gruppa må ha minst én admin.");
  }

  return getDb().groupAdmin.delete({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });
}
