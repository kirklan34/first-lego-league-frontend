import type { AuthStrategy } from "@/lib/authProvider";
import type { HalPage } from "@/types/pagination";
import { ScientificProject } from "@/types/scientificProject";
import { fetchHalPagedCollection, getHal, mergeHal, mergeHalArray, postHal } from "./halClient";

export class ScientificProjectsService {
    constructor(private readonly authStrategy: AuthStrategy) { }

    async getScientificProjects(): Promise<ScientificProject[]> {
        const resource = await getHal('/scientificProjects', this.authStrategy);
        const embedded = resource.embeddedArray('scientificProjects') || [];
        return mergeHalArray<ScientificProject>(embedded);
    }

    async getScientificProjectsPaged(page: number, size: number): Promise<HalPage<ScientificProject>> {
        return fetchHalPagedCollection<ScientificProject>(
            '/scientificProjects', this.authStrategy, 'scientificProjects', page, size
        );
    }

    async createScientificProject(project: ScientificProject): Promise<ScientificProject> {
        const resource = await postHal('/scientificProjects', project, this.authStrategy);
        if (!resource) throw new Error('Failed to create scientific project');
        return mergeHal<ScientificProject>(resource);
    }

}