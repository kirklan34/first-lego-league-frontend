"use client";

import { useState } from "react";
import { Button } from "@/app/components/button";
import DeleteTeamDialog from "./delete-team-dialog";

interface TeamDeleteSectionProps {
  readonly teamId: string;
  readonly teamName: string;
}

export default function TeamDeleteSection({
  teamId,
  teamName,
}: TeamDeleteSectionProps) {
  // Keep the dialog toggle local so the server page only passes stable team data.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
      >
        Delete team
      </Button>

      {isDialogOpen && (
        <DeleteTeamDialog
          teamId={teamId}
          teamName={teamName}
          onCancel={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}
