"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setGroupParticipantRoleAction } from "~/app/admin/grupper/actions";
import { ConfirmDialog } from "~/components/confirm-dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";

type MemberRole = "MEMBER" | "ADMIN" | "OWNER";

export function GroupMemberRoleControl({
  canTransferOwnership,
  currentRole,
  groupId,
  groupSlug,
  isCurrentAdmin,
  userId,
  userName,
}: {
  canTransferOwnership: boolean;
  currentRole: MemberRole;
  groupId: string;
  groupSlug: string;
  isCurrentAdmin: boolean;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [roleToConfirm, setRoleToConfirm] = useState<MemberRole | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitRole(role: MemberRole) {
    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("groupSlug", groupSlug);
    formData.set("role", role);
    formData.set("userId", userId);

    startTransition(async () => {
      await setGroupParticipantRoleAction(formData);
      setSelectedRole(role);
      setRoleToConfirm(null);
      router.refresh();
    });
  }

  if (currentRole === "OWNER") {
    return (
      <span className="font-semibold text-forest-900/55 text-sm">Admin</span>
    );
  }

  return (
    <>
      <NativeSelect
        aria-label={`Rolle for ${userName}`}
        className="w-32 bg-surface text-left"
        disabled={isPending}
        onChange={(event) => {
          const nextRole = event.target.value as MemberRole;

          if (nextRole === selectedRole) {
            return;
          }

          if (nextRole === "OWNER") {
            setRoleToConfirm(nextRole);
            return;
          }

          if (
            nextRole === "MEMBER" &&
            isCurrentAdmin &&
            selectedRole === "ADMIN"
          ) {
            setRoleToConfirm(nextRole);
            return;
          }

          submitRole(nextRole);
        }}
        value={selectedRole}
      >
        <NativeSelectOption value="MEMBER">Deltaker</NativeSelectOption>
        <NativeSelectOption value="ADMIN">Admin</NativeSelectOption>
        {canTransferOwnership && selectedRole === "ADMIN" && (
          <NativeSelectOption value="OWNER">Eier</NativeSelectOption>
        )}
      </NativeSelect>

      {roleToConfirm && (
        <ConfirmDialog
          description={
            roleToConfirm === "OWNER"
              ? "Hvis du fortsetter mister du eierrollen og blir admin. Dette kan bare endres av den nye eieren."
              : "Hvis du fortsetter mister du admintilgangen til gruppa og blir sendt til hovedsiden."
          }
          isPending={isPending}
          onCancel={() => setRoleToConfirm(null)}
          onConfirm={() => submitRole(roleToConfirm)}
          pendingLabel="Endrer ..."
          title={
            roleToConfirm === "OWNER"
              ? `Gjøre ${userName} til eier?`
              : "Bli deltaker?"
          }
        />
      )}
    </>
  );
}
