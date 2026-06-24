import "server-only";

import { z } from "zod";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import {
  MembershipStatus,
  MessageChannel,
} from "../../../generated/prisma/client";
import { sendSmsBatch } from "./sms";

const dispatchInputSchema = z.object({
  body: z.string().trim().min(1).max(160),
  channel: z.literal(MessageChannel.SMS),
  groupId: z.string().min(1),
});

export async function sendGroupMessage({
  adminUserId,
  ...rawInput
}: z.input<typeof dispatchInputSchema> & {
  adminUserId: string;
}) {
  const input = dispatchInputSchema.parse(rawInput);

  await requireGroupAdmin(input.groupId, adminUserId);

  const group = await getDb().group.findUnique({
    include: {
      admins: {
        include: { user: true },
      },
      memberships: {
        include: { user: true },
        where: {
          status: MembershipStatus.ACTIVE,
        },
      },
    },
    where: {
      id: input.groupId,
    },
  });

  if (!group) {
    throw new Error("Fant ikke gruppa.");
  }

  const recipientsByPhoneNumber = new Map<
    string,
    { name: string; phoneNumber: string }
  >();

  for (const membership of group.memberships) {
    recipientsByPhoneNumber.set(membership.user.phoneNumber, {
      name: membership.user.name,
      phoneNumber: membership.user.phoneNumber,
    });
  }

  for (const admin of group.admins) {
    recipientsByPhoneNumber.set(admin.user.phoneNumber, {
      name: admin.user.name,
      phoneNumber: admin.user.phoneNumber,
    });
  }

  const recipients = [...recipientsByPhoneNumber.values()];
  const providerBatchId = await sendSmsBatch({
    body: input.body,
    recipients,
  });

  return getDb().messageDispatch.create({
    data: {
      channel: input.channel,
      groupId: input.groupId,
      providerBatchId,
      recipientCount: recipients.length,
      sentByUserId: adminUserId,
    },
  });
}
