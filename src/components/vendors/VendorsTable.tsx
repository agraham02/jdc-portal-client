"use client";

import { useState, useEffect, useMemo } from "react";
import {
    GenericTable,
    type GenericTableConfig,
} from "@/components/ui/generic-table";
import { VendorService } from "@/lib/services/vendor";
import { UserStatus, type User, type Vendor } from "@/lib/types/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import StatusChip from "../common/statusChip";
import TextPreview from "@/components/common/TextPreview";
import { useRouter } from "next/navigation";

export function VendorsTable() {
    const router = useRouter();
    const { hasAny } = useAuthz();
    const canRead = hasAny([P.VENDOR_READ, P.VENDOR_READ_ALL]);
    const canUpdate = hasAny([P.VENDOR_UPDATE]);
    const canDelete = hasAny([P.VENDOR_DELETE]);

    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadVendors = async () => {
        if (!canRead) return;

        setLoading(true);
        setError(null);
        try {
            const response = await VendorService.getVendors();
            console.log(response);
            setVendors(response.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load vendors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, [canRead]);

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

    const tableConfig: GenericTableConfig<Vendor> = useMemo(
        () => ({
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
                    render: (vendor) => (
                        <StatusChip status={(vendor.userId as User).status} />
                    ),
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
                                  return (
                                      (vendor.userId as User).status ===
                                      UserStatus.ACTIVE
                                  );
                              },
                          },
                          {
                              key: "reject",
                              label: "Reject",
                              variant: "destructive" as const,
                              onClick: handleReject,
                              hidden: (vendor: Vendor) => {
                                  // Only show for pending vendors
                                  return (
                                      (vendor.userId as User).status !==
                                      UserStatus.PENDING
                                  );
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
            filters: [
                {
                    key: "search",
                    label: "Search",
                    type: "search",
                    placeholder: "Search company name or contact",
                    className: "w-64",
                },
                {
                    key: "serviceFilter",
                    label: "Service Type",
                    type: "select",
                    className: "w-48",
                    options: [
                        { value: "Maintenance", label: "Maintenance" },
                        { value: "Cleaning", label: "Cleaning" },
                        { value: "Security", label: "Security" },
                        { value: "Landscaping", label: "Landscaping" },
                        { value: "IT Services", label: "IT Services" },
                    ],
                },
            ],
            searchFields: ["companyName", "contactName", "website"],
            defaultPageSize: 25,
            enablePagination: true,
            loadingMessage: "Loading vendors…",
            emptyMessage: "No vendors found",
            customFilter: (vendor, filters) => {
                // Service filter
                const serviceFilter = filters.serviceFilter;
                if (serviceFilter && serviceFilter !== "all") {
                    const services = vendor.servicesOffered || [];
                    if (!services.includes(serviceFilter)) return false;
                }
                return true;
            },
        }),
        [canUpdate, canDelete]
    );

    if (!canRead) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                You don't have permission to view vendors.
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
        />
    );
}
