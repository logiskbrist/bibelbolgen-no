/**
 * In-memory dummy data for design/visualisation.
 *
 * This is intentionally NOT wired to the database. The goal at this stage is to
 * see how the pages look and feel so we can iterate on the design. When the data
 * model is settled we can mirror these shapes in Prisma.
 */

/** Total length of the reading plan (~5 months). */
export const PLAN_TOTAL_DAYS = 150;

/**
 * Fixed "today" so the mock progress numbers stay stable regardless of when the
 * page is rendered. Matches the project's working date.
 */
export const REFERENCE_DATE = new Date("2026-06-13T00:00:00");

/** Milestones along the New Testament reading plan, keyed by plan day. */
export const PLAN_MILESTONES = [
  { day: 0, label: "Matteus" },
  { day: 21, label: "Markus" },
  { day: 35, label: "Lukas" },
  { day: 56, label: "Johannes" },
  { day: 74, label: "Apostlenes gjerninger" },
  { day: 95, label: "Paulus' brev" },
  { day: 128, label: "De øvrige brev" },
  { day: 144, label: "Åpenbaringen" },
  { day: 150, label: "Fullført" },
] as const;

export type ProgressStatus = "ahead" | "on-track" | "behind" | "not-started";
export type MemberRole = "member" | "local-admin";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
  /** Self-reported reading day. */
  currentDay: number;
  /** When the member last reported their progress. */
  lastCheckIn: string | null;
}

export interface Message {
  id: string;
  channel: "sms" | "email";
  subject?: string;
  body: string;
  sentAt: string;
  sentBy: string;
  recipients: number;
}

export interface Group {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  startDate: string;
  /** The group's agreed collective reading day. */
  currentDay: number;
  meetingRhythm: string;
  members: Member[];
  messages: Message[];
}

export interface GlobalAdmin {
  id: string;
  name: string;
  email: string;
}

export const globalAdmins: GlobalAdmin[] = [
  { id: "ga-1", name: "Sander Eliassen", email: "sander@logiskbrist.no" },
  { id: "ga-2", name: "Ingrid Solberg", email: "ingrid@bibelbolgen.no" },
];

