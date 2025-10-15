"use client";

import { MyApplicationsCard } from "./vendor/MyApplicationsCard";
import { OpenContractsCard } from "./vendor/OpenContractsCard";
import { RecentNotificationsCard } from "./employee/RecentNotificationsCard";

/**
 * VendorDashboard shows application status, open contracts,
 * and notifications for vendor users
 */
export function VendorDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage your applications and explore opportunities
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <MyApplicationsCard />
                <OpenContractsCard />
                <RecentNotificationsCard />
            </div>
        </div>
    );
}
