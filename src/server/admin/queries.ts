import "server-only";

import { requireGlobalAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import { calculateGroupDay } from "~/server/reading-plan/progress";
import {
  GroupStatus,
  GroupVisibility,
  MembershipStatus,
} from "../../../generated/prisma/client";

export async function getGlobalAdminSummary(adminUserId: string) {
  await requireGlobalAdmin(adminUserId);

  const db = getDb();
  const [
    groupCount,
    publicGroupCount,
    privateGroupCount,
    activeMemberCount,
    messageDispatchCount,
  ] = await Promise.all([
    db.group.count(),
    db.group.count({ where: { visibility: GroupVisibility.PUBLIC } }),
    db.group.count({ where: { visibility: GroupVisibility.PRIVATE } }),
    db.groupMembership.count({ where: { status: MembershipStatus.ACTIVE } }),
    db.messageDispatch.count(),
  ]);

  return {
    activeMemberCount,
    groupCount,
    messageDispatchCount,
    privateGroupCount,
    publicGroupCount,
  };
}

export async function listAllGroupsForGlobalAdmin(adminUserId: string) {
  await requireGlobalAdmin(adminUserId);

  const groups = await getDb().group.findMany({
    include: {
      _count: {
        select: {
          admins: true,
          memberships: { where: { status: MembershipStatus.ACTIVE } },
        },
      },
      progressEvents: { orderBy: { effectiveOn: "asc" } },
      readingPlan: true,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return groups.map((group) => ({
    ...group,
    isActive: group.status === GroupStatus.ACTIVE,
    progress: calculateGroupDay({
      progressEvents: group.progressEvents,
      startsOn: group.startsOn,
      timeZone: group.timeZone,
      totalDays: group.readingPlan.totalDays,
    }),
  }));
}

export async function listUsersForGlobalAdmin(adminUserId: string) {
  await requireGlobalAdmin(adminUserId);

  return getDb().user.findMany({
    include: {
      _count: {
        select: {
          adminAssignments: true,
          memberships: true,
        },
      },
      adminAssignments: {
        include: {
          group: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
