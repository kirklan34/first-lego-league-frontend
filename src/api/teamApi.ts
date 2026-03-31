import type { AuthStrategy } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { fetchHalCollection } from "./halClient";

export class TeamsService {
    constructor(private readonly authStrategy: AuthStrategy) { }

    async getTeams(): Promise<Team[]> {
        return fetchHalCollection<Team>('/teams', this.authStrategy, 'teams');
    }
}
