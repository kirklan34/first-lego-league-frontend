'use client';

import { useState } from 'react';
import { Button } from '@/app/components/button';
import EditTeamForm from './edit-team-form';
import { Team } from '@/types/team';

interface TeamEditSectionProps {
    readonly team: Team;
}

export default function TeamEditSection({ team }: TeamEditSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSuccess = () => {
        setIsEditing(false);
        setSuccessMessage('Team updated successfully.');
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    return (
        <div className="mt-4">
            {successMessage && (
                <p
                    className="mb-4 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    role="status"
                    aria-live="polite"
                >
                    {successMessage}
                </p>
            )}

            {!isEditing ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSuccessMessage(null);
                        setIsEditing(true);
                    }}
                >
                    Edit team
                </Button>
            ) : (
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">
                        Edit team details
                    </h2>

                    <EditTeamForm
                        teamId={team.id}
                        defaultValues={{
                            name: team.name,
                            city: team.city,
                            educationalCenter: team.educationalCenter ?? '',
                            category: team.category,
                            foundationYear: team.foundationYear,
                            inscriptionDate: team.inscriptionDate,
                        }}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
            )}
        </div>
    );
}