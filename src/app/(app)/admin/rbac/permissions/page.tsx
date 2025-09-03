import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { PermissionsBrowser } from "@/components/rbac/PermissionsBrowser";

export default function PermissionsPage() {
    return (
        <ProtectedRoute
            anyOf={[
                P.RBAC_PERMISSION_READ,
                P.RBAC_ROLE_MANAGE,
                P.RBAC_ROLE_READ,
            ]}
        >
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
                <PermissionsBrowser />
            </main>
        </ProtectedRoute>
    );
}
