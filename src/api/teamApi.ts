import type { AuthStrategy } from "@/lib/authProvider";
import { Team } from "@/types/team";
import type { HalPage } from "@/types/pagination";
import { User } from "@/types/user";
import { fetchHalCollection, fetchHalPagedCollection, fetchHalResource } from "./halClient";

function getSafeEncodedId(id: string): string {
    try {
        return encodeURIComponent(decodeURIComponent(id));
    } catch {
        return encodeURIComponent(id);
    }
}

export class TeamsService {
    constructor(private readonly authStrategy: AuthStrategy) { }

    async getTeams(): Promise<Team[]> {
        return fetchHalCollection<Team>('/teams', this.authStrategy, 'teams');
    }

    async getTeamsPaged(page: number, size: number): Promise<HalPage<Team>> {
        return fetchHalPagedCollection<Team>('/teams', this.authStrategy, 'teams', page, size);
    }

    async getTeamById(id: string): Promise<Team> {
        const teamId = getSafeEncodedId(id);
        return fetchHalResource<Team>(`/teams/${teamId}`, this.authStrategy);
    }

    async getTeamCoach(id: string): Promise<User[]> {
        const teamId = getSafeEncodedId(id);
        return fetchHalCollection<User>(`/teams/${teamId}/trainedBy`, this.authStrategy, 'coaches');
    }

    async getTeamMembers(id: string): Promise<User[]> {
        const teamId = getSafeEncodedId(id);
        return fetchHalCollection<User>(`/teams/${teamId}/members`, this.authStrategy, 'teamMembers');
    }
}
