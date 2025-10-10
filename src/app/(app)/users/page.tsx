import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UsersTable } from "@/components/users/UsersTable";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function UsersPage() {
    return (
        <ProtectedRoute anyOf={[P.RBAC_USER_ASSIGN_ROLES, P.RBAC_ROLE_MANAGE]}>
            <main className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                </div>
                <p className="text-muted-foreground">
                    Manage all system users and assign roles.
                </p>
                <p className="text-muted-foreground text-sm">
                    To perform entity-specific tasks, go to the relevant
                    entity-type page.
                </p>

                <UsersTable />
            </main>
        </ProtectedRoute>
    );
}
