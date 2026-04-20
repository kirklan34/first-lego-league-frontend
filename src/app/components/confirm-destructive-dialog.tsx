"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/app/components/button";
import ErrorAlert from "@/app/components/error-alert";
import { parseErrorMessage } from "@/types/errors";

interface ConfirmDestructiveDialogProps {
  readonly title: string;
  readonly description: ReactNode;
  readonly confirmLabel: string;
  readonly pendingLabel: string;
  readonly onConfirm: () => Promise<void>;
  readonly onCancel: () => void;
}

export default function ConfirmDestructiveDialog({
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onCancel,
}: ConfirmDestructiveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Native dialogs give us focus trapping and Escape/backdrop behavior for free.
    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(event: Event) {
      // Block dismissal while the destructive request is still running.
      event.preventDefault();
      if (!isPending) onCancel();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [isPending, onCancel]);

  async function handleConfirm() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      // Callers only provide the mutation; this wrapper owns shared modal UX.
      await onConfirm();
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
      setIsPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={isPending}
      className="m-auto w-full max-w-md border border-border bg-card px-6 py-6 shadow-lg backdrop:bg-black/50 sm:px-8 sm:py-8"
    >
      <h2
        id={titleId}
        className="text-lg font-semibold tracking-[-0.03em] text-foreground"
      >
        {title}
      </h2>

      <div className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </div>

      {errorMessage && (
        <div className="mt-4">
          <ErrorAlert message={errorMessage} />
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          autoFocus
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={handleConfirm}
        >
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
