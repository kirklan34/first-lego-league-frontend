import { Resource } from "halfred";

export interface TeamEntity {
    uri?: string;
    id?: string;
    name?: string;
    city?: string;
    category?: string;
    educationalCenter?: string | null;
    foundationYear?: number;
    inscriptionDate?: string;
}

export type Team = TeamEntity & Resource;

export enum MemberRole {
    MEMBER = "Member",
    CAPTAIN = "Captain",
    MENTOR = "Mentor",
}

export const AVAILABLE_MEMBER_ROLES = Object.values(MemberRole);

export const MAX_TEAM_MEMBERS = 10;