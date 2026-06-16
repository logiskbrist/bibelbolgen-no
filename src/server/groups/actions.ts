import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import { requireActiveReadingPlan } from "~/server/reading-plan/queries";
import {
  GroupAdminRole,
  GroupVisibility,
  MembershipJoinSource,
  MembershipStatus,
} from "../../../generated/prisma/client";

const groupInputSchema = z.object({
  city: z.string().trim().max(120).optional(),
  description: z.string().trim().max(5000).optional(),
  name: z.string().trim().min(2).max(160),
  startsOn: z.coerce.date(),
  timeZone: z.string().trim().min(1).max(80).default("Europe/Oslo"),
  visibility: z.enum(GroupVisibility).default(GroupVisibility.PUBLIC),
});

const groupStarterSchema = groupInputSchema.extend({
  email: z.string().trim().email().max(320),
  emailOptIn: z.boolean().default(false),
  ownerName: z.string().trim().min(2).max(160),
  phoneNumber: z.string().trim().min(6).max(32),
  smsOptIn: z.boolean().default(false),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+]/g, "");
}

async function createUniqueGroupSlug(name: string) {
  const db = getDb();
  const baseSlug = slugify(name) || `gruppe-${randomBytes(3).toString("hex")}`;
  let slug = baseSlug;
  let counter = 2;

  while (await db.group.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function upsertGroupStarter({
  email,
  ownerName,
  phoneNumber,
}: {
  email: string;
  ownerName: string;
  phoneNumber: string;
}) {
  return getDb().user.upsert({
    create: {
      email,
      name: ownerName,
      phoneNumber: normalizePhoneNumber(phoneNumber),
    },
    update: {
      email,
      name: ownerName,
    },
    where: {
      phoneNumber: normalizePhoneNumber(phoneNumber),
    },
  });
}

export async function createGroup({
  ownerUserId,
  ...input
}: z.input<typeof groupInputSchema> & {
  ownerUserId: string;
}) {
  const data = groupInputSchema.parse(input);
  const readingPlan = await requireActiveReadingPlan();
  const slug = await createUniqueGroupSlug(data.name);

  return getDb().group.create({
    data: {
      city: data.city,
      createdByUserId: ownerUserId,
      description: data.description,
      name: data.name,
      readingPlanId: readingPlan.id,
      slug,
      startsOn: data.startsOn,
      timeZone: data.timeZone,
      visibility: data.visibility,
      admins: {
        create: {
          role: GroupAdminRole.OWNER,
          userId: ownerUserId,
        },
      },
    },
  });
}

export async function createGroupWithStarter(
  input: z.input<typeof groupStarterSchema>,
) {
  const data = groupStarterSchema.parse(input);
  const readingPlan = await requireActiveReadingPlan();
  const user = await upsertGroupStarter(data);
  const slug = await createUniqueGroupSlug(data.name);
  const now = new Date();

  const group = await getDb().group.create({
    data: {
      city: data.city,
      createdByUserId: user.id,
      description: data.description,
      name: data.name,
      readingPlanId: readingPlan.id,
      slug,
      startsOn: data.startsOn,
      timeZone: data.timeZone,
      visibility: data.visibility,
      admins: {
        create: {
          role: GroupAdminRole.OWNER,
          userId: user.id,
        },
      },
      memberships: {
        create: {
          emailOptIn: data.emailOptIn,
          emailOptInAt: data.emailOptIn ? now : null,
          joinSource: MembershipJoinSource.ADMIN_ADDED,
          smsOptIn: data.smsOptIn,
          smsOptInAt: data.smsOptIn ? now : null,
          status: MembershipStatus.ACTIVE,
          userId: user.id,
        },
      },
    },
  });

  return { group, user };
}

export async function updateGroupBasics({
  adminUserId,
  groupId,
  ...input
}: Partial<z.input<typeof groupInputSchema>> & {
  adminUserId: string;
  groupId: string;
}) {
  await requireGroupAdmin(groupId, adminUserId);

  const data = groupInputSchema.partial().parse(input);

  return getDb().group.update({
    data,
    where: { id: groupId },
  });
}
