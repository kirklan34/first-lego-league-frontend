'use client';

import { Button } from '@/app/components/button';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { TeamMember } from '@/types/team';
import { useState } from 'react';
import { AddMemberForm } from './add-member-form';
import { DeleteMemberDialog } from './delete-member-dialog';

interface TeamMembersManagerProps {
    teamId: string;
    initialMembers: TeamMember[];
    isCoach: boolean;
    isAdmin: boolean;
}

export function TeamMembersManager({ teamId, initialMembers, isCoach, isAdmin }: Readonly<TeamMembersManagerProps>) {
    const isAuthorized = isCoach || isAdmin;
    const { members, addMember, removeMember, isFull } = useTeamMembers(teamId, initialMembers);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState<{ name: string; uri: string } | null>(null);

    return (
        <div className="space-y-4">
            {isAuthorized && !isFull && (
                <Button onClick={() => setShowForm(true)}>Add Member</Button>
            )}

            {showForm && (
                <AddMemberForm
                    onSubmit={async (name, role) => {
                        const success = await addMember(name, role);
                        if (success) setShowForm(false);
                        return success;
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <ul className="space-y-2">
                {members.map((m) => (
                    <li
                        key={m.uri ?? String(m.id)}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                        <div>
                            <span className="block font-medium">{m.name ?? "Unnamed member"}</span>
                            <span className="text-xs text-muted-foreground uppercase">
                                {m.role ?? "Member"}
                            </span>
                        </div>
                        {isAuthorized && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    m.uri
                                        ? setSelected({
                                            name: m.name ?? "Unnamed member",
                                            uri: m.uri,
                                        })
                                        : null
                                }
                                disabled={!m.uri}
                            >
                                Delete
                            </Button>
                        )}
                    </li>
                ))}
            </ul>

            {selected && (
                <DeleteMemberDialog
                    member={selected}
                    onCancel={() => setSelected(null)}
                    onSuccess={(uri: string) => {
                        removeMember(uri);
                        setSelected(null);
                    }}
                />
            )}
        </div>
    );
}
