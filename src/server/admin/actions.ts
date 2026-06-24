import "server-only";

import { z } from "zod";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import {
  GroupAdminRole,
  MembershipStatus,
} from "../../../generated/prisma/client";

const participantRoleSchema = z.enum(["MEMBER", "ADMIN", "OWNER"]);

export async function setGroupParticipantRole({
  actorUserId,
  groupId,
  role,
  userId,
}: {
  actorUserId: string;
  groupId: string;
  role: z.input<typeof participantRoleSchema>;
  userId: string;
}) {
  await requireGroupAdmin(groupId, actorUserId);

  const nextRole = participantRoleSchema.parse(role);
  const db = getDb();
  const [targetAssignment, targetMembership] = await Promise.all([
    db.groupAdmin.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    }),
    db.groupMembership.findUnique({
      select: { id: true },
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
        status: MembershipStatus.ACTIVE,
      },
    }),
  ]);

  if (targetAssignment?.role === GroupAdminRole.OWNER) {
    throw new Error("Eier kan ikke endres til deltaker eller admin.");
  }

  if ((nextRole === "ADMIN" || nextRole === "OWNER") && !targetMembership) {
    throw new Error("Bare aktive deltakere kan gjøres til admin eller eier.");
  }

  if (nextRole === "MEMBER") {
    if (!targetAssignment) {
      return null;
    }

    return db.groupAdmin.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  if (nextRole === "ADMIN") {
    return db.groupAdmin.upsert({
      create: {
        createdByUserId: actorUserId,
        groupId,
        role: GroupAdminRole.ADMIN,
        userId,
      },
      update: {
        role: GroupAdminRole.ADMIN,
      },
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  const actorAssignment = await db.groupAdmin.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: actorUserId,
      },
    },
  });

  if (actorAssignment?.role !== GroupAdminRole.OWNER) {
    throw new Error("Bare eier kan gi eierrollen videre.");
  }

  if (targetAssignment?.role !== GroupAdminRole.ADMIN) {
    throw new Error("Bare en eksisterende admin kan gjøres til eier.");
  }

  return db.$transaction([
    db.groupAdmin.updateMany({
      data: { role: GroupAdminRole.ADMIN },
      where: { groupId, role: GroupAdminRole.OWNER },
    }),
    db.groupAdmin.update({
      data: { role: GroupAdminRole.OWNER },
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    }),
  ]);
}
