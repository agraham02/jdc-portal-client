import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function ContractEditPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <ProtectedRoute anyOf={[P.CONTRACT_UPDATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Edit Contract</h1>
                <p className="text-muted-foreground">
                    Editing contract ID: {params.id}
                </p>
            </main>
        </ProtectedRoute>
    );
}
