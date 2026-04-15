import { EditionsService } from "@/api/editionApi";
import PageShell from "@/app/components/page-shell";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import { serverAuthProvider } from "@/lib/authProvider";
import { getEncodedResourceId } from "@/lib/halRoute";
import { Edition } from "@/types/edition";
import { parseErrorMessage } from "@/types/errors";
import Link from "next/link";

function getEditionHref(edition: Edition) {
    const editionId = getEncodedResourceId(edition.uri);
    return editionId ? `/editions/${editionId}` : null;
}

function EditionCard({ edition }: Readonly<{ edition: Edition }>) {
    const href = getEditionHref(edition);
    const content = (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
                <div className="list-kicker">Edition</div>
                <div className="list-title">{edition.year}</div>
                {edition.venueName && (
                    <div className="list-support">{edition.venueName}</div>
                )}
                {edition.description && (
                    <div className="list-support">{edition.description}</div>
                )}
            </div>
            {edition.state && (
                <div className="status-badge">{edition.state}</div>
            )}
        </div>
    );

    if (!href) {
        return (
            <div className="list-card block h-full pl-7">
                {content}
            </div>
        );
    }

    return (
        <Link className="list-card block h-full pl-7 hover:text-primary" href={href}>
            {content}
        </Link>
    );
}

type EditionsPageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EditionsPage({ searchParams }: Readonly<{ searchParams: EditionsPageSearchParams }>) {
    let editions: Edition[] = [];
    let error: string | null = null;

    try {
        const params = await searchParams;
        const rawYear = params.year;
        const year = Array.isArray(rawYear) ? rawYear[0] : rawYear;
        const service = new EditionsService(serverAuthProvider);

        if (year?.trim()) {
            const edition = await service.getEditionByYear(year.trim());
            editions = edition ? [edition] : [];
        } else {
            editions = await service.getEditions();
        }
    } catch (e) {
        console.error("Failed to fetch editions:", e);
        error = parseErrorMessage(e);
    }

    return (
        <PageShell
            eyebrow="Competition archive"
            title="Editions"
            description="Browse the yearly editions of FIRST LEGO League, including venue and season details."
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="page-eyebrow">Edition list</div>
                    <h2 className="section-title">Season overview</h2>
                    <p className="section-copy max-w-3xl">
                        Each card highlights the season, venue and published information for that edition.
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}

                {!error && editions.length === 0 && (
                    <EmptyState
                        title="No editions found"
                        description="There are currently no editions available to display."
                    />
                )}

                {!error && editions.length > 0 && (
                    <ul className="list-grid">
                        {editions.map((edition, index) => (
                            <li key={edition.uri ?? index}>
                                <EditionCard edition={edition} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PageShell>
    );
}
