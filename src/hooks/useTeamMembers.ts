'use client';
import { useState, useCallback, useMemo } from 'react';
import { TeamsService } from '@/api/teamApi';
import { clientAuthProvider } from '@/lib/authProvider';
import { MAX_TEAM_MEMBERS, TeamMember } from '@/types/team';

export function useTeamMembers(teamId: string, initialMembers: TeamMember[] = []) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prevInitialMembers, setPrevInitialMembers] = useState<TeamMember[]>(initialMembers);

    if (initialMembers !== prevInitialMembers) {
        setPrevInitialMembers(initialMembers);
        setMembers(initialMembers);
    }

    const service = useMemo(
        () => new TeamsService(clientAuthProvider),
        []
    );

    const addMember = useCallback(
        async (name: string, role: string) => {
            if (!teamId) {
                setError('Missing teamId');
                return false;
            }
            setIsLoading(true);
            setError(null);
            try {
                if (members.length >= MAX_TEAM_MEMBERS) {
                    setError('Team has reached maximum members');
                    return false;
                }
                const newMember = await service.addTeamMember(teamId, {
                    name,
                    role,
                });
                setMembers(prev => [...prev, newMember]);
                return true;
            } catch {
                setError('Failed to add member');
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [teamId, members.length, service]
    );

    const removeMember = useCallback(
        (memberUri: string) => {
            if (!memberUri) return;
            setMembers(prev =>
                prev.filter(m => {
                    const href = m.link("self")?.href || m.uri;
                    return href !== memberUri;
                })
            );
        },
        []
    );

    return {
        members: members ?? [],
        isLoading,
        error,
        addMember,
        removeMember,
        isFull: (members ?? []).length >= MAX_TEAM_MEMBERS,
    };
}
