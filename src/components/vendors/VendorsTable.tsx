"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    GenericTable,
    type GenericTableConfig,
    useTableState,
} from "@/components/ui/generic-table";
import { VendorService } from "@/lib/services/vendor";
import { UserStatus, type User, type Vendor } from "@/lib/types/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import TextPreview from "@/components/common/TextPreview";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../common";

function getPopulatedUser(vendor: Vendor): User | null {
    const user = vendor.userId;
    if (
        typeof user === "object" &&
        user !== null &&
        "status" in user &&
        typeof (user as User).status === "string"
    ) {
        return user as User;
    }
    return null;
}

export function VendorsTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.VENDOR_READ, P.VENDOR_READ_ALL]);
    const canUpdate = hasAny([P.VENDOR_UPDATE]);
    const canDelete = hasAny([P.VENDOR_DELETE]);

    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [totalVendors, setTotalVendors] = useState(0);
    const [error, setError] = useState<string | null>(null);

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
                    { value: UserStatus.INACTIVE, label: "Inactive" },
                ],
            },
        ],
        []
    );

    const tableState = useTableState<Vendor>({
        filters: filterDefinitions,
        defaultPageSize: 25,
        enablePagination: true,
    } as GenericTableConfig<Vendor>);

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
            ? (activeFilters.status as UserStatus)
            : undefined;

    const loadVendors = useCallback(async () => {
        if (!canRead) return;

        setLoading(true);
        setError(null);
        try {
            const response = await VendorService.getVendors({
                page,
                pageSize,
                search: searchFilter || undefined,
                status: statusFilter,
            });
            setVendors(response.data);
            setTotalVendors(response.total);
            if (response.page && response.page !== page) {
                setPage(response.page);
            }
            if (response.pageSize && response.pageSize !== pageSize) {
                setPageSize(response.pageSize);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load vendors");
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
    ]);

    useEffect(() => {
        loadVendors();
    }, [loadVendors]);

    const tableConfig: GenericTableConfig<Vendor> = useMemo(() => {
        const handleApprove = async (vendor: Vendor) => {
            await VendorService.approveUser(vendor._id);
            await loadVendors(); // Refresh the list
        };

        const handleReject = async (vendor: Vendor) => {
            await VendorService.rejectUser(vendor._id, "Rejected by admin");
            await loadVendors(); // Refresh the list
        };

        const handleDeactivate = async (vendor: Vendor) => {
            await VendorService.deactivateUser(vendor._id);
            await loadVendors(); // Refresh the list
        };

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
                    render: (vendor) => vendor.contactEmail || "—",
                },
                {
                    key: "website",
                    label: "Website",
                    render: (vendor) =>
                        vendor.website ? (
                            <a
                                href={vendor.website}
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
                        return <StatusBadge type="user" status={user?.status} />;
                    },
                },
            ],
            actions: [
                ...(canUpdate
                    ? [
                          {
                              key: "view",
                              label: "View details",
                              variant: "secondary" as const,
                              onClick: (vendor: Vendor) => {
                                  router.push(`/vendors/${vendor._id}`);
                              },
                          },
                      ]
                    : []),
                ...(canUpdate
                    ? [
                          {
                              key: "approve",
                              label: "Approve",
                              variant: "default" as const,
                              onClick: handleApprove,
                              hidden: (vendor: Vendor) => {
                                  const user = getPopulatedUser(vendor);
                                  return user?.status === UserStatus.ACTIVE;
                              },
                          },
                          {
                              key: "reject",
                              label: "Reject",
                              variant: "destructive" as const,
                              onClick: handleReject,
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
                              onClick: handleDeactivate,
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
    }, [canUpdate, canDelete, router, loadVendors, filterDefinitions]);

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don&apos;t have permission to view vendors.
            </div>
        );
    }

    return (
        <GenericTable
            data={vendors}
            loading={loading}
            error={error}
            config={tableConfig}
            onRefresh={loadVendors}
            state={tableState}
            totalItems={totalVendors}
        />
    );
}
