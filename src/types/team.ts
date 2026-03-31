import { Resource } from "halfred";

export interface TeamEntity {
    uri?: string;
    id?: string;
    name?: string;
    id?: string;
    city?: string;
    category?: string;
    educationalCenter?: string | null;
    foundationYear?: number;
    inscriptionDate?: string;
}

export type Team = TeamEntity & Resource;
