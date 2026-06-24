import "server-only";

import type { ProgressStatus } from "~/components/ui";
import { calculateLatestMemberDay } from "~/server/reading-plan/progress";

type ReportedCheckIn = {
  checkedInAt: Date;
  forDate: Date | null;
  reportedDayNumber: number | null;
};

export function statusForProgress(
  currentDay: number | null | undefined,
  expectedDay: number,
): ProgressStatus {
  if (!currentDay || currentDay <= 0) {
    return "not-started";
  }

  const delta = currentDay - expectedDay;

  if (delta >= 4) {
    return "ahead";
  }

  if (delta <= -7) {
    return "behind";
  }

  return "on-track";
}

export function latestReportedDay(
  checkIns: { reportedDayNumber: number | null }[],
) {
  return checkIns[0]?.reportedDayNumber ?? null;
}

export function latestComputedMemberDay({
  checkIns,
  timeZone,
  totalDays,
}: {
  checkIns: ReportedCheckIn[];
  timeZone: string;
  totalDays: number;
}) {
  return calculateLatestMemberDay({
    checkIns,
    timeZone,
    totalDays,
  });
}
