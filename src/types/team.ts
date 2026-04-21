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

export interface TeamCoachEntity {
    uri?: string;
    id?: number;
    name?: string;
    emailAddress?: string;
    phoneNumber?: string;
}

export type TeamCoach = TeamCoachEntity & Resource;

export interface TeamMemberEntity {
    uri?: string;
    id?: number;
    name?: string;
    birthDate?: string;
    gender?: string;
    tShirtSize?: string;
    role?: string;
}

export type TeamMember = TeamMemberEntity & Resource;

export interface CreateTeamPayload {
    name: string;
    city: string;
    foundationYear: number;
    educationalCenter?: string;
    category: string;
    inscriptionDate: string;
}

export interface CreateTeamMemberPayload {
    name: string;
    birthDate: string;
    gender?: string;
    role: string;
    team: string;
}

export interface CreateCoachPayload {
    name: string;
    emailAddress: string;
    phoneNumber: string;
}

export const TEAM_CATEGORY_OPTIONS = ["CHALLENGE", "EXPLORE"] as const;

export type TeamCategory = (typeof TEAM_CATEGORY_OPTIONS)[number];

export const TEAM_MEMBER_GENDER_OPTIONS = [
    "MALE",
    "FEMALE",
    "NON_BINARY",
    "OTHER",
    "PREFER_NOT_TO_SAY",
] as const;

export type TeamMemberGender = (typeof TEAM_MEMBER_GENDER_OPTIONS)[number];

export const DEFAULT_TEAM_MEMBER_ROLE = "Member";

export enum MemberRole {
    MEMBER = "Member",
    CAPTAIN = "Captain",
    MENTOR = "Mentor",
}

export const AVAILABLE_MEMBER_ROLES = Object.values(MemberRole);

export const MAX_TEAM_MEMBERS = 10;
