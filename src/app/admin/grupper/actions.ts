"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { setGroupParticipantRole } from "~/server/admin/actions";
import { canAccessAdminPages, requireUser } from "~/server/auth/permissions";
import { createGroup, deleteGroup } from "~/server/groups/actions";
import { createGroupInvite } from "~/server/groups/invites";
import { sendGroupMessage } from "~/server/messaging/dispatch";
import {
  GroupVisibility,
  MessageChannel,
  SessionKind,
} from "../../../../generated/prisma/client";

export type AdminGroupActionState = {
  code?: string | null;
  groupHref?: string | null;
  inviteHref?: string | null;
  message?: string;
  ok?: boolean;
};

const initialErrorState: AdminGroupActionState = {
  ok: false,
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function visibilityValue(formData: FormData) {
  return textValue(formData, "visibility") === GroupVisibility.PRIVATE
    ? GroupVisibility.PRIVATE
    : GroupVisibility.PUBLIC;
}

const groupIdSchema = z.string().trim().min(1);
const participantRoleSchema = z.enum(["MEMBER", "ADMIN", "OWNER"]);

export async function createAdminGroupAction(
  _prevState: AdminGroupActionState,
  formData: FormData,
): Promise<AdminGroupActionState> {
  try {
    const admin = await requireUser(SessionKind.ADMIN);
    const visibility = visibilityValue(formData);
    const group = await createGroup({
      description: textValue(formData, "description") || undefined,
      name: textValue(formData, "name"),
      ownerUserId: admin.id,
      startsOn: textValue(formData, "startsOn"),
      visibility,
    });

    const invite =
      visibility === GroupVisibility.PRIVATE
        ? await createGroupInvite({
            adminUserId: admin.id,
            groupId: group.id,
          })
        : null;

    revalidatePath("/admin");
    revalidatePath("/grupper");
    revalidatePath("/bli-med");

    return {
      code: invite?.code ?? null,
      groupHref: `/admin/grupper/${group.slug}`,
      inviteHref: invite ? `/invitasjon/${invite.token}` : null,
      message: "Gruppa er opprettet.",
      ok: true,
    };
  } catch (error) {
    return {
      ...initialErrorState,
      message:
        error instanceof Error ? error.message : "Kunne ikke opprette gruppa.",
    };
  }
}

export async function sendAdminGroupMessageAction(
  _prevState: AdminGroupActionState,
  formData: FormData,
): Promise<AdminGroupActionState> {
  try {
    const admin = await requireUser(SessionKind.ADMIN);
    const groupId = groupIdSchema.parse(textValue(formData, "groupId"));
    const dispatch = await sendGroupMessage({
      adminUserId: admin.id,
      body: textValue(formData, "body"),
      channel: MessageChannel.SMS,
      groupId,
    });

    revalidatePath(`/admin/grupper/${textValue(formData, "groupSlug")}`);

    return {
      message: `Meldingen er sendt til ${dispatch.recipientCount} mottakere. Selve meldingen ble ikke lagret.`,
      ok: true,
    };
  } catch (error) {
    return {
      ...initialErrorState,
      message:
        error instanceof Error ? error.message : "Kunne ikke sende meldingen.",
    };
  }
}

export async function createInviteAction(
  _prevState: AdminGroupActionState,
  formData: FormData,
): Promise<AdminGroupActionState> {
  const groupSlug = textValue(formData, "groupSlug");

  try {
    const admin = await requireUser(SessionKind.ADMIN);
    const groupId = groupIdSchema.parse(textValue(formData, "groupId"));
    const invite = await createGroupInvite({
      adminUserId: admin.id,
      groupId,
    });

    revalidatePath(`/admin/grupper/${groupSlug}/invitasjon`);

    return {
      code: invite.code,
      inviteHref: `/invitasjon/${invite.token}`,
      message: "Ny invitasjon er klar.",
      ok: true,
    };
  } catch (error) {
    return {
      ...initialErrorState,
      message:
        error instanceof Error ? error.message : "Kunne ikke lage invitasjon.",
    };
  }
}

export async function deleteAdminGroupAction(formData: FormData) {
  const admin = await requireUser(SessionKind.ADMIN);
  const groupId = groupIdSchema.parse(textValue(formData, "groupId"));

  await deleteGroup({
    adminUserId: admin.id,
    groupId,
  });

  revalidatePath("/admin");
  revalidatePath("/bli-med");
  revalidatePath("/grupper");
}

export async function setGroupParticipantRoleAction(formData: FormData) {
  const admin = await requireUser(SessionKind.ADMIN);
  const groupId = groupIdSchema.parse(textValue(formData, "groupId"));
  const groupSlug = textValue(formData, "groupSlug");
  const role = participantRoleSchema.parse(textValue(formData, "role"));
  const userId = groupIdSchema.parse(textValue(formData, "userId"));

  await setGroupParticipantRole({
    actorUserId: admin.id,
    groupId,
    role,
    userId,
  });

  revalidatePath(`/admin/grupper/${groupSlug}`);

  if (
    role === "MEMBER" &&
    userId === admin.id &&
    !(await canAccessAdminPages(admin.id))
  ) {
    redirect("/");
  }

  if (role === "MEMBER" && userId === admin.id) {
    redirect("/admin");
  }
}
