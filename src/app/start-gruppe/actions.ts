"use server";

import { revalidatePath } from "next/cache";
import { createAuthSession } from "~/server/auth/sessions";
import { createGroupWithStarter } from "~/server/groups/actions";
import { createGroupInvite } from "~/server/groups/invites";
import { GroupVisibility, SessionKind } from "../../../generated/prisma/client";

export type StartGroupFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  groupName?: string;
  groupSlug?: string;
  inviteCode?: string | null;
  inviteHref?: string | null;
};

function booleanFromForm(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

export async function startGroupAction(
  _previousState: StartGroupFormState,
  formData: FormData,
): Promise<StartGroupFormState> {
  try {
    const contactOptIn = booleanFromForm(formData.get("contactOptIn"));
    const { group, user } = await createGroupWithStarter({
      city: String(formData.get("city") ?? ""),
      description: String(formData.get("description") ?? ""),
      email: String(formData.get("email") ?? ""),
      emailOptIn: contactOptIn,
      name: String(formData.get("name") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      smsOptIn: contactOptIn,
      startsOn: String(formData.get("startsOn") ?? ""),
      timeZone: "Europe/Oslo",
      visibility:
        String(formData.get("visibility")) === GroupVisibility.PRIVATE
          ? GroupVisibility.PRIVATE
          : GroupVisibility.PUBLIC,
    });
    const invite =
      group.visibility === GroupVisibility.PRIVATE
        ? await createGroupInvite({
            adminUserId: user.id,
            groupId: group.id,
          })
        : null;

    await createAuthSession({
      kind: SessionKind.MEMBER_DEVICE,
      userId: user.id,
    });

    revalidatePath("/grupper");
    revalidatePath("/bli-med");
    revalidatePath(`/grupper/${group.slug}`);

    return {
      status: "success",
      groupName: group.name,
      groupSlug: group.slug,
      inviteCode: invite?.code ?? null,
      inviteHref: invite ? `/invitasjon/${invite.token}` : null,
      message: `${group.name} er opprettet.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Noe gikk galt da gruppa skulle opprettes.",
    };
  }
}
