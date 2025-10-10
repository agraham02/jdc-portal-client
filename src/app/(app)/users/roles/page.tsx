import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { RoleList } from "@/components/rbac/RoleList";

export default function RolesPage() {
    return (
        <ProtectedRoute anyOf={[P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Roles</h1>
                <p className="text-muted-foreground">
                    Manage role definitions and their permissions.
                </p>
                <RoleList />
            </main>
        </ProtectedRoute>
    );
}
