import { TeamsService } from "@/api/teamApi";
import { UsersService } from "@/api/userApi";
import ErrorAlert from "@/app/components/error-alert";
import { serverAuthProvider } from "@/lib/authProvider";
import { Team } from "@/types/team";
import { User } from "@/types/user";
import { parseErrorMessage, NotFoundError } from "@/types/errors";
import { TeamMembersManager } from "@/app/components/team-member-manager";

interface TeamDetailPageProps {
    readonly params: Promise<{ id: string }>;
}

function getTeamTitle(team: Team | null, id: string) {
    if (team?.name) return team.name;
    if (team?.id) return team.id;

    try {
        return `Team ${decodeURIComponent(id)}`;
    } catch {
        return `Team ${id}`;
    }
}

export default async function TeamDetailPage(props: Readonly<TeamDetailPageProps>) {
    const { id } = await props.params;

    const teamService = new TeamsService(serverAuthProvider);
    const userService = new UsersService(serverAuthProvider);

    let team: Team | null = null;
    let coaches: User[] = [];
    let members: User[] = [];
    let currentUser: User | null = null;

    let error: string | null = null;
    let membersError: string | null = null;

    try {
        team = await teamService.getTeamById(id);
    } catch (e) {
        console.error("Failed to fetch team:", e);
        error =
            e instanceof NotFoundError
                ? "This team does not exist."
                : parseErrorMessage(e);
    }

    if (team && !error) {
        try {
            [coaches, members] = await Promise.all([
                teamService.getTeamCoach(id),
                teamService.getTeamMembers(id),
            ]);
        } catch (e) {
            console.error("Failed to fetch team details:", e);
            membersError = parseErrorMessage(e);
        }
    }

    try {
        currentUser = await userService.getCurrentUser();
    } catch {
        currentUser = null;
    }

    const isAdmin =
        currentUser?.authorities?.some(
            (a: any) => a.authority === "ROLE_ADMIN"
        ) ?? false;

    const isCoach =
        !!currentUser &&
        coaches.some(
            (c) =>
                c.username === currentUser?.username ||
                c.email === currentUser?.email
        );

    const coachName =
        coaches.length > 0
            ? coaches[0].username ?? coaches[0].email ?? "Unnamed coach"
            : "No coach assigned";

    if (error) {
        return (
            <div className="p-6">
                <ErrorAlert message={error} />
            </div>
        );
    }

    if (!team) {
        return <div className="p-6">Team not found</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="w-full max-w-3xl px-4 py-10">
                <div className="w-full rounded-lg border bg-white p-6 shadow-sm dark:bg-black">

                    <h1 className="mb-2 text-2xl font-semibold">
                        {getTeamTitle(team, id)}
                    </h1>

                    <div className="mb-6 space-y-1 text-sm text-zinc-600">
                        {team.city && <p><strong>City:</strong> {team.city}</p>}
                        {team.category && <p><strong>Category:</strong> {team.category}</p>}
                        {team.educationalCenter && <p><strong>Educational Center:</strong> {team.educationalCenter}</p>}
                        <p><strong>Coach:</strong> {coachName}</p>
                    </div>

                    <h2 className="mt-8 mb-4 text-xl font-semibold">
                        Team Members
                    </h2>

                    {membersError && (
                        <ErrorAlert message={membersError} />
                    )}

                    {!membersError && (
                        <TeamMembersManager
                            teamId={id}
                            members={members}
                            isCoach={isCoach}
                            isAdmin={isAdmin}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}