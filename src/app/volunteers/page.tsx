import { VolunteersService } from "@/api/volunteerApi";
import EmptyState from "@/app/components/empty-state";
import ErrorAlert from "@/app/components/error-alert";
import PageShell from "@/app/components/page-shell";
import { serverAuthProvider } from "@/lib/authProvider";
import { parseErrorMessage } from "@/types/errors";
import { Volunteer } from "@/types/volunteer";

function VolunteerList({ title, typePlural, volunteers, emptyMessage }: Readonly<{ title: string, typePlural: string, volunteers: Volunteer[], emptyMessage: string }>) {
    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            {volunteers.length === 0 ? (
                <EmptyState
                    title={`No ${typePlural} found`}
                    description={emptyMessage}
                />
            ) : (
                <ul className="list-grid">
                    {volunteers.map((v, idx) => {
                        const id = v.name ? `${v.type}-${v.name}-${idx}` : `${v.type}-${idx}`;
                        return (
                            <li key={id} className="list-card pl-7">
                                <div className="list-kicker">{v.type}</div>
                                <div className="list-title block font-medium">
                                    {v.name || "Unknown"}
                                </div>
                                {v.emailAddress && (
                                    <div className="list-support">{v.emailAddress}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default async function VolunteersPage() {
    const service = new VolunteersService(serverAuthProvider);
    let judges: Volunteer[] = [];
    let referees: Volunteer[] = [];
    let floaters: Volunteer[] = [];
    let error: string | null = null;

    try {
        const data = await service.getVolunteers();
        judges = data.judges;
        referees = data.referees;
        floaters = data.floaters;
    } catch (e) {
        console.error("Failed to fetch volunteers:", e);
        error = parseErrorMessage(e);
    }

    return (
        <PageShell
            eyebrow="Volunteers directory"
            title="Volunteers"
            description="Manage the competition volunteers including judges, referees, and floaters."
        >
            <div className="space-y-8">
                {error && <ErrorAlert message={error} />}

                {!error && (
                    <div className="space-y-12 shrink-0">
                        <VolunteerList 
                            title="Judges" 
                            typePlural="judges" 
                            volunteers={judges} 
                            emptyMessage="There are currently no judges registered for the competition." 
                        />
                        <VolunteerList 
                            title="Referees" 
                            typePlural="referees" 
                            volunteers={referees} 
                            emptyMessage="There are currently no referees registered for the competition." 
                        />
                        <VolunteerList 
                            title="Floaters" 
                            typePlural="floaters" 
                            volunteers={floaters} 
                            emptyMessage="There are currently no floaters registered for the competition." 
                        />
                    </div>
                )}
            </div>
        </PageShell>
    );
}
