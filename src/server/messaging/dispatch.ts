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

  const memberships = await getDb().groupMembership.findMany({
    include: { user: true },
    where: {
      groupId: input.groupId,
      status: MembershipStatus.ACTIVE,
    },
  });
  const recipients = memberships
    .filter((membership) => membership.smsOptIn)
    .map((membership) => ({
      name: membership.user.name,
      phoneNumber: membership.user.phoneNumber,
    }));
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
