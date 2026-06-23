import "server-only";

import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import { calculateGroupDay } from "~/server/reading-plan/progress";
import { ProgressEventType } from "../../../generated/prisma/client";

export async function getComputedGroupProgress(
  groupId: string,
  now = new Date(),
) {
  const group = await getDb().group.findUnique({
    include: {
      progressEvents: {
        orderBy: { effectiveOn: "asc" },
      },
      readingPlan: true,
    },
    where: { id: groupId },
  });

  if (!group) {
    return null;
  }

  return calculateGroupDay({
    now,
    progressEvents: group.progressEvents,
    startsOn: group.startsOn,
    timeZone: group.timeZone,
    totalDays: group.readingPlan.totalDays,
  });
}

export async function setGroupDay({
  adminUserId,
  dayNumber,
  effectiveOn = new Date(),
  groupId,
  note,
}: {
  adminUserId: string;
  dayNumber: number;
  effectiveOn?: Date;
  groupId: string;
  note?: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  const group = await getDb().group.findUnique({
    include: { readingPlan: true },
    where: { id: groupId },
  });

  if (!group) {
    throw new Error("Fant ikke gruppa.");
  }

  if (dayNumber < 1 || dayNumber > group.readingPlan.totalDays) {
    throw new Error(`Dag må være mellom 1 og ${group.readingPlan.totalDays}.`);
  }

  return getDb().groupProgressEvent.create({
    data: {
      createdByUserId: adminUserId,
      dayNumber,
      effectiveOn,
      groupId,
      note,
      type: ProgressEventType.SET_DAY,
    },
  });
}

export async function pauseGroupProgress({
  adminUserId,
  effectiveOn = new Date(),
  groupId,
  note,
}: {
  adminUserId: string;
  effectiveOn?: Date;
  groupId: string;
  note?: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  return getDb().groupProgressEvent.create({
    data: {
      createdByUserId: adminUserId,
      effectiveOn,
      groupId,
      note,
      type: ProgressEventType.PAUSE_START,
    },
  });
}

export async function resumeGroupProgress({
  adminUserId,
  effectiveOn = new Date(),
  groupId,
  note,
}: {
  adminUserId: string;
  effectiveOn?: Date;
  groupId: string;
  note?: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  return getDb().groupProgressEvent.create({
    data: {
      createdByUserId: adminUserId,
      effectiveOn,
      groupId,
      note,
      type: ProgressEventType.PAUSE_END,
    },
  });
}
