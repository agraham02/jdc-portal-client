import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function RbacPage() {
    return (
        <ProtectedRoute anyOf={[P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">RBAC</h1>
                <p className="text-muted-foreground">
                    Manage roles, permissions, and user assignments.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/admin/rbac/roles"
                        >
                            Roles
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/admin/rbac/permissions"
                        >
                            Permissions
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/admin/rbac/users"
                        >
                            Users
                        </Link>
                    </li>
                </ul>
            </main>
        </ProtectedRoute>
    );
}
