import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function MyApplicationsPage() {
    return (
        <ProtectedRoute anyOf={[P.CONTRACT_APPLY]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">My Applications</h1>
                <p className="text-muted-foreground">
                    Your submitted applications will appear here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
