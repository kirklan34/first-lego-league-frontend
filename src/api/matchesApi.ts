import type { AuthStrategy } from "@/lib/authProvider";
import type { HalPage } from "@/types/pagination";
import { Match } from "@/types/match";
import { Team } from "@/types/team";
import { fetchHalCollection, fetchHalPagedCollection, fetchHalResource } from "./halClient";

export class MatchesService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getMatches(): Promise<Match[]> {
        return fetchHalCollection<Match>(
            "/matches?sort=startTime,asc&sort=id,asc&size=1000",
            this.authStrategy,
            "matches"
        );
    }

    async getMatchesPaged(page: number, size: number): Promise<HalPage<Match>> {
        return fetchHalPagedCollection<Match>(
            "/matches?sort=startTime,asc&sort=id,asc",
            this.authStrategy,
            "matches",
            page,
            size
        );
    }

    async getMatchById(id: string): Promise<Match> {
        const matchId = encodeURIComponent(id);
        return fetchHalResource<Match>(`/matches/${matchId}`, this.authStrategy);
    }

    async getMatchTeams(id: string): Promise<Team[]> {
        const matchId = encodeURIComponent(id);
        return fetchHalCollection<Team>(`/matches/${matchId}/teams`, this.authStrategy, "teams");
    }
}
