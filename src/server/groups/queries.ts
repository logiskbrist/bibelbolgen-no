import "server-only";

import {
  canAdminGroup,
  canViewGroup,
  isGlobalAdmin,
  requireGroupAdmin,
} from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import {
  calculateAverageMemberDay,
  calculateGroupDay,
} from "~/server/reading-plan/progress";
import {
  GroupStatus,
  GroupVisibility,
  MembershipStatus,
} from "../../../generated/prisma/client";

type ProgressEventForCalculation = NonNullable<
  Parameters<typeof calculateGroupDay>[0]["progressEvents"]
>[number];

function withComputedProgress<
  T extends {
    progressEvents: {
      dayNumber: number | null;
      effectiveOn: Date;
      type: ProgressEventForCalculation["type"];
    }[];
    memberships?: {
      checkIns: {
        checkedInAt: Date;
        forDate: Date | null;
        reportedDayNumber: number | null;
      }[];
    }[];
    readingPlan: { totalDays: number };
    startsOn: Date;
    timeZone: string;
  },
>(group: T) {
  const memberProgress = group.memberships
    ? calculateAverageMemberDay({
        memberships: group.memberships,
        timeZone: group.timeZone,
        totalDays: group.readingPlan.totalDays,
      })
    : null;

  return {
    ...group,
    memberProgress,
    progress: calculateGroupDay({
      progressEvents: group.progressEvents,
      startsOn: group.startsOn,
      timeZone: group.timeZone,
      totalDays: group.readingPlan.totalDays,
    }),
  };
}

export async function getPublicPlatformSummary() {
  const db = getDb();

  const [groupCount, memberCount] = await Promise.all([
    db.group.count({
      where: {
        status: GroupStatus.ACTIVE,
        visibility: GroupVisibility.PUBLIC,
      },
    }),
    db.groupMembership.count({
      where: {
        group: { status: GroupStatus.ACTIVE },
        status: MembershipStatus.ACTIVE,
      },
    }),
  ]);

  return { groupCount, memberCount };
}

export async function listPublicGroups() {
  const groups = await getDb().group.findMany({
    include: {
      _count: {
        select: {
          memberships: { where: { status: MembershipStatus.ACTIVE } },
        },
      },
      memberships: {
        select: {
          checkIns: {
            orderBy: { checkedInAt: "desc" },
            select: {
              checkedInAt: true,
              forDate: true,
              reportedDayNumber: true,
            },
            take: 1,
          },
          id: true,
        },
        where: { status: MembershipStatus.ACTIVE },
      },
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: true,
    },
    orderBy: { createdAt: "desc" },
    where: {
      status: GroupStatus.ACTIVE,
      visibility: GroupVisibility.PUBLIC,
    },
  });

  return groups.map(withComputedProgress);
}

export async function listPublicGroupTimelineEntries() {
  const groups = await getDb().group.findMany({
    include: {
      _count: {
        select: {
          memberships: { where: { status: MembershipStatus.ACTIVE } },
        },
      },
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: {
        select: { totalDays: true },
      },
    },
    orderBy: { createdAt: "desc" },
    where: {
      status: GroupStatus.ACTIVE,
    },
  });

  return groups.map((group) => {
    const progress = calculateGroupDay({
      progressEvents: group.progressEvents,
      startsOn: group.startsOn,
      timeZone: group.timeZone,
      totalDays: group.readingPlan.totalDays,
    });

    return {
      day: progress.currentDay,
      href:
        group.visibility === GroupVisibility.PUBLIC
          ? `/grupper/${group.slug}`
          : null,
      id: group.id,
      members: group._count.memberships,
      name: group.name,
      totalDays: progress.totalDays,
    };
  });
}

export async function getGroupBySlugForViewer(
  slug: string,
  viewerUserId?: string,
) {
  const db = getDb();
  const group = await getDb().group.findUnique({
    include: {
      _count: {
        select: {
          memberships: { where: { status: MembershipStatus.ACTIVE } },
        },
      },
      memberships: {
        select: {
          checkIns: {
            orderBy: { checkedInAt: "desc" },
            select: {
              checkedInAt: true,
              forDate: true,
              reportedDayNumber: true,
            },
            take: 1,
          },
          id: true,
        },
        where: { status: MembershipStatus.ACTIVE },
      },
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: {
        include: {
          days: { orderBy: { dayNumber: "asc" } },
          sections: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    where: { slug },
  });

  if (!group || !(await canViewGroup(group.id, viewerUserId))) {
    return null;
  }

  const canSeeMemberDetails = viewerUserId
    ? await canAdminGroup(group.id, viewerUserId)
    : false;
  const viewerMembership = viewerUserId
    ? await db.groupMembership.findUnique({
        select: { status: true },
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: viewerUserId,
          },
        },
      })
    : null;

  return {
    ...withComputedProgress(group),
    canSeeMemberDetails,
    viewerMembershipStatus: viewerMembership?.status ?? null,
  };
}

export async function getAdminGroupBySlug(slug: string, adminUserId: string) {
  const group = await getDb().group.findUnique({
    include: {
      admins: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
      memberships: {
        include: {
          checkIns: {
            orderBy: { checkedInAt: "desc" },
            take: 1,
          },
          user: true,
        },
        orderBy: { joinedAt: "asc" },
        where: { status: MembershipStatus.ACTIVE },
      },
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: true,
    },
    where: { slug },
  });

  if (!group) {
    return null;
  }

  await requireGroupAdmin(group.id, adminUserId);
  return withComputedProgress(group);
}

export async function listGroupsForAdmin(
  adminUserId: string,
  options: { search?: string } = {},
) {
  const isGlobal = await isGlobalAdmin(adminUserId);
  const search = options.search?.trim();
  const where = isGlobal
    ? search
      ? {
          OR: [
            { name: { contains: search } },
            {
              admins: {
                some: {
                  user: {
                    name: { contains: search },
                  },
                },
              },
            },
          ],
        }
      : {}
    : {
        admins: {
          some: {
            userId: adminUserId,
          },
        },
      };

  const groups = await getDb().group.findMany({
    include: {
      _count: {
        select: {
          memberships: { where: { status: MembershipStatus.ACTIVE } },
        },
      },
      admins: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      memberships: {
        select: {
          checkIns: {
            orderBy: { checkedInAt: "desc" },
            select: {
              checkedInAt: true,
              forDate: true,
              reportedDayNumber: true,
            },
            take: 1,
          },
          id: true,
        },
        where: { status: MembershipStatus.ACTIVE },
      },
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: true,
    },
    orderBy: { createdAt: "desc" },
    where,
  });

  return groups.map(withComputedProgress);
}
