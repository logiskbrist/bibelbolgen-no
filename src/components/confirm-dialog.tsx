"use client";

import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

export function ConfirmDialog({
  confirmLabel,
  description,
  isPending,
  pendingLabel,
  title,
  onCancel,
  onConfirm,
}: {
  confirmLabel?: string;
  description: ReactNode;
  isPending: boolean;
  pendingLabel: string;
  title: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-ink/35 px-4">
      <div className="w-full max-w-md rounded-lg border border-forest-900/10 bg-paper p-6 text-left">
        <p className="font-black font-display text-2xl text-forest-900 leading-tight">
          {title}
        </p>
        <p className="bb-muted mt-3 font-medium text-sm leading-6">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            className="bg-red-100 text-red-700 hover:bg-red-200"
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            Avbryt
          </Button>
          <Button
            className="bg-sage-100 text-forest-900 hover:bg-sage-200"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="secondary"
          >
            {isPending ? pendingLabel : (confirmLabel ?? "Jeg er sikker")}
          </Button>
        </div>
      </div>
    </div>
  );
}
