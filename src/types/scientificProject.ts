import { Resource } from "halfred";

export interface ScientificProjectEntity {
    uri?: string;
    team?: string;
    edition?: string;
    score?: number;
    comments?: string;
}

export type ScientificProject = ScientificProjectEntity & Resource;
