"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ContractsTable } from "@/components/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function ContractsPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                <main className="container mx-auto space-y-6 py-6">
                    <div>
                        <h1 className="text-3xl font-bold">Contracts</h1>
                        <p className="mt-2 text-muted-foreground">
                            Browse and manage available contracts
                        </p>
                    </div>

                    <ContractsTable />
                </main>
            </ProtectedRoute>
        </ErrorBoundary>
    );
}
