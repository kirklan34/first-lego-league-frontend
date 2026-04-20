import type { AuthStrategy } from "@/lib/authProvider";
import { Team } from "@/types/team";
import type { HalPage } from "@/types/pagination";
import { User } from "@/types/user";
import {
    fetchHalCollection,
    fetchHalPagedCollection,
    fetchHalResource,
    createHalResource,
    deleteHal
} from "./halClient";

function getSafeEncodedId(id: string): string {
    try {
        return encodeURIComponent(decodeURIComponent(id));
    } catch {
        return encodeURIComponent(id);
    }
}

export interface AddMemberPayload {
    name: string;
    role: string;
}

export class TeamsService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getTeams(): Promise<Team[]> {
        return fetchHalCollection<Team>("/teams", this.authStrategy, "teams");
    }

    async getTeamsByEdition(editionUri: string): Promise<Team[]> {
        return fetchHalCollection<Team>(editionUri, this.authStrategy, 'teams');
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
        return fetchHalCollection<User>(`/teams/${teamId}/trainedBy`, this.authStrategy, "coaches");
    }

    async getTeamMembers(teamId: string): Promise<unknown[]> {
        const safeId = getSafeEncodedId(teamId);
        return fetchHalCollection<unknown>(
            `/teams/${safeId}/members`,
            this.authStrategy,
            "teamMembers"
        );
    }

    async addTeamMember(teamId: string, data: AddMemberPayload): Promise<User> {
        const safeId = getSafeEncodedId(teamId);
        return createHalResource<User>(
            "/teamMembers",
            {
                name: data.name.trim(),
                role: data.role,
                birthDate: "2010-01-01",
                gender: "MALE",
                tShirtSize: "M",
                team: `/teams/${safeId}`
            },
            this.authStrategy,
            "teamMembers"
        );
    }

    async deleteTeam(id: string): Promise<void> {
        const teamId = getSafeEncodedId(id);
        await deleteHal(`/teams/${teamId}`, this.authStrategy);
    }

    async removeTeamMember(memberUri: string): Promise<void> {
        await deleteHal(memberUri, this.authStrategy);
    }
}
