"use client";

import { QuickLinksCard } from "./employee/QuickLinksCard";
import { RecentNotificationsCard } from "./employee/RecentNotificationsCard";

/**
 * EmployeeDashboard shows quick access links and recent notifications
 * tailored for employee users
 */
export function EmployeeDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's your overview
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <QuickLinksCard />
                <RecentNotificationsCard />
            </div>
        </div>
    );
}
