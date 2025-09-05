import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function ContractDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    return (
        <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Contract Details</h1>
                <p className="text-muted-foreground">ID: {id}</p>
                <div className="flex gap-3">
                    <Can anyOf={[P.CONTRACT_UPDATE]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href={`/contracts/${id}/edit`}
                        >
                            Edit Contract
                        </Link>
                    </Can>
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/contracts"
                    >
                        Back to Contracts
                    </Link>
                </div>
            </main>
        </ProtectedRoute>
    );
}
