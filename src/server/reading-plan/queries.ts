import "server-only";

import { getDb } from "~/server/db";

export async function getActiveReadingPlan() {
  return getDb().readingPlan.findFirst({
    orderBy: { createdAt: "desc" },
    where: { active: true },
  });
}

export async function getActiveReadingPlanWithSections() {
  return getDb().readingPlan.findFirst({
    include: {
      _count: {
        select: { days: true, groups: true },
      },
      sections: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    where: { active: true },
  });
}

export async function requireActiveReadingPlan() {
  const plan = await getActiveReadingPlan();

  if (!plan) {
    throw new Error("Ingen aktiv leseplan er satt opp.");
  }

  return plan;
}

export async function listReadingPlanDays(planId: string) {
  return getDb().readingPlanDay.findMany({
    include: { section: true },
    orderBy: { dayNumber: "asc" },
    where: { planId },
  });
}

export async function getReadingPlanDay(planId: string, dayNumber: number) {
  return getDb().readingPlanDay.findUnique({
    include: { section: true },
    where: {
      planId_dayNumber: {
        dayNumber,
        planId,
      },
    },
  });
}
