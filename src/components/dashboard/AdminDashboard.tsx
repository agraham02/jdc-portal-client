"use client";

import { StatsCard } from "./admin/StatsCard";
import { PendingApprovalsCard } from "./admin/PendingApprovalsCard";
import { RecentActivityCard } from "./admin/RecentActivityCard";

/**
 * AdminDashboard shows system-wide statistics, pending approvals,
 * and recent system activity for administrators
 */
export function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    System overview and pending actions
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard />
                <PendingApprovalsCard />
                <RecentActivityCard />
            </div>
        </div>
    );
}
