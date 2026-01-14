"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { AdminService } from "@/lib/services/admin";
import { Users, Briefcase, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * StatsCard displays key system metrics for administrators:
 * - Total users and pending approvals
 * - Total vendors
 * - Total contracts and open/awarded counts
 */
export function StatsCard() {
    const {
        data: stats,
        error,
        isLoading,
        mutate,
        isValidating,
    } = useSWR("/admin-stats", () => AdminService.getDashboardStats());

    const handleRefresh = () => {
        mutate();
    };

    const refreshButton = (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isValidating}
            className="h-8 w-8"
            aria-label="Refresh stats"
        >
            <RefreshCw
                className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`}
            />
        </Button>
    );

    return (
        <BaseDashboardCard
            title="System Overview"
            isLoading={isLoading}
            error={error?.message}
            action={refreshButton}
        >
            <div className="grid gap-4">
                {/* Users Stats */}
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Users
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">
                                {stats?.users.total ?? 0}
                            </p>
                            <span className="text-sm text-muted-foreground">
                                ({stats?.users.active ?? 0} active)
                            </span>
                            {stats && stats.users.pending > 0 && (
                                <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {stats.users.pending} pending
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vendors Stats */}
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Vendors
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">
                                {stats?.vendors.total ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contracts Stats */}
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                        <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Contracts
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">
                                {stats?.contracts.total ?? 0}
                            </p>
                            {stats && stats.contracts.open > 0 && (
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    {stats.contracts.open} open
                                </span>
                            )}
                            {stats && stats.contracts.awarded > 0 && (
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {stats.contracts.awarded} awarded
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseDashboardCard>
    );
}
