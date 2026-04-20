import { TeamsService } from "@/api/teamApi";
import EmptyState from "@/app/components/empty-state";
import ErrorAlert from "@/app/components/error-alert";
import PageShell from "@/app/components/page-shell";
import PaginationControls from "@/app/components/pagination-controls";
import { getEncodedResourceId } from "@/lib/halRoute";
import { serverAuthProvider } from "@/lib/authProvider";
import { ApiError, parseErrorMessage } from "@/types/errors";
import type { HalPage } from "@/types/pagination";
import { Team } from "@/types/team";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

function getTeamDisplayName(team: Team) {
    return team.name ?? team.id ?? "Unnamed team";
}

function getTeamKey(team: Team, index: number) {
    return team.uri ?? team.id ?? `team-${index}`;
}

function getTeamErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return parseErrorMessage(error);
    }

    if (error instanceof Error) {
        return error.message;
    }

    return parseErrorMessage(error);
}

function TeamCard({ team }: Readonly<{ team: Team }>) {
    const hasMetadata = team.category || team.foundationYear !== undefined;

    return (
        <div className="list-card block h-full pl-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <div className="list-kicker">Team</div>
                    <div className="list-title">{getTeamDisplayName(team)}</div>
                    {team.city && <div className="list-support">{team.city}</div>}
                    {hasMetadata && (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {team.category && <span>Category: {team.category}</span>}
                            {team.foundationYear !== undefined && (
                                <span>Founded: {team.foundationYear}</span>
                            )}
                        </div>
                    )}
                    {team.educationalCenter && (
                        <div className="list-support">{team.educationalCenter}</div>
                    )}
                </div>
                {team.inscriptionDate && (
                    <div className="status-badge">{team.inscriptionDate}</div>
                )}
            </div>
        </div>
    );
}

interface TeamsPageProps {
    readonly searchParams?: Promise<{ page?: string }>;
}

export default async function TeamsPage(props: Readonly<TeamsPageProps>) {
    const searchParams = (await props.searchParams) ?? {};
    const urlPage = Math.max(1, Number(searchParams.page ?? "1") || 1);

    let result: HalPage<Team> = { items: [], hasNext: false, hasPrev: false, currentPage: 0 };
    let error: string | null = null;

    try {
        const service = new TeamsService(serverAuthProvider);
        result = await service.getTeamsPaged(urlPage - 1, PAGE_SIZE);
    } catch (e) {
        console.error("Failed to fetch teams:", e);
        error = getTeamErrorMessage(e);
    }

    const teams = result.items;

    return (
        <PageShell
            eyebrow="Team management"
            title="Teams"
            description="Browse the teams currently registered in the FIRST LEGO League platform."
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="page-eyebrow">Registered teams</div>
                    <h2 className="section-title">Competition roster</h2>
                    <p className="section-copy max-w-3xl">
                        Explore the teams in the system, including their city, category and registration metadata.
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}

                {!error && teams.length === 0 && (
                    <EmptyState
                        title="No teams found"
                        description="There are currently no teams available to display."
                    />
                )}

                {!error && teams.length > 0 && (
                    <>
                        <ul className="list-grid">
                            {teams.map((team, index) => {
                                const teamId = getEncodedResourceId(team.uri);
                                const href = teamId ? `/teams/${teamId}` : null;
                                return (
                                    <li key={getTeamKey(team, index)}>
                                        {href ? (
                                            <Link href={href} className="block h-full transition hover:bg-zinc-50 dark:hover:bg-zinc-900 group">
                                                <TeamCard team={team} />
                                            </Link>
                                        ) : (
                                            <TeamCard team={team} />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        <PaginationControls
                            currentPage={urlPage}
                            hasNext={result.hasNext}
                            hasPrev={result.hasPrev}
                            basePath="/teams"
                        />
                    </>
                )}
            </div>
        </PageShell>
    );
}
