import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function PermissionsPage() {
    return (
        <ProtectedRoute anyOf={[P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Permissions</h1>
                <p className="text-muted-foreground">
                    View and organize system permissions.
                </p>
                <div className="flex gap-4">
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/admin/rbac"
                    >
                        Back to RBAC
                    </Link>
                </div>
            </main>
        </ProtectedRoute>
    );
}
