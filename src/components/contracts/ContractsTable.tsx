"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    GenericTable,
    type GenericTableConfig,
    useTableState,
} from "@/components/ui/generic-table";
import { ContractsService } from "@/lib/services/contracts";
import { Contract, ContractStatus } from "@/lib/types/contracts";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../common";
import { useErrorState } from "@/lib/hooks/useErrorState";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Can } from "../auth/Can";
import { Button } from "../ui/button";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export function ContractsTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.CONTRACT_READ, P.CONTRACT_READ_ALL]);
    const canReadAll = hasAny([P.CONTRACT_READ_ALL]);
    const canUpdate = hasAny([P.CONTRACT_UPDATE]);
    const canPublish = hasAny([P.CONTRACT_PUBLISH]);
    const canDelete = hasAny([P.CONTRACT_DELETE]);

    const { error, setError, clearError } = useErrorState();
    const [loading, setLoading] = useState(true);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [totalContracts, setTotalContracts] = useState(0);

    // Only show status filter if user can see all contracts
    const filterDefinitions = useMemo<
        GenericTableConfig<Contract>["filters"]
    >(() => {
        const filters: GenericTableConfig<Contract>["filters"] = [
            {
                key: "search",
                label: "Search",
                type: "search",
                placeholder: "Search contracts...",
                className: "w-64",
            },
        ];
        // Only users with CONTRACT_READ_ALL can filter by status
        if (canReadAll) {
            filters.push({
                key: "status",
                label: "Status",
                type: "select",
                className: "w-40",
                options: [
                    { value: ContractStatus.DRAFT, label: "Draft" },
                    { value: ContractStatus.OPEN, label: "Open" },
                    { value: ContractStatus.CLOSED, label: "Closed" },
                    { value: ContractStatus.AWARDED, label: "Awarded" },
                ],
            });
        }
        return filters;
    }, [canReadAll]);

    const tableState = useTableState<Contract>({
        filters: filterDefinitions,
        defaultPageSize: 25,
        enablePagination: true,
    } as GenericTableConfig<Contract>);

    const {
        page,
        pageSize,
        filters: activeFilters,
        setPage,
        setPageSize,
    } = tableState;
    const searchFilter = activeFilters.search?.trim() ?? "";
    const statusFilter =
        activeFilters.status && activeFilters.status !== "all"
            ? (activeFilters.status as ContractStatus)
            : undefined;

    const loadContracts = useCallback(async () => {
        if (!canRead) return;

        setLoading(true);
        clearError();
        try {
            const response = await ContractsService.listContracts({
                page,
                limit: pageSize,
                search: searchFilter || undefined,
                status: statusFilter,
            });
            setContracts(response.data);
            setTotalContracts(response.total);
            if (response.page && response.page !== page) {
                setPage(response.page);
            }
            if (response.limit && response.limit !== pageSize) {
                setPageSize(response.limit);
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [
        canRead,
        page,
        pageSize,
        searchFilter,
        statusFilter,
        setPage,
        setPageSize,
        clearError,
        setError,
    ]);

    useEffect(() => {
        loadContracts();
    }, [loadContracts]);

    // TODO: Add Novu notification listener for real-time contract updates

    const tableConfig: GenericTableConfig<Contract> = useMemo(() => {
        const handleOpen = async (contract: Contract) => {
            try {
                await ContractsService.openContract(contract._id);
                apiToast.success(successMessages.contracts.published);
                await loadContracts();
            } catch (error) {
                apiToast.error(errorMessages.contracts.publish, error);
            }
        };

        const handleClose = async (contract: Contract) => {
            try {
                await ContractsService.closeContract(contract._id);
                apiToast.success(successMessages.contracts.closed);
                await loadContracts();
            } catch (error) {
                apiToast.error(errorMessages.contracts.close, error);
            }
        };

        const handleDelete = async (contract: Contract) => {
            try {
                await ContractsService.deleteContract(contract._id);
                apiToast.success(successMessages.contracts.deleted);
                await loadContracts();
            } catch (error) {
                apiToast.error(errorMessages.contracts.delete, error);
            }
        };

        return {
            columns: [
                {
                    key: "title",
                    label: "Title",
                    render: (contract) => (
                        <div className="max-w-[300px]">
                            <Link
                                href={`/contracts/${contract._id}`}
                                className="font-medium text-foreground hover:underline"
                            >
                                {contract.title}
                            </Link>
                        </div>
                    ),
                },
                {
                    key: "status",
                    label: "Status",
                    render: (contract) => (
                        <StatusBadge
                            type="contract"
                            status={contract.status}
                            showIcon={false}
                        />
                    ),
                },
                {
                    key: "budget",
                    label: "Budget",
                    render: (contract) =>
                        contract.budget
                            ? formatCurrency(contract.budget, contract.currency)
                            : "—",
                },
                {
                    key: "deadline",
                    label: "Deadline",
                    render: (contract) =>
                        contract.deadline ? formatDate(contract.deadline) : "—",
                },
                {
                    key: "applicationCount",
                    label: "Applications",
                    render: (contract) => (
                        <span className="text-muted-foreground">
                            {contract.applicationCount ?? 0}
                        </span>
                    ),
                },
                {
                    key: "createdBy",
                    label: "Created By",
                    render: (contract) =>
                        contract.createdBy?.fullName ||
                        contract.createdBy?.email ||
                        "—",
                },
                {
                    key: "createdAt",
                    label: "Created",
                    render: (contract) => formatDate(contract.createdAt),
                },
            ],
            actions: [
                {
                    key: "view",
                    label: "View",
                    variant: "secondary" as const,
                    onClick: (contract: Contract) => {
                        router.push(`/contracts/${contract._id}`);
                    },
                },
                ...(canUpdate
                    ? [
                          {
                              key: "edit",
                              label: "Edit",
                              variant: "secondary" as const,
                              onClick: (contract: Contract) => {
                                  router.push(
                                      `/contracts/${contract._id}/edit`
                                  );
                              },
                              hidden: (contract: Contract) =>
                                  contract.status !== ContractStatus.DRAFT,
                          },
                      ]
                    : []),
                ...(canPublish
                    ? [
                          {
                              key: "publish",
                              label: "Open",
                              variant: "default" as const,
                              onClick: handleOpen,
                              hidden: (contract: Contract) =>
                                  contract.status !== ContractStatus.DRAFT,
                          },
                          {
                              key: "close",
                              label: "Close",
                              variant: "destructive" as const,
                              onClick: handleClose,
                              hidden: (contract: Contract) =>
                                  contract.status !== ContractStatus.OPEN,
                          },
                      ]
                    : []),
                ...(canDelete
                    ? [
                          {
                              key: "delete",
                              label: "Delete",
                              variant: "destructive" as const,
                              onClick: handleDelete,
                              hidden: (contract: Contract) =>
                                  contract.status !== ContractStatus.DRAFT,
                          },
                      ]
                    : []),
            ],
            filters: filterDefinitions,
            searchFields: ["title", "description"],
            defaultPageSize: 25,
            enablePagination: true,
            manualFiltering: true,
            manualPagination: true,
            loadingMessage: "Loading contracts…",
            emptyMessage: "No contracts found",
            onRowClick: (contract) => router.push(`/contracts/${contract._id}`),
        };
    }, [
        canUpdate,
        canPublish,
        canDelete,
        router,
        loadContracts,
        filterDefinitions,
    ]);

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don&apos;t have permission to view contracts.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-end gap-3">
                <Can anyOf={[P.CONTRACT_APPLY]}>
                    <Button variant="outline" asChild>
                        <Link href="/contracts/my-applications">
                            <FileText className="mr-2 h-4 w-4" />
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

            {/* Table */}
            <GenericTable
                data={contracts}
                loading={loading}
                error={error}
                config={tableConfig}
                onRefresh={loadContracts}
                state={tableState}
                totalItems={totalContracts}
            />
        </div>
    );
}
