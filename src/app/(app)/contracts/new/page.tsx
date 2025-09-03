import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function ContractCreatePage() {
    return (
        <ProtectedRoute anyOf={[P.CONTRACT_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create Contract</h1>
                <p className="text-muted-foreground">
                    Form will be implemented here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
