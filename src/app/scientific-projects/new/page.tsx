import { EditionsService } from "@/api/editionApi";
import { TeamsService } from "@/api/teamApi";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import NewScientificProjectForm from "./form";

export default async function NewScientificProjectPage() {
    const [editions, teams] = await Promise.all([
        new EditionsService(serverAuthProvider).getEditions().catch(() => []),
        new TeamsService(serverAuthProvider).getTeams().catch(() => []),
    ]);

    const editionOptions = editions.map(e => ({
        label: `${e.year}${e.venueName ? ` — ${e.venueName}` : ""}`,
        value: e.link("self")?.href ?? "",
    }));

    const teamOptions = teams.map(t => ({
        label: t.id ?? "",
        value: t.link("self")?.href ?? "",
    }));

    return (
        <PageShell
            eyebrow="Innovation project"
            title="New Scientific Project"
            description="Submit a new scientific project for a FIRST LEGO League edition."
        >
            <NewScientificProjectForm
                editionOptions={editionOptions}
                teamOptions={teamOptions}
            />
        </PageShell>
    );
}
