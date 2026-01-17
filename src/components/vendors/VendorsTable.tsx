"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    GenericTable,
    type GenericTableConfig,
    useTableState,
} from "@/components/ui/generic-table";
import { VendorService } from "@/lib/services/vendor";
import { UserStatus, type User, type Vendor } from "@/lib/types/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { UserStatusHelper } from "@/lib/utils/user-status-helper";
import { PermissionName as P } from "@/lib/constants/permission-names";
import TextPreview from "@/components/common/TextPreview";
import { StatusBadge } from "../common";
import { useErrorState } from "@/lib/hooks/useErrorState";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getPopulatedUser(vendor: Vendor): User | null {
    const user = vendor.userId;
    if (
        typeof user === "object" &&
        user !== null &&
        "status" in user &&
        typeof user.status === "string"
    ) {
        return user;
    }
    return null;
}

export function VendorsTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.VENDOR_READ, P.VENDOR_READ_ALL]);
    const canManage = hasAny([
        P.VENDOR_UPDATE,
        P.VENDOR_UPDATE_ALL,
        P.VENDOR_APPROVE,
    ]);
    const canDelete = hasAny([P.VENDOR_DELETE]);

    const { error, setError, clearError } = useErrorState();
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [totalVendors, setTotalVendors] = useState(0);
    const [confirmAction, setConfirmAction] = useState<null | {
        type: "reject" | "deactivate";
        vendor: Vendor;
    }>(null);
    const hasSyncedFromUrlRef = useRef(false);
    const filtersRef = useRef<Record<string, string>>({});

    // Get initial status from URL query params
    const initialStatus = useMemo(() => {
        const status = searchParams.get("status");
        if (
            status &&
            Object.values(UserStatus).includes(status as UserStatus)
        ) {
            return status as UserStatus;
        }
        return undefined;
    }, [searchParams]);
    const initialSearch = useMemo(() => {
        return searchParams.get("search") || "";
    }, [searchParams]);

    const filterDefinitions = useMemo<GenericTableConfig<Vendor>["filters"]>(
        () => [
            {
                key: "search",
                label: "Search",
                type: "search",
                placeholder: "Search company or contact",
                className: "w-64",
            },
            {
                key: "status",
                label: "Status",
                type: "select",
                className: "w-40",
                options: [
                    { value: UserStatus.ACTIVE, label: "Active" },
                    { value: UserStatus.PENDING, label: "Pending" },
                    { value: UserStatus.ONBOARDING, label: "Onboarding" },
                    { value: UserStatus.INACTIVE, label: "Inactive" },
                    { value: UserStatus.REJECTED, label: "Rejected" },
                    { value: UserStatus.TERMINATED, label: "Terminated" },
                    { value: UserStatus.ARCHIVED, label: "Archived" },
                ],
            },
        ],
        []
    );

    const tableState = useTableState({
        filters: filterDefinitions,
        defaultPageSize: 25,
    });

    const {
        page,
        pageSize,
        filters: activeFilters,
        setPage,
        setPageSize,
        updateFilter,
    } = tableState;

    useEffect(() => {
        filtersRef.current = activeFilters;
    }, [activeFilters]);

    // Sync filters from URL query params (for back/forward navigation)
    useEffect(() => {
        const nextStatus = initialStatus ?? "all";
        const nextSearch = initialSearch ?? "";
        const currentFilters = filtersRef.current;

        if (currentFilters.status !== nextStatus) {
            updateFilter("status", nextStatus);
        }
        if ((currentFilters.search ?? "") !== nextSearch) {
            updateFilter("search", nextSearch);
        }

        if (!hasSyncedFromUrlRef.current) {
            hasSyncedFromUrlRef.current = true;
        }
    }, [initialStatus, initialSearch, updateFilter]);

    const searchFilter = activeFilters.search?.trim() ?? "";
    const [debouncedSearch, setDebouncedSearch] = useState(searchFilter);
    const statusFilter =
        activeFilters.status && activeFilters.status !== "all"
            ? (activeFilters.status as UserStatus)
            : undefined;

    useEffect(() => {
        const timeoutId = globalThis.setTimeout(() => {
            setDebouncedSearch(searchFilter);
        }, 400);

        return () => globalThis.clearTimeout(timeoutId);
    }, [searchFilter]);

    useEffect(() => {
        if (!hasSyncedFromUrlRef.current) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        if (statusFilter) {
            params.set("status", statusFilter);
        } else {
            params.delete("status");
        }

        const nextQuery = params.toString();
        const currentQuery = searchParams.toString();
        if (nextQuery !== currentQuery) {
            router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
                scroll: false,
            });
        }
    }, [debouncedSearch, statusFilter, pathname, router, searchParams]);

    const loadVendors = useCallback(async () => {
        if (!canRead) return;

        setLoading(true);
        clearError();
        try {
            const response = await VendorService.getVendors({
                page,
                limit: pageSize,
                search: debouncedSearch || undefined,
                status: statusFilter,
            });
            setVendors(response.data);
            setTotalVendors(response.total);
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
        debouncedSearch,
        statusFilter,
        setPage,
        setPageSize,
        clearError,
        setError,
    ]);

    useEffect(() => {
        loadVendors();
    }, [loadVendors]);

    const runVendorAction = useCallback(
        async (
            action: () => Promise<void>,
            successMessage: string,
            errorMessage: string
        ) => {
            try {
                await action();
                apiToast.success(successMessage);
                await loadVendors();
            } catch (error) {
                apiToast.error(errorMessage, error);
            }
        },
        [loadVendors]
    );

    const handleApprove = useCallback(
        async (vendor: Vendor) => {
            await runVendorAction(
                () => VendorService.approveVendor(vendor._id),
                successMessages.vendors.approved,
                errorMessages.vendors.approve
            );
        },
        [runVendorAction]
    );

    const handleReject = useCallback(
        async (vendor: Vendor) => {
            await runVendorAction(
                () =>
                    VendorService.rejectVendor(vendor._id, "Rejected by admin"),
                successMessages.vendors.rejected,
                errorMessages.vendors.reject
            );
        },
        [runVendorAction]
    );

    const handleDeactivate = useCallback(
        async (vendor: Vendor) => {
            await runVendorAction(
                () => VendorService.deactivateVendor(vendor._id),
                successMessages.vendors.deactivated,
                errorMessages.vendors.deactivate
            );
        },
        [runVendorAction]
    );

    const tableConfig: GenericTableConfig<Vendor> = useMemo(() => {
        return {
            columns: [
                {
                    key: "companyName",
                    label: "Company Name",
                },
                {
                    key: "contactName",
                    label: "Contact Name",
                    render: (vendor) => vendor.contactName || "—",
                },
                {
                    key: "contactEmail",
                    label: "Contact Email",
                    render: (vendor) =>
                        vendor.contactEmail ? (
                            <a
                                href={`mailto:${vendor.contactEmail}`}
                                className="text-blue-600 hover:underline"
                            >
                                {vendor.contactEmail}
                            </a>
                        ) : (
                            "—"
                        ),
                },
                {
                    key: "website",
                    label: "Website",
                    render: (vendor) =>
                        vendor.website ? (
                            <a
                                href={
                                    vendor.website.startsWith("http")
                                        ? vendor.website
                                        : `https://${vendor.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {vendor.website}
                            </a>
                        ) : (
                            "—"
                        ),
                },
                {
                    key: "servicesOffered",
                    label: "Services",
                    render: (vendor) => {
                        return <TextPreview items={vendor.servicesOffered} />;
                    },
                },
                {
                    key: "status",
                    label: "Status",
                    render: (vendor) => {
                        const user = getPopulatedUser(vendor);
                        return (
                            <StatusBadge type="user" status={user?.status} />
                        );
                    },
                },
            ],
            actions: [
                {
                    key: "view",
                    label: "View details",
                    variant: "secondary" as const,
                    onClick: (vendor: Vendor) => {
                        router.push(`/vendors/${vendor._id}`);
                    },
                },
                ...(canManage
                    ? [
                          {
                              key: "approve",
                              label: "Quick Approve",
                              variant: "default" as const,
                              onClick: handleApprove,
                              hidden: (vendor: Vendor) => {
                                  const user = getPopulatedUser(vendor);
                                  return user?.status !== UserStatus.PENDING;
                              },
                          },
                          {
                              key: "reject",
                              label: "Quick Reject",
                              variant: "destructive" as const,
                              onClick: (vendor: Vendor) =>
                                  setConfirmAction({
                                      type: "reject",
                                      vendor,
                                  }),
                              hidden: (vendor: Vendor) => {
                                  // Only show for pending vendors
                                  const user = getPopulatedUser(vendor);
                                  return user?.status !== UserStatus.PENDING;
                              },
                          },
                      ]
                    : []),
                ...(canDelete
                    ? [
                          {
                              key: "deactivate",
                              label: "Deactivate",
                              variant: "destructive" as const,
                              onClick: (vendor: Vendor) =>
                                  setConfirmAction({
                                      type: "deactivate",
                                      vendor,
                                  }),
                              hidden: (vendor: Vendor) => {
                                  const user = getPopulatedUser(vendor);
                                  return (
                                      !user?.status ||
                                      UserStatusHelper.isRestricted(user.status)
                                  );
                              },
                          },
                      ]
                    : []),
            ],
            filters: filterDefinitions,
            searchFields: ["companyName", "contactName", "website"],
            defaultPageSize: 25,
            enablePagination: true,
            manualFiltering: true,
            manualPagination: true,
            loadingMessage: "Loading vendors…",
            emptyMessage: "No vendors found",
        };
    }, [
        canManage,
        canDelete,
        router,
        filterDefinitions,
        handleApprove,
    ]);

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don&apos;t have permission to view vendors.
            </div>
        );
    }

    return (
        <>
            <GenericTable
                data={vendors}
                loading={loading}
                error={error}
                config={tableConfig}
                onRefresh={loadVendors}
                state={tableState}
                totalItems={totalVendors}
            />
            <AlertDialog
                open={Boolean(confirmAction)}
                onOpenChange={(open) => {
                    if (!open) setConfirmAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === "reject"
                                ? "Reject vendor"
                                : "Deactivate vendor"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === "reject"
                                ? "This will reject the vendor’s account request. They will need to reapply if this was a mistake."
                                : "This will deactivate the vendor’s account. They will lose access until reactivated."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!confirmAction) return;
                                if (confirmAction.type === "reject") {
                                    await handleReject(confirmAction.vendor);
                                } else {
                                    await handleDeactivate(
                                        confirmAction.vendor
                                    );
                                }
                                setConfirmAction(null);
                            }}
                        >
                            {confirmAction?.type === "reject"
                                ? "Reject"
                                : "Deactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
