"use server";

import { revalidatePath } from "next/cache";
import { recordMemberCheckIn } from "~/server/memberships/actions";

export type CheckInFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  reportedDayNumber?: number;
};

export async function recordMemberCheckInAction(
  _previousState: CheckInFormState,
  formData: FormData,
): Promise<CheckInFormState> {
  const groupId = String(formData.get("groupId") ?? "");
  const groupSlug = String(formData.get("groupSlug") ?? "");
  const reportedDayNumber = Number(formData.get("reportedDayNumber"));

  try {
    await recordMemberCheckIn({
      groupId,
      reportedDayNumber,
    });

    if (groupSlug) {
      revalidatePath(`/grupper/${groupSlug}`);
    }

    return {
      status: "success",
      message: `Du er registrert på dag ${reportedDayNumber}.`,
      reportedDayNumber,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Noe gikk galt med tilbakemeldingen.",
    };
  }
}
