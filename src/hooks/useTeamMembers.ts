'use client';

import { useState, useCallback } from 'react';
import { TeamsService } from '@/api/teamApi';
import { clientAuthProvider } from '@/lib/authProvider';
import { User } from '@/types/user';
import { MAX_TEAM_MEMBERS } from '@/types/team';

export function useTeamMembers(teamId: string, initialMembers: User[]) {
    const [members, setMembers] = useState<User[]>(initialMembers);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const service = new TeamsService(clientAuthProvider);

    const addMember = useCallback(async (name: string, role: string) => {
        setIsLoading(true);
        setError(null);

        try {
            if (members.length >= MAX_TEAM_MEMBERS) {
                setError('Team has reached maximum members');
                return;
            }

            const newMember = await service.addTeamMember(teamId, { name, role });
            setMembers(prev => [...prev, newMember]);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, members.length]);

    const removeMember = useCallback(async (memberId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await service.removeTeamMember(memberId);
            setMembers(prev => prev.filter(m => m.uri !== memberId));
            await service.removeTeamMember(teamId, memberId);
            setMembers(prev => prev.filter(m => 
                m.uri !== memberId && m._links?.self?.href !== memberId
            ));
        } catch {
            setError('Failed to remove member');
        } finally {
            setIsLoading(false);
        }
    }, [teamId, service]);

    return {
        members,
        isLoading,
        error,
        addMember,
        removeMember,
        isFull: members.length >= MAX_TEAM_MEMBERS,
    };
}