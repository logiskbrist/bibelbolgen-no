import "server-only";

import { z } from "zod";
import { requireActiveMembership } from "~/server/auth/permissions";
import { createAuthSession } from "~/server/auth/sessions";
import { type Database, getDb } from "~/server/db";
import {
  consumeInvite,
  findActiveInviteBySecret,
} from "~/server/groups/invites";
import { calculateGroupDay } from "~/server/reading-plan/progress";
import {
  CheckInStatus,
  GroupStatus,
  GroupVisibility,
  MembershipJoinSource,
  MembershipStatus,
  SessionKind,
} from "../../../generated/prisma/client";

const memberRegistrationSchema = z.object({
  email: z.string().trim().email().max(320),
  emailOptIn: z.boolean().default(false),
  name: z.string().trim().min(2).max(160),
  phoneNumber: z.string().trim().min(6).max(32),
  smsOptIn: z.boolean().default(false),
});

const publicJoinSchema = memberRegistrationSchema.extend({
  groupSlug: z.string().trim().min(1).max(120),
});

const inviteJoinSchema = memberRegistrationSchema.extend({
  inviteSecret: z.string().trim().min(4).max(255),
});

type RegistrationStore = Pick<Database, "groupMembership" | "user">;

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

async function upsertRegisteredUser(
  input: z.infer<typeof memberRegistrationSchema>,
  db: RegistrationStore = getDb(),
) {
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);

  return db.user.upsert({
    create: {
      email: input.email,
      name: input.name,
      phoneNumber,
    },
    update: {
      email: input.email,
      name: input.name,
    },
    where: { phoneNumber },
  });
}

export async function joinPublicGroup(
  rawInput: z.input<typeof publicJoinSchema>,
) {
  const input = publicJoinSchema.parse(rawInput);
  const db = getDb();
  const group = await db.group.findFirst({
    where: {
      slug: input.groupSlug,
      status: GroupStatus.ACTIVE,
      visibility: GroupVisibility.PUBLIC,
    },
  });

  if (!group) {
    throw new Error("Fant ikke en åpen gruppe med denne lenken.");
  }

  const user = await upsertRegisteredUser(input);
  const now = new Date();

  const membership = await db.groupMembership.upsert({
    create: {
      emailOptIn: input.emailOptIn,
      emailOptInAt: input.emailOptIn ? now : null,
      groupId: group.id,
      joinSource: MembershipJoinSource.PUBLIC_SIGNUP,
      smsOptIn: input.smsOptIn,
      smsOptInAt: input.smsOptIn ? now : null,
      userId: user.id,
    },
    update: {
      emailOptIn: input.emailOptIn,
      emailOptInAt: input.emailOptIn ? now : null,
      emailOptedOutAt: input.emailOptIn ? null : now,
      joinedAt: now,
      joinSource: MembershipJoinSource.PUBLIC_SIGNUP,
      leftAt: null,
      smsOptIn: input.smsOptIn,
      smsOptInAt: input.smsOptIn ? now : null,
      smsOptedOutAt: input.smsOptIn ? null : now,
      status: MembershipStatus.ACTIVE,
    },
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: user.id,
      },
    },
  });

  await createAuthSession({
    kind: SessionKind.MEMBER_DEVICE,
    userId: user.id,
  });

  return { group, membership, user };
}

export async function joinGroupWithInvite(
  rawInput: z.input<typeof inviteJoinSchema>,
) {
  const input = inviteJoinSchema.parse(rawInput);
  const now = new Date();
  const result = await getDb().$transaction(async (tx) => {
    const invite = await findActiveInviteBySecret(input.inviteSecret, tx);

    if (!invite) {
      throw new Error("Invitasjonen er ugyldig eller utløpt.");
    }

    const consumed = await consumeInvite(invite.id, tx, now);

    if (!consumed) {
      throw new Error("Invitasjonen er brukt opp.");
    }

    const user = await upsertRegisteredUser(input, tx);

    const membership = await tx.groupMembership.upsert({
      create: {
        emailOptIn: input.emailOptIn,
        emailOptInAt: input.emailOptIn ? now : null,
        groupId: invite.groupId,
        joinSource: MembershipJoinSource.INVITE_TOKEN,
        smsOptIn: input.smsOptIn,
        smsOptInAt: input.smsOptIn ? now : null,
        userId: user.id,
      },
      update: {
        emailOptIn: input.emailOptIn,
        emailOptInAt: input.emailOptIn ? now : null,
        emailOptedOutAt: input.emailOptIn ? null : now,
        joinedAt: now,
        joinSource: MembershipJoinSource.INVITE_TOKEN,
        leftAt: null,
        smsOptIn: input.smsOptIn,
        smsOptInAt: input.smsOptIn ? now : null,
        smsOptedOutAt: input.smsOptIn ? null : now,
        status: MembershipStatus.ACTIVE,
      },
      where: {
        groupId_userId: {
          groupId: invite.groupId,
          userId: user.id,
        },
      },
    });

    return { group: invite.group, membership, user };
  });

  await createAuthSession({
    kind: SessionKind.MEMBER_DEVICE,
    userId: result.user.id,
  });

  return result;
}

export async function recordMemberCheckIn({
  forDate,
  groupId,
  note,
  reportedDayNumber,
  userId,
}: {
  forDate?: Date;
  groupId: string;
  note?: string;
  reportedDayNumber: number;
  userId?: string;
}) {
  const membership = await requireActiveMembership(groupId, userId);
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
    throw new Error("Fant ikke gruppa.");
  }

  if (
    !Number.isInteger(reportedDayNumber) ||
    reportedDayNumber < 0 ||
    reportedDayNumber > group.readingPlan.totalDays
  ) {
    throw new Error(`Dag må være mellom 0 og ${group.readingPlan.totalDays}.`);
  }

  const groupProgress = calculateGroupDay({
    progressEvents: group.progressEvents,
    startsOn: group.startsOn,
    timeZone: group.timeZone,
    totalDays: group.readingPlan.totalDays,
  });
  const status =
    reportedDayNumber < groupProgress.currentDay - 1
      ? CheckInStatus.BEHIND
      : reportedDayNumber > groupProgress.currentDay + 1
        ? CheckInStatus.AHEAD
        : CheckInStatus.ON_TRACK;
  const reportedPlanDay = await getDb().readingPlanDay.findUnique({
    select: { id: true },
    where: {
      planId_dayNumber: {
        dayNumber: reportedDayNumber,
        planId: group.readingPlanId,
      },
    },
  });

  return getDb().memberCheckIn.create({
    data: {
      forDate,
      groupDaySnapshot: groupProgress.currentDay,
      groupId,
      membershipId: membership.id,
      note,
      reportedDayNumber,
      reportedPlanDayId: reportedPlanDay?.id,
      status,
      userId: membership.userId,
    },
  });
}
