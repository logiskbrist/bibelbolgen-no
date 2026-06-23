import "server-only";

import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import { MembershipStatus } from "../../../generated/prisma/client";

export async function listGroupMembersForAdmin(
  groupId: string,
  adminUserId: string,
) {
  await requireGroupAdmin(groupId, adminUserId);

  return getDb().groupMembership.findMany({
    include: {
      checkIns: {
        orderBy: { checkedInAt: "desc" },
        take: 1,
      },
      user: true,
    },
    orderBy: { joinedAt: "asc" },
    where: {
      groupId,
      status: MembershipStatus.ACTIVE,
    },
  });
}

export async function getMembershipForUser(groupId: string, userId: string) {
  return getDb().groupMembership.findUnique({
    include: {
      group: true,
      user: true,
    },
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });
}

export async function listActiveMembershipsForUser(userId: string) {
  return getDb().groupMembership.findMany({
    include: {
      group: {
        include: {
          readingPlan: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
    where: {
      status: MembershipStatus.ACTIVE,
      userId,
    },
  });
}