export const groups: Group[] = [
  {
    id: "grp-1",
    slug: "markus-gruppen",
    name: "Markus-gruppen",
    city: "Oslo",
    description:
      "Onsdagsgruppe på Grünerløkka som leser sammen og deler refleksjoner over kaffe.",
    startDate: "2026-02-02",
    currentDay: 131,
    meetingRhythm: "Onsdager kl. 19:00",
    members: [
      {
        id: "m-1",
        name: "Anne Lie",
        phone: "+47 911 22 333",
        email: "anne.lie@example.no",
        role: "local-admin",
        joinedAt: "2026-01-20",
        currentDay: 134,
        lastCheckIn: "2026-06-12",
      },
      {
        id: "m-2",
        name: "Jonas Berg",
        phone: "+47 922 33 444",
        email: "jonas.berg@example.no",
        role: "member",
        joinedAt: "2026-01-22",
        currentDay: 130,
        lastCheckIn: "2026-06-11",
      },
      {
        id: "m-3",
        name: "Mariam Haddad",
        phone: "+47 933 44 555",
        email: "mariam.haddad@example.no",
        role: "member",
        joinedAt: "2026-01-25",
        currentDay: 128,
        lastCheckIn: "2026-06-10",
      },
      {
        id: "m-4",
        name: "Per Kristian Aas",
        phone: "+47 944 55 666",
        email: "pk.aas@example.no",
        role: "member",
        joinedAt: "2026-02-01",
        currentDay: 119,
        lastCheckIn: "2026-06-05",
      },
      {
        id: "m-5",
        name: "Sofie Dahl",
        phone: "+47 955 66 777",
        email: "sofie.dahl@example.no",
        role: "member",
        joinedAt: "2026-02-02",
        currentDay: 133,
        lastCheckIn: "2026-06-12",
      },
    ],
    messages: [
      {
        id: "msg-1",
        channel: "sms",
        body: "Husk samling i kveld kl 19! Vi leser Kolosserbrevet sammen. 🌿",
        sentAt: "2026-06-10T09:15:00",
        sentBy: "Anne Lie",
        recipients: 5,
      },
      {
        id: "msg-2",
        channel: "email",
        subject: "Ukens lesing + refleksjonsspørsmål",
        body: "Hei alle sammen! Her er refleksjonsspørsmålene til denne ukens kapitler ...",
        sentAt: "2026-06-08T20:02:00",
        sentBy: "Anne Lie",
        recipients: 5,
      },
    ],
  },
  {
    id: "grp-2",
    slug: "lukas-laget",
    name: "Lukas-laget",
    city: "Bergen",
    description:
      "Studentgruppe som møtes på lesesalen mellom forelesninger. Lett å henge etter i eksamenstida.",
    startDate: "2026-02-09",
    currentDay: 104,
    meetingRhythm: "Mandager kl. 12:00",
    members: [
      {
        id: "m-6",
        name: "Henrik Vold",
        phone: "+47 966 77 888",
        email: "henrik.vold@example.no",
        role: "local-admin",
        joinedAt: "2026-02-01",
        currentDay: 112,
        lastCheckIn: "2026-06-09",
      },
      {
        id: "m-7",
        name: "Thea Nilsen",
        phone: "+47 977 88 999",
        email: "thea.nilsen@example.no",
        role: "member",
        joinedAt: "2026-02-05",
        currentDay: 98,
        lastCheckIn: "2026-06-03",
      },
      {
        id: "m-8",
        name: "Oliver Sæther",
        phone: "+47 988 99 111",
        email: "oliver.sather@example.no",
        role: "member",
        joinedAt: "2026-02-07",
        currentDay: 88,
        lastCheckIn: "2026-05-28",
      },
      {
        id: "m-9",
        name: "Linnea Moe",
        phone: "+47 999 11 222",
        email: "linnea.moe@example.no",
        role: "member",
        joinedAt: "2026-02-09",
        currentDay: 110,
        lastCheckIn: "2026-06-11",
      },
    ],
    messages: [
      {
        id: "msg-3",
        channel: "sms",
        body: "Vi ligger litt bak nå – ingen stress! Ta igjen 2 dager denne uka, så er vi a jour. 💪",
        sentAt: "2026-06-07T18:30:00",
        sentBy: "Henrik Vold",
        recipients: 4,
      },
    ],
  },
  {
    id: "grp-3",
    slug: "johannes-hus",
    name: "Johannes hus",
    city: "Trondheim",
    description:
      "Husfellesskap som leser i forkant og bruker samlingene til fordypning.",
    startDate: "2026-01-26",
    currentDay: 149,
    meetingRhythm: "Torsdager kl. 20:00",
    members: [
      {
        id: "m-10",
        name: "Ragnhild Foss",
        phone: "+47 901 23 456",
        email: "ragnhild.foss@example.no",
        role: "local-admin",
        joinedAt: "2026-01-15",
        currentDay: 150,
        lastCheckIn: "2026-06-13",
      },
      {
        id: "m-11",
        name: "David Okafor",
        phone: "+47 902 34 567",
        email: "david.okafor@example.no",
        role: "member",
        joinedAt: "2026-01-18",
        currentDay: 150,
        lastCheckIn: "2026-06-12",
      },
      {
        id: "m-12",
        name: "Kristine Lund",
        phone: "+47 903 45 678",
        email: "kristine.lund@example.no",
        role: "member",
        joinedAt: "2026-01-20",
        currentDay: 147,
        lastCheckIn: "2026-06-12",
      },
      {
        id: "m-13",
        name: "Mats Engen",
        phone: "+47 904 56 789",
        email: "mats.engen@example.no",
        role: "member",
        joinedAt: "2026-01-26",
        currentDay: 146,
        lastCheckIn: "2026-06-10",
      },
    ],
    messages: [
      {
        id: "msg-4",
        channel: "email",
        subject: "Vi nærmer oss Åpenbaringen!",
        body: "Snart i mål, alle sammen. Denne uka går vi inn i de siste kapitlene ...",
        sentAt: "2026-06-09T07:45:00",
        sentBy: "Ragnhild Foss",
        recipients: 4,
      },
    ],
  },
  {
    id: "grp-4",
    slug: "paulus-gjengen",
    name: "Paulus-gjengen",
    city: "Stavanger",
    description:
      "Ny gruppe med blandet erfaring. Flere har falt litt bakpå og trenger oppmuntring.",
    startDate: "2026-02-23",
    currentDay: 71,
    meetingRhythm: "Tirsdager kl. 18:30",
    members: [
      {
        id: "m-14",
        name: "Bjørn Tangen",
        phone: "+47 905 67 890",
        email: "bjorn.tangen@example.no",
        role: "local-admin",
        joinedAt: "2026-02-15",
        currentDay: 80,
        lastCheckIn: "2026-06-08",
      },
      {
        id: "m-15",
        name: "Yusuf Demir",
        phone: "+47 906 78 901",
        email: "yusuf.demir@example.no",
        role: "member",
        joinedAt: "2026-02-20",
        currentDay: 64,
        lastCheckIn: "2026-05-30",
      },
      {
        id: "m-16",
        name: "Camilla Holm",
        phone: "+47 907 89 012",
        email: "camilla.holm@example.no",
        role: "member",
        joinedAt: "2026-02-23",
        currentDay: 58,
        lastCheckIn: "2026-05-25",
      },
      {
        id: "m-17",
        name: "Andreas Rød",
        phone: "+47 908 90 123",
        email: "andreas.rod@example.no",
        role: "member",
        joinedAt: "2026-02-25",
        currentDay: 72,
        lastCheckIn: "2026-06-07",
      },
      {
        id: "m-18",
        name: "Selma Aune",
        phone: "+47 909 01 234",
        email: "selma.aune@example.no",
        role: "member",
        joinedAt: "2026-03-01",
        currentDay: 61,
        lastCheckIn: "2026-05-29",
      },
    ],
    messages: [],
  },
  {
    id: "grp-5",
    slug: "apostlene",
    name: "Apostlene",
    city: "Tromsø",
    description: "Helt fersk gruppe som akkurat har startet leseplanen sammen.",
    startDate: "2026-06-01",
    currentDay: 9,
    meetingRhythm: "Søndager kl. 17:00",
    members: [
      {
        id: "m-19",
        name: "Marte Johnsen",
        phone: "+47 910 12 345",
        email: "marte.johnsen@example.no",
        role: "local-admin",
        joinedAt: "2026-05-20",
        currentDay: 11,
        lastCheckIn: "2026-06-12",
      },
      {
        id: "m-20",
        name: "Erik Strand",
        phone: "+47 911 23 456",
        email: "erik.strand@example.no",
        role: "member",
        joinedAt: "2026-05-28",
        currentDay: 8,
        lastCheckIn: "2026-06-11",
      },
      {
        id: "m-21",
        name: "Hanne Wik",
        phone: "+47 912 34 567",
        email: "hanne.wik@example.no",
        role: "member",
        joinedAt: "2026-06-01",
        currentDay: 7,
        lastCheckIn: "2026-06-10",
      },
    ],
    messages: [
      {
        id: "msg-5",
        channel: "sms",
        body: "Velkommen til Apostlene! Vi starter i Matteus i dag. Så glad for å lese sammen med dere. 🙌",
        sentAt: "2026-06-01T08:00:00",
        sentBy: "Marte Johnsen",
        recipients: 3,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days between a date string and the fixed reference "today". */
export function daysSince(dateStr: string): number {
  const date = new Date(`${dateStr}T00:00:00`);
  return Math.floor((REFERENCE_DATE.getTime() - date.getTime()) / MS_PER_DAY);
}

/** Where the plan *expects* you to be, based on when you started. */
export function expectedDay(startDate: string): number {
  return Math.max(0, Math.min(PLAN_TOTAL_DAYS, daysSince(startDate)));
}

export function percentComplete(day: number): number {
  return Math.round((Math.min(day, PLAN_TOTAL_DAYS) / PLAN_TOTAL_DAYS) * 100);
}

/** Human label for which part of the NT a given plan day lands in. */
export function planLabel(day: number): string {
  let label: string = PLAN_MILESTONES[0].label;
  for (const milestone of PLAN_MILESTONES) {
    if (day >= milestone.day) {
      label = milestone.label;
    }
  }
  return label;
}

/** Compare an actual reading day against the expected day. */
export function statusFor(
  currentDay: number,
  expected: number,
): ProgressStatus {
  if (currentDay <= 0) {
    return "not-started";
  }
  const delta = currentDay - expected;
  if (delta >= 4) {
    return "ahead";
  }
  if (delta <= -7) {
    return "behind";
  }
  return "on-track";
}

export const statusMeta: Record<
  ProgressStatus,
  { label: string; tone: "ahead" | "ontrack" | "behind" | "neutral" }
> = {
  ahead: { label: "Foran planen", tone: "ahead" },
  "on-track": { label: "I rute", tone: "ontrack" },
  behind: { label: "Bak planen", tone: "behind" },
  "not-started": { label: "Ikke startet", tone: "neutral" },
};

export function getGroup(slug: string): Group | undefined {
  return groups.find((group) => group.slug === slug);
}

/** Summary numbers used across overview/dashboard pages. */
export function groupSummary(group: Group) {
  const expected = expectedDay(group.startDate);
  const status = statusFor(group.currentDay, expected);
  const memberStatuses = group.members.map((member) =>
    statusFor(member.currentDay, expected),
  );
  return {
    expected,
    status,
    percent: percentComplete(group.currentDay),
    currentLabel: planLabel(group.currentDay),
    memberCount: group.members.length,
    behindCount: memberStatuses.filter((s) => s === "behind").length,
    onTrackCount: memberStatuses.filter(
      (s) => s === "on-track" || s === "ahead",
    ).length,
  };
}

export function platformSummary() {
  const allMembers = groups.flatMap((g) => g.members);
  let behind = 0;
  for (const group of groups) {
    const expected = expectedDay(group.startDate);
    for (const member of group.members) {
      if (statusFor(member.currentDay, expected) === "behind") {
        behind += 1;
      }
    }
  }
  return {
    groupCount: groups.length,
    memberCount: allMembers.length,
    behindCount: behind,
    messageCount: groups.reduce((sum, g) => sum + g.messages.length, 0),
  };
}
