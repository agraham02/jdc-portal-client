"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/button";
import { ContractList } from "@/components/contracts";
import { ContractsService } from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type { Contract, ContractStatus } from "@/lib/types/contracts";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import {
    handleContractNotification,
    isContractNotification,
} from "@/lib/utils/contract-notifications";
import { NotificationType } from "@/lib/types/notifications";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContractListSkeleton } from "@/components/common/LoadingSkeletons";
import { NoContractsFound, ErrorState } from "@/components/common/EmptyStates";
import { useErrorState } from "@/lib/hooks/useErrorState";

// TODO: hide create contract button based on permission
export default function ContractsPage() {
    const router = useRouter();
    const { notifications } = useNotificationsCtx();
    const { error, setError, clearError } = useErrorState();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        ContractStatus | undefined
    >();

    const loadContracts = useCallback(async () => {
        try {
            setIsLoading(true);
            clearError();
            const response = await ContractsService.listContracts({
                page,
                limit: pageSize,
                search: searchQuery || undefined,
                status: statusFilter,
            });
            setContracts(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, searchQuery, statusFilter, clearError, setError]);

    useEffect(() => {
        loadContracts();
    }, [loadContracts]);

    // Listen for contract-related notifications
    useEffect(() => {
        const latestNotification = notifications[0];
        if (
            !latestNotification ||
            !isContractNotification(latestNotification.type)
        ) {
            return;
        }

        // Refresh list when contracts are published or awarded
        if (
            latestNotification.type === NotificationType.CONTRACT_PUBLISHED ||
            latestNotification.type === NotificationType.CONTRACT_AWARDED ||
            latestNotification.type === NotificationType.CONTRACT_CREATED
        ) {
            handleContractNotification(latestNotification, {
                onContractListUpdate: loadContracts,
            });
        }
    }, [notifications, loadContracts]);

    function handleSearchChange(search: string) {
        setSearchQuery(search);
        setPage(1);
    }

    function handleStatusChange(status: ContractStatus | "all") {
        setStatusFilter(status === "all" ? undefined : status);
        setPage(1);
    }

    const hasFilters = !!searchQuery || !!statusFilter;

    return (
        <ErrorBoundary>
            <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                <main className="container mx-auto space-y-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Contracts</h1>
                            <p className="mt-2 text-muted-foreground">
                                Browse and manage available contracts
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Can anyOf={[P.CONTRACT_APPLY]}>
                                <Button variant="outline" asChild>
                                    <Link href="/contracts/my-applications">
                                        My Applications
                                    </Link>
                                </Button>
                            </Can>
                            <Can anyOf={[P.CONTRACT_CREATE]}>
                                <Button asChild>
                                    <Link href="/contracts/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Contract
                                    </Link>
                                </Button>
                            </Can>
                        </div>
                    </div>

                    {error ? (
                        <ErrorState error={error} onRetry={loadContracts} />
                    ) : isLoading ? (
                        <ContractListSkeleton count={pageSize} />
                    ) : contracts.length === 0 ? (
                        <NoContractsFound
                            hasFilters={hasFilters}
                            onClearFilters={() => {
                                setSearchQuery("");
                                setStatusFilter(undefined);
                                setPage(1);
                            }}
                            onCreateNew={() => router.push("/contracts/new")}
                            canCreate={true}
                        />
                    ) : (
                        <ContractList
                            contracts={contracts}
                            total={contracts.length}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                            onSearchChange={handleSearchChange}
                            onStatusChange={handleStatusChange}
                            currentStatus={statusFilter || "all"}
                            currentSearch={searchQuery}
                            loading={isLoading}
                        />
                    )}
                </main>
            </ProtectedRoute>
        </ErrorBoundary>
    );
}
