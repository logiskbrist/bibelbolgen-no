"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteAdminGroupAction } from "~/app/admin/grupper/actions";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { Button } from "~/components/ui/button";

export function DeleteGroupButton({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function deleteGroup() {
    const formData = new FormData();
    formData.set("groupId", groupId);

    startTransition(async () => {
      await deleteAdminGroupAction(formData);
      setIsConfirming(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        aria-label={`Slett ${groupName}`}
        className="text-stone-700 hover:text-stone-700"
        onClick={() => setIsConfirming(true)}
        size="icon"
        title={`Slett ${groupName}`}
        type="button"
        variant="ghost"
      >
        <Trash2 />
      </Button>

      {isConfirming && (
        <ConfirmDialog
          description="Hvis du fortsetter slettes gruppa og alt som hører til den. Dette kan ikke angres."
          isPending={isPending}
          onCancel={() => setIsConfirming(false)}
          onConfirm={deleteGroup}
          pendingLabel="Sletter ..."
          title={`Slette ${groupName}?`}
        />
      )}
    </>
  );
}
