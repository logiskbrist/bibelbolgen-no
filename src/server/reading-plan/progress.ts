import "server-only";

import { ProgressEventType } from "../../../generated/prisma/client";

type ProgressEvent = {
  type: ProgressEventType;
  effectiveOn: Date;
  dayNumber: number | null;
};

type MemberProgressCheckIn = {
  checkedInAt: Date;
  forDate: Date | null;
  reportedDayNumber: number | null;
};

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(timeZone: string) {
  const cached = dateFormatterCache.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });

  dateFormatterCache.set(timeZone, formatter);
  return formatter;
}

export function dateKeyForTimeZone(date: Date, timeZone: string) {
  const parts = getDateFormatter(timeZone).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not format date for timezone.");
  }

  return `${year}-${month}-${day}`;
}

function dateOnlyUtc(date: Date, timeZone: string) {
  const [year, month, day] = dateKeyForTimeZone(date, timeZone)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    throw new Error("Could not convert date to calendar day.");
  }

  return Date.UTC(year, month - 1, day);
}

function calendarDaysBetween(start: Date, end: Date, timeZone: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor(
    (dateOnlyUtc(end, timeZone) - dateOnlyUtc(start, timeZone)) /
      millisecondsPerDay,
  );
}

function clampDay(dayNumber: number, totalDays: number) {
  return Math.max(0, Math.min(totalDays, dayNumber));
}

function countPausedDays({
  events,
  from,
  to,
  timeZone,
}: {
  events: ProgressEvent[];
  from: Date;
  to: Date;
  timeZone: string;
}) {
  let pausedFrom: Date | null = null;
  let pausedDays = 0;

  for (const event of events) {
    if (event.effectiveOn < from || event.effectiveOn > to) {
      continue;
    }

    if (event.type === ProgressEventType.PAUSE_START && !pausedFrom) {
      pausedFrom = event.effectiveOn;
    }

    if (event.type === ProgressEventType.PAUSE_END && pausedFrom) {
      pausedDays += Math.max(
        0,
        calendarDaysBetween(pausedFrom, event.effectiveOn, timeZone),
      );
      pausedFrom = null;
    }
  }

  if (pausedFrom) {
    pausedDays += Math.max(0, calendarDaysBetween(pausedFrom, to, timeZone));
  }

  return pausedDays;
}

export function calculateGroupDay({
  startsOn,
  totalDays,
  timeZone,
  progressEvents = [],
  now = new Date(),
}: {
  startsOn: Date;
  totalDays: number;
  timeZone: string;
  progressEvents?: ProgressEvent[];
  now?: Date;
}) {
  const orderedEvents = [...progressEvents].sort(
    (a, b) => a.effectiveOn.getTime() - b.effectiveOn.getTime(),
  );
  const relevantEvents = orderedEvents.filter(
    (event) => event.effectiveOn <= now,
  );
  const latestSetDay = [...relevantEvents]
    .reverse()
    .find(
      (event) =>
        event.type === ProgressEventType.SET_DAY &&
        typeof event.dayNumber === "number",
    );

  const baselineDate = latestSetDay?.effectiveOn ?? startsOn;
  const baselineDay = latestSetDay?.dayNumber ?? 1;
  const daysSinceBaseline = calendarDaysBetween(baselineDate, now, timeZone);
  const pausedDays = countPausedDays({
    events: relevantEvents,
    from: baselineDate,
    timeZone,
    to: now,
  });
  const currentDay = clampDay(
    baselineDay + daysSinceBaseline - pausedDays,
    totalDays,
  );

  return {
    currentDay,
    percent: Math.round((currentDay / totalDays) * 100),
    totalDays,
  };
}

export function calculateMemberDay({
  checkIn,
  now = new Date(),
  timeZone,
  totalDays,
}: {
  checkIn: MemberProgressCheckIn;
  now?: Date;
  timeZone: string;
  totalDays: number;
}) {
  if (typeof checkIn.reportedDayNumber !== "number") {
    return null;
  }

  const baselineDate = checkIn.forDate ?? checkIn.checkedInAt;
  const daysSinceBaseline = calendarDaysBetween(baselineDate, now, timeZone);

  return clampDay(checkIn.reportedDayNumber + daysSinceBaseline, totalDays);
}

export function calculateLatestMemberDay({
  checkIns,
  now = new Date(),
  timeZone,
  totalDays,
}: {
  checkIns: MemberProgressCheckIn[];
  now?: Date;
  timeZone: string;
  totalDays: number;
}) {
  const latestCheckIn = [...checkIns]
    .sort((a, b) => b.checkedInAt.getTime() - a.checkedInAt.getTime())
    .find((checkIn) => typeof checkIn.reportedDayNumber === "number");

  if (!latestCheckIn) {
    return null;
  }

  return calculateMemberDay({
    checkIn: latestCheckIn,
    now,
    timeZone,
    totalDays,
  });
}

export function calculateAverageMemberDay({
  memberships,
  now = new Date(),
  timeZone,
  totalDays,
}: {
  memberships: { checkIns: MemberProgressCheckIn[] }[];
  now?: Date;
  timeZone: string;
  totalDays: number;
}) {
  const memberDays = memberships
    .map((membership) =>
      calculateLatestMemberDay({
        checkIns: membership.checkIns,
        now,
        timeZone,
        totalDays,
      }),
    )
    .filter((day): day is number => typeof day === "number");

  if (memberDays.length === 0) {
    return {
      averageDay: null,
      reportingMemberCount: 0,
    };
  }

  const averageDay =
    memberDays.reduce((sum, day) => sum + day, 0) / memberDays.length;

  return {
    averageDay: Math.round(averageDay * 10) / 10,
    reportingMemberCount: memberDays.length,
  };
}
