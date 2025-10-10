"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ContractEditor } from "@/components/contracts";
import { ContractsService } from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type { Contract, UpdateContractDto } from "@/lib/types/contracts";
import {
    showContractActionSuccess,
    showContractActionError,
} from "@/lib/utils/contract-notifications";

export default function ContractEditPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        async function loadContract() {
            try {
                setIsLoading(true);
                const data = await ContractsService.getContract(params.id);
                setContract(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load contract"
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadContract();
    }, [params.id]);

    async function handleSubmit(data: UpdateContractDto) {
        try {
            setIsSubmitting(true);
            setError(undefined);
            await ContractsService.updateContract(params.id, data);
            showContractActionSuccess(
                "Contract Updated",
                "Contract has been updated successfully"
            );
            router.push(`/contracts/${params.id}`);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to update contract";
            showContractActionError("Update Contract", message);
            setError(message);
            setIsSubmitting(false);
        }
    }

    function handleCancel() {
        router.push(`/contracts/${params.id}`);
    }

    if (isLoading) {
        return (
            <ProtectedRoute anyOf={[P.CONTRACT_UPDATE]}>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 rounded bg-muted" />
                        <div className="h-96 rounded-lg bg-muted" />
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    if (error || !contract) {
        return (
            <ProtectedRoute anyOf={[P.CONTRACT_UPDATE]}>
                <main className="container mx-auto max-w-4xl space-y-6 py-6">
                    <Button variant="ghost" onClick={handleCancel}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {error || "Contract not found"}
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute anyOf={[P.CONTRACT_UPDATE]}>
            <main className="container mx-auto max-w-4xl space-y-6 py-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Contract</h1>
                        <p className="mt-2 text-muted-foreground">
                            Update the contract details
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {error}
                    </div>
                )}

                <ContractEditor
                    initialData={contract}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Contract"
                />
            </main>
        </ProtectedRoute>
    );
}
