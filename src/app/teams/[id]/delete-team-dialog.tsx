"use client";

import { useRouter } from "next/navigation";
import { TeamsService } from "@/api/teamApi";
import ConfirmDestructiveDialog from "@/app/components/confirm-destructive-dialog";
import { clientAuthProvider } from "@/lib/authProvider";

interface DeleteTeamDialogProps {
  readonly teamId: string;
  readonly teamName: string;
  readonly onCancel: () => void;
}

export default function DeleteTeamDialog({
  teamId,
  teamName,
  onCancel,
}: DeleteTeamDialogProps) {
  const router = useRouter();
  const service = new TeamsService(clientAuthProvider);

  async function handleDelete() {
    await service.deleteTeam(teamId);
    // Refresh the destination page so the list reflects the deletion immediately.
    router.push("/teams");
    router.refresh();
  }

  return (
    <ConfirmDestructiveDialog
      title="Delete team"
      description={
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{teamName}</span>?
          This action cannot be undone.
        </p>
      }
      confirmLabel="Delete team"
      pendingLabel="Deleting..."
      onConfirm={handleDelete}
      onCancel={onCancel}
    />
  );
}
