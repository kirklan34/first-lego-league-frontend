import type { AuthStrategy } from "@/lib/authProvider";
import { ScientificProject } from "@/types/scientificProject";
import { fetchHalCollection } from "./halClient";

export class ScientificProjectsService {
    constructor(private readonly authStrategy: AuthStrategy) {}

    async getScientificProjects(): Promise<ScientificProject[]> {
        return fetchHalCollection<ScientificProject>('/scientificProjects', this.authStrategy, 'scientificProjects');
    }
}