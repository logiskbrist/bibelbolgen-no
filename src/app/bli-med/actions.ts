"use server";

import { revalidatePath } from "next/cache";
import {
  joinGroupWithInvite,
  joinPublicGroup,
} from "~/server/memberships/actions";

export type RegisterFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  groupName?: string;
  groupSlug?: string;
};

const initialErrorState = {
  status: "error",
} satisfies Pick<RegisterFormState, "status">;

function booleanFromForm(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

export async function joinPublicGroupAction(
  _previousState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const result = await joinPublicGroup({
      email: String(formData.get("email") ?? ""),
      emailOptIn: booleanFromForm(formData.get("emailOptIn")),
      groupSlug: String(formData.get("groupSlug") ?? ""),
      name: String(formData.get("name") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      smsOptIn: booleanFromForm(formData.get("smsOptIn")),
    });

    revalidatePath("/grupper");
    revalidatePath(`/grupper/${result.group.slug}`);

    return {
      status: "success",
      groupName: result.group.name,
      groupSlug: result.group.slug,
      message: `Velkommen til ${result.group.name}.`,
    };
  } catch (error) {
    return {
      ...initialErrorState,
      message:
        error instanceof Error
          ? error.message
          : "Noe gikk galt med påmeldingen.",
    };
  }
}

export async function joinInviteGroupAction(
  _previousState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  try {
    const result = await joinGroupWithInvite({
      email: String(formData.get("email") ?? ""),
      emailOptIn: booleanFromForm(formData.get("emailOptIn")),
      inviteSecret: String(formData.get("inviteSecret") ?? ""),
      name: String(formData.get("name") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      smsOptIn: booleanFromForm(formData.get("smsOptIn")),
    });

    revalidatePath("/grupper");
    revalidatePath(`/grupper/${result.group.slug}`);

    return {
      status: "success",
      groupName: result.group.name,
      groupSlug: result.group.slug,
      message: `Velkommen til ${result.group.name}.`,
    };
  } catch (error) {
    return {
      ...initialErrorState,
      message:
        error instanceof Error
          ? error.message
          : "Noe gikk galt med invitasjonen.",
    };
  }
}
