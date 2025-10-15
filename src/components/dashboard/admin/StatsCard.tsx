"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { UserService } from "@/lib/services/user";
import { VendorService } from "@/lib/services/vendor";
import { ContractsService } from "@/lib/services/contracts";
import { Users, Briefcase, FileText } from "lucide-react";
import { ContractStatus } from "@/lib/types/contracts";

/**
 * StatsCard displays key system metrics for administrators:
 * - Total users and pending approvals
 * - Total vendors and pending approvals
 * - Total contracts and active contracts
 */
export function StatsCard() {
    const { data: usersData, error: usersError } = useSWR(
        "/users-stats",
        async () => {
            // Get just counts (limit=1 to minimize data transfer)
            const allUsers = await UserService.getUsers({ limit: 1, page: 1 });
            return {
                totalUsers: allUsers.total || 0,
                // Note: No separate pending endpoint, would need status filter
                pendingUsers: 0, // TODO: Add status filter when backend supports it
            };
        }
    );

    const { data: vendorsData, error: vendorsError } = useSWR(
        "/vendors-stats",
        async () => {
            const [allVendors, pending] = await Promise.all([
                VendorService.getVendors({ limit: 1, page: 1 }),
                VendorService.getPendingVendors(),
            ]);
            return {
                totalVendors: allVendors.total || 0,
                pendingVendors: pending.total || 0,
            };
        }
    );

    const { data: contractsData, error: contractsError } = useSWR(
        "/contracts-stats",
        async () => {
            const [all, active] = await Promise.all([
                ContractsService.listContracts({ limit: 1, page: 1 }),
                ContractsService.listContracts({
                    limit: 1,
                    page: 1,
                    status: ContractStatus.OPEN,
                }),
            ]);
            return {
                totalContracts: all.total || 0,
                activeContracts: active.total || 0,
            };
        }
    );

    const isLoading = !usersData || !vendorsData || !contractsData;
    const error =
        usersError?.message || vendorsError?.message || contractsError?.message;

    return (
        <BaseDashboardCard
            title="System Overview"
            isLoading={isLoading}
            error={error}
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
                                {usersData?.totalUsers || 0}
                            </p>
                            {usersData && usersData.pendingUsers > 0 && (
                                <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {usersData.pendingUsers} pending
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
                                {vendorsData?.totalVendors || 0}
                            </p>
                            {vendorsData && vendorsData.pendingVendors > 0 && (
                                <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {vendorsData.pendingVendors} pending
                                </span>
                            )}
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
                                {contractsData?.totalContracts || 0}
                            </p>
                            {contractsData &&
                                contractsData.activeContracts > 0 && (
                                    <span className="text-sm text-green-600 dark:text-green-400">
                                        {contractsData.activeContracts} active
                                    </span>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseDashboardCard>
    );
}
