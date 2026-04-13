import { MatchesService } from "@/api/matchesApi";
import EmptyState from "@/app/components/empty-state";
import ErrorAlert from "@/app/components/error-alert";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import { parseErrorMessage } from "@/types/errors";
import { MatchDTO } from "@/types/match";

export const dynamic = "force-dynamic";

function formatMatchTime(value?: string | null) {
    if (!value) {
        return "Not available";
    }

    const timeMatch = value.match(/^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/);
    if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getTeamsLabel(match: MatchDTO) {
    return `${match.teamA} vs ${match.teamB}`;
}

function compareMatchTimes(left?: string | null, right?: string | null) {
    const leftValue = left ?? "";
    const rightValue = right ?? "";
    return leftValue.localeCompare(rightValue);
}

function getMatchKey(match: MatchDTO, index: number) {
    if (match.id !== undefined && match.id !== null) {
        return String(match.id);
    }

    if (match.uri) {
        return match.uri;
    }

    return match.link("self")?.href ?? `match-${index}`;
}

function MatchesTable({ matches }: Readonly<{ matches: MatchDTO[] }>) {
    return (
        <div className="overflow-hidden border border-border">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-left">
                    <caption className="sr-only">List of matches with start time, end time and teams.</caption>
                    <thead className="bg-secondary/70">
                        <tr>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">Start time</th>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">End time</th>
                            <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-5">Teams</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
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
                                    {getTeamsLabel(match)}
                                </td>
                            </tr>
                        ))}
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

export default async function MatchesPage() {
    let matches: MatchDTO[] = [];
    let error: string | null = null;

    try {
        const service = new MatchesService(serverAuthProvider);
        const response = await service.getMatches();

        matches = [...response].sort((left, right) => {
            const startTimeDifference = compareMatchTimes(left.startTime, right.startTime);
            if (startTimeDifference !== 0) {
                return startTimeDifference;
            }

            const endTimeDifference = compareMatchTimes(left.endTime, right.endTime);
            if (endTimeDifference !== 0) {
                return endTimeDifference;
            }

            return String(left.id ?? "").localeCompare(String(right.id ?? ""));
        });
    } catch (fetchError) {
        console.error("Failed to fetch matches:", fetchError);
        error = getFriendlyMatchesError(fetchError);
    }

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
                        <p className="text-sm text-muted-foreground">
                            Showing {matches.length} match{matches.length === 1 ? "" : "es"} fetched from the backend.
                        </p>
                        <MatchesTable matches={matches} />
                    </div>
                )}
            </div>
        </PageShell>
    );
}
