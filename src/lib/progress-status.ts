import type { ProgressStatus } from "~/components/ui";

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
