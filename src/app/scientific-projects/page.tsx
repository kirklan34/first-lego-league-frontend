import { ScientificProjectsService } from "@/api/scientificProjectApi";
import PageShell from "@/app/components/page-shell";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import { ScientificProjectCardLink } from "@/app/components/scientific-project-card";
import { serverAuthProvider } from "@/lib/authProvider";
import { ScientificProject } from "@/types/scientificProject";
import Link from "next/link";
import { buttonVariants } from "@/app/components/button";
import { parseErrorMessage } from "@/types/errors";

export default async function ScientificProjectsPage() {
    let projects: ScientificProject[] = [];
    let error: string | null = null;
    const auth = await serverAuthProvider.getAuth();
    const isLoggedIn = !!auth;

    try {
        const service = new ScientificProjectsService(serverAuthProvider);
        projects = await service.getScientificProjects();
    } catch (e) {
        console.error("Failed to fetch scientific projects:", e);
        error = parseErrorMessage(e);
    }

    return (
        <PageShell
            eyebrow="Innovation project"
            title="Scientific Projects"
            description="Explore innovation projects linked to each FIRST LEGO League edition."
            heroAside={isLoggedIn ? (
                <Link href="/scientific-projects/new" className={buttonVariants({ variant: "default", size: "sm" })}>
                    New Project
                </Link>
            ) : undefined}
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="page-eyebrow">Project list</div>
                    <h2 className="section-title">Season projects overview</h2>
                    <p className="section-copy max-w-3xl">
                        Each card highlights the scientific project submitted by a team, including score and evaluation comments.
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}

                {!error && projects.length === 0 && (
                    <EmptyState
                        title="No scientific projects found"
                        description="There are currently no scientific projects available to display."
                    />
                )}

                {!error && projects.length > 0 && (
                    <ul className="list-grid">
                        {projects.map((project, index) => (
                            <li key={project.uri ?? project.link("self")?.href ?? index}>
                                <ScientificProjectCardLink project={project} index={index} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PageShell>
    );
}
