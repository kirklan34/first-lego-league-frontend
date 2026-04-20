import { EditionsService } from "@/api/editionApi";
import { UsersService } from "@/api/userApi";
import PageShell from "@/app/components/page-shell";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import PaginationControls from "@/app/components/pagination-controls";
import { buttonVariants } from "@/app/components/button";
import { serverAuthProvider } from "@/lib/authProvider";
import { isAdmin } from "@/lib/authz";
import { getEncodedResourceId } from "@/lib/halRoute";
import { Edition } from "@/types/edition";
import { parseErrorMessage } from "@/types/errors";
import type { HalPage } from "@/types/pagination";
import { User } from "@/types/user";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

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

interface EditionsPageProps {
    readonly searchParams?: Promise<{ page?: string }>;
}

export default async function EditionsPage(props: Readonly<EditionsPageProps>) {
    const searchParams = (await props.searchParams) ?? {};
    const urlPage = Math.max(1, Number(searchParams.page ?? "1") || 1);

    let result: HalPage<Edition> = { items: [], hasNext: false, hasPrev: false, currentPage: 0 };
    let error: string | null = null;
    let currentUser: User | null = null;

    try {
        currentUser = await new UsersService(serverAuthProvider).getCurrentUser();
    } catch (e) {
        console.error("Failed to fetch current user:", e);
    }

    try {
        const service = new EditionsService(serverAuthProvider);
        result = await service.getEditionsPaged(urlPage - 1, PAGE_SIZE);
    } catch (e) {
        console.error("Failed to fetch editions:", e);
        error = parseErrorMessage(e);
    }

    const editions = result.items;

    return (
        <PageShell
            eyebrow="Competition archive"
            title="Editions"
            description="Browse the yearly editions of FIRST LEGO League, including venue and season details."
            heroAside={isAdmin(currentUser) ? (
                <Link href="/editions/new" className={buttonVariants({ variant: "default", size: "sm" })}>
                    + Create
                </Link>
            ) : undefined}
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
                    <>
                        <ul className="list-grid">
                            {editions.map((edition, index) => (
                                <li key={edition.uri ?? index}>
                                    <EditionCard edition={edition} />
                                </li>
                            ))}
                        </ul>
                        <PaginationControls
                            currentPage={urlPage}
                            hasNext={result.hasNext}
                            hasPrev={result.hasPrev}
                            basePath="/editions"
                        />
                    </>
                )}
            </div>
        </PageShell>
    );
}
