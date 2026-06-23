import "server-only";

import { z } from "zod";
import { requireGroupAdmin } from "~/server/auth/permissions";
import { getDb } from "~/server/db";
import {
  MembershipStatus,
  MessageChannel,
} from "../../../generated/prisma/client";
import { sendEmailBatch } from "./email";
import { sendSmsBatch } from "./sms";

const dispatchInputSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  channel: z.enum(MessageChannel),
  groupId: z.string().min(1),
  subject: z.string().trim().max(200).optional(),
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
  const providerBatchId =
    input.channel === MessageChannel.SMS
      ? await sendSmsBatch({
          body: input.body,
          recipients: memberships
            .filter((membership) => membership.smsOptIn)
            .map((membership) => ({
              name: membership.user.name,
              phoneNumber: membership.user.phoneNumber,
            })),
        })
      : await sendEmailBatch({
          body: input.body,
          recipients: memberships
            .filter((membership) => membership.emailOptIn)
            .map((membership) => ({
              email: membership.user.email,
              name: membership.user.name,
            })),
          subject: input.subject ?? "Oppdatering fra Bibelbølgen",
        });
  const recipientCount =
    input.channel === MessageChannel.SMS
      ? memberships.filter((membership) => membership.smsOptIn).length
      : memberships.filter((membership) => membership.emailOptIn).length;

  return getDb().messageDispatch.create({
    data: {
      channel: input.channel,
      groupId: input.groupId,
      providerBatchId,
      recipientCount,
      sentByUserId: adminUserId,
    },
  });
}
