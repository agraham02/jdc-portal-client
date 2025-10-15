"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { VendorService, type VendorWithUser } from "@/lib/services/vendor";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PendingItem {
    id: string;
    type: "vendor";
    name: string;
    email: string;
    submittedAt: string;
}

/**
 * PendingApprovalsCard shows recent vendors awaiting approval
 * with quick action links to the approval pages.
 *
 * Note: User approvals are handled separately via account activation flow
 */
export function PendingApprovalsCard() {
    const { data: pendingVendors, error: vendorsError } = useSWR(
        "/pending-vendors-list",
        async () => {
            const result = await VendorService.getPendingVendors();
            return result.data || [];
        }
    );

    const isLoading = !pendingVendors;
    const error = vendorsError?.message;

    // Map vendors to pending items and filter out any without createdAt
    const allPending: PendingItem[] = (pendingVendors || [])
        .filter((v: VendorWithUser) => v.createdAt)
        .map((v: VendorWithUser) => ({
            id: v._id,
            type: "vendor" as const,
            name: v.companyName,
            email: v.contactEmail,
            submittedAt:
                v.createdAt instanceof Date
                    ? v.createdAt.toISOString()
                    : String(v.createdAt),
        }))
        .sort(
            (a, b) =>
                new Date(b.submittedAt).getTime() -
                new Date(a.submittedAt).getTime()
        )
        .slice(0, 5);

    return (
        <BaseDashboardCard
            title="Pending Approvals"
            isLoading={isLoading}
            error={error}
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/approvals">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            {allPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No pending approvals
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {allPending.map((item) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="flex items-start justify-between gap-4 rounded-lg border p-3"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{item.name}</p>
                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                                        Vendor
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {item.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                        new Date(item.submittedAt),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={`/admin/approvals?type=${item.type}&id=${item.id}`}
                                >
                                    Review
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </BaseDashboardCard>
    );
}
