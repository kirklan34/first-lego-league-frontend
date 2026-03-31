"use server";

import { ScientificProjectsService } from "@/api/scientificProjectApi";
import { serverAuthProvider } from "@/lib/authProvider";
import { ScientificProject } from "@/types/scientificProject";

export async function createScientificProject(
    data: Pick<ScientificProject, "comments" | "team" | "edition">
) {
    const service = new ScientificProjectsService(serverAuthProvider);
    return service.createScientificProject(data as ScientificProject);
}
