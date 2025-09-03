import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { UsersTable } from "@/components/users/UsersTable";

export default function RbacUsersPage() {
    return (
        <ProtectedRoute anyOf={[P.RBAC_USER_ASSIGN_ROLES, P.RBAC_ROLE_MANAGE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">
                    User Role Assignments
                </h1>
                <p className="text-muted-foreground">
                    Assign roles to users and review access.
                </p>
                <div className="flex gap-4">
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/admin/rbac"
                    >
                        Back to RBAC
                    </Link>
                </div>

                <UsersTable />
            </main>
        </ProtectedRoute>
    );
}
