import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function ContractsPage() {
    return (
        <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Contracts</h1>
                <div className="flex gap-3">
                    <Can anyOf={[P.CONTRACT_CREATE]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/contracts/new"
                        >
                            Create Contract
                        </Link>
                    </Can>
                    <Can anyOf={[P.CONTRACT_APPLY]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/contracts/my-applications"
                        >
                            My Applications
                        </Link>
                    </Can>
                </div>
                <p className="text-muted-foreground">
                    Listing will appear here. Choose a contract to view details.
                </p>
            </main>
        </ProtectedRoute>
    );
}
