"use client";

import { BaseDashboardCard } from "../BaseDashboardCard";
import useSWR from "swr";
import { NotificationsService } from "@/lib/services/notifications";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bell } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { NotificationResponseDto } from "@/lib/types/notifications";

/**
 * RecentActivityCard shows recent system-wide notifications
 * for administrators to stay informed of system events.
 */
export function RecentActivityCard() {
    const { data, error } = useSWR("/admin-recent-activity", async () => {
        const result = await NotificationsService.list({
            limit: 5,
            page: 1,
        });
        return result.data || [];
    });

    const isLoading = !data;
    const notifications = data || [];

    return (
        <BaseDashboardCard
            title="Recent Activity"
            isLoading={isLoading}
            error={error?.message}
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/notifications">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No recent activity
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="flex items-start gap-3 rounded-lg border p-3"
                        >
                            <div
                                className={`mt-1 h-2 w-2 rounded-full ${
                                    notification.read
                                        ? "bg-muted"
                                        : "bg-primary"
                                }`}
                            />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                        new Date(notification.createdAt),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BaseDashboardCard>
    );
}
