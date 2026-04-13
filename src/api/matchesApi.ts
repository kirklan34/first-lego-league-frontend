import type { AuthStrategy } from "@/lib/authProvider";
import { MatchDTO } from "@/types/match";
import { Team } from "@/types/team";
import { fetchHalCollection, fetchHalResource } from "./halClient";

export class MatchesService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getMatches(): Promise<MatchDTO[]> {
        return fetchHalCollection<MatchDTO>(
            "/matches?sort=startTime,asc&sort=id,asc&size=1000",
            this.authStrategy,
            "matches"
        );
    }

    async getMatchById(id: string): Promise<MatchDTO> {
        const matchId = encodeURIComponent(id);
        return fetchHalResource<MatchDTO>(`/matches/${matchId}`, this.authStrategy);
    }

    async getMatchTeams(id: string): Promise<Team[]> {
        const matchId = encodeURIComponent(id);
        return fetchHalCollection<Team>(`/matches/${matchId}/teams`, this.authStrategy, "teams");
    }
}
