import { ScientificProjectsService } from "@/api/scientificProjectApi";
import PageShell from "@/app/components/page-shell";
import ErrorAlert from "@/app/components/error-alert";
import EmptyState from "@/app/components/empty-state";
import { serverAuthProvider } from "@/lib/authProvider";
import { ScientificProject } from "@/types/scientificProject";
import Link from "next/link";
import { buttonVariants } from "@/app/components/button";
import { parseErrorMessage } from "@/types/errors";

function ScientificProjectCard({ project, index }: Readonly<{ project: ScientificProject; index: number }>) {
    return (
        <div className="list-card block h-full pl-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <div className="list-kicker">Scientific Project #{index + 1}</div>
                    <div className="list-title">
                        {project.comments ? project.comments : `Project ${index + 1}`}
                    </div>
                    {project.score !== undefined && project.score !== null && (
                        <div className="list-support">Score: {project.score}</div>
                    )}
                </div>
                {project.score !== undefined && project.score !== null && (
                    <div className="status-badge">{project.score} pts</div>
                )}
            </div>
        </div>
    );
}

export default async function ScientificProjectsPage() {
    let projects: ScientificProject[] = [];
    let error: string | null = null;

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
            heroAside={
                <Link
                    href="/scientific-projects/new"
                    className={buttonVariants({ variant: "default", size: "sm" })}
                >
                    New Project
                </Link>
            }
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
                            <li key={project.uri ?? index}>
                                <ScientificProjectCard project={project} index={index} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PageShell>
    );
}