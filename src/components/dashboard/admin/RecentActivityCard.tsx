"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bell } from "lucide-react";
import Link from "next/link";

/**
 * RecentActivityCard shows a link to the notifications inbox
 * Actual notifications are managed by Novu's Inbox component
 */
export function RecentActivityCard() {
    return (
        <BaseDashboardCard
            title="Recent Activity"
            isLoading={false}
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/notifications">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    Check the notification bell for recent activity
                </p>
                <Button variant="link" size="sm" asChild className="mt-2">
                    <Link href="/notifications">View all notifications</Link>
                </Button>
            </div>
        </BaseDashboardCard>
    );
}
