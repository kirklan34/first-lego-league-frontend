import { MatchesService } from "@/api/matchesApi";
import EmptyState from "@/app/components/empty-state";
import ErrorAlert from "@/app/components/error-alert";
import PageShell from "@/app/components/page-shell";
import PaginationControls from "@/app/components/pagination-controls";
import { serverAuthProvider } from "@/lib/authProvider";
import { getEncodedResourceId } from "@/lib/halRoute";
import { formatMatchTime } from "@/lib/matchUtils";
import { parseErrorMessage } from "@/types/errors";
import type { HalPage } from "@/types/pagination";
import { Match } from "@/types/match";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

function getTeamsLabel(match: Match) {
    return `${match.teamA} vs ${match.teamB}`;
}


function getMatchKey(match: Match, index: number) {
    if (match.id !== undefined && match.id !== null) {
        return String(match.id);
    }

    if (match.uri) {
        return match.uri;
    }

    return match.link("self")?.href ?? `match-${index}`;
}

function MatchesTable({ matches }: Readonly<{ matches: Match[] }>) {
    return (
        <div className="overflow-hidden border border-border">
            <div className="overflow-x-auto">
                <table className="w-full min-w-2xl border-collapse text-left">
                    <caption className="sr-only">List of matches with start time, end time and teams.</caption>
                    <thead className="bg-secondary/70">
                        <tr>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">Start time</th>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">End time</th>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">Teams</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => {
                            const matchId = getEncodedResourceId(match.link("self")?.href ?? match.uri);
                            return (
                                <tr
                                    key={getMatchKey(match, index)}
                                    className="border-t border-border transition-colors hover:bg-secondary/40"
                                >
                                    <td className="px-4 py-4 text-sm text-foreground sm:px-5">
                                        {formatMatchTime(match.startTime)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-foreground sm:px-5">
                                        {formatMatchTime(match.endTime)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-muted-foreground sm:px-5">
                                        {matchId ? (
                                            <Link
                                                href={`/matches/${matchId}`}
                                                className="hover:text-foreground hover:underline underline-offset-2"
                                            >
                                                {getTeamsLabel(match)}
                                            </Link>
                                        ) : (
                                            getTeamsLabel(match)
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function getFriendlyMatchesError(error: unknown) {
    const parsedMessage = parseErrorMessage(error);

    if (parsedMessage === "An unexpected error occurred. Please try again.") {
        return "We could not load the matches right now. Please try again in a few minutes.";
    }

    return `We could not load the matches. ${parsedMessage}`;
}

interface MatchesPageProps {
    readonly searchParams?: Promise<{ page?: string }>;
}

export default async function MatchesPage(props: Readonly<MatchesPageProps>) {
    const searchParams = (await props.searchParams) ?? {};
    const urlPage = Math.max(1, Number(searchParams.page ?? "1") || 1);

    let result: HalPage<Match> = { items: [], hasNext: false, hasPrev: false, currentPage: 0 };
    let error: string | null = null;

    try {
        const service = new MatchesService(serverAuthProvider);
        result = await service.getMatchesPaged(urlPage - 1, PAGE_SIZE);
    } catch (fetchError) {
        console.error("Failed to fetch matches:", fetchError);
        error = getFriendlyMatchesError(fetchError);
    }

    const matches = result.items;

    return (
        <PageShell
            eyebrow="Competition schedule"
            title="Matches"
            description="Browse the scheduled matches with timing details and participating teams."
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="page-eyebrow">Live listing</div>
                    <h2 className="section-title">Match schedule</h2>

                </div>

                {error && <ErrorAlert message={error} />}

                {!error && matches.length === 0 && (
                    <EmptyState
                        title="No matches available"
                        description="There are no scheduled matches yet."
                    />
                )}

                {!error && matches.length > 0 && (
                    <div className="space-y-4">
                        <MatchesTable matches={matches} />
                        <PaginationControls
                            currentPage={urlPage}
                            hasNext={result.hasNext}
                            hasPrev={result.hasPrev}
                            basePath="/matches"
                        />
                    </div>
                )}
            </div>
        </PageShell>
    );
}
