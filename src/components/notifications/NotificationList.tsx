"use client";

import { useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { NotificationType } from "@/lib/types/notifications";
import type { NotificationQueryParams } from "@/lib/types/notifications";

interface NotificationListProps {
    className?: string;
}

export function NotificationList({ className }: NotificationListProps) {
    const [filters, setFilters] = useState<NotificationQueryParams>({
        page: 1,
        limit: 20,
    });

    const {
        notifications,
        loading,
        error,
        pagination,
        unreadCount,
        refetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        hasMore,
    } = useNotifications(filters);

    const handleFilterChange = (
        newFilters: Partial<NotificationQueryParams>
    ) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleSearchChange = (search: string) => {
        handleFilterChange({ search: search || undefined });
    };

    const handleTypeFilter = (type: string) => {
        handleFilterChange({
            type: type === "all" ? undefined : (type as NotificationType),
        });
    };

    const handleReadFilter = (read: string) => {
        handleFilterChange({
            read: read === "all" ? undefined : read === "true",
        });
    };

    if (loading && notifications.length === 0) {
        return (
            <div className={`space-y-4 ${className}`}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-muted h-20 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-semibold">
                            Notifications
                        </h2>
                        <p className="text-muted-foreground">
                            {pagination.total} total notifications
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline">
                            Mark all as read
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount}
                            </Badge>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search notifications..."
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Filter controls */}
                    <div className="flex gap-2">
                        <select
                            onChange={(e) => handleReadFilter(e.target.value)}
                            defaultValue="all"
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-32"
                        >
                            <option value="all">All</option>
                            <option value="false">Unread</option>
                            <option value="true">Read</option>
                        </select>

                        <select
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            defaultValue="all"
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-40"
                        >
                            <option value="all">All Types</option>
                            <option value={NotificationType.CONTRACT_CREATED}>
                                Contracts
                            </option>
                            <option
                                value={NotificationType.APPLICATION_SUBMITTED}
                            >
                                Applications
                            </option>
                            <option value={NotificationType.EMPLOYEE_APPROVED}>
                                Employees
                            </option>
                            <option value={NotificationType.VENDOR_APPROVED}>
                                Vendors
                            </option>
                            <option value={NotificationType.FILE_UPLOADED}>
                                Files
                            </option>
                            <option
                                value={NotificationType.SYSTEM_ANNOUNCEMENT}
                            >
                                System
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notification List */}
            {notifications.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-muted-foreground text-lg mb-2">
                        No notifications found
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {filters.search ||
                        filters.type ||
                        filters.read !== undefined
                            ? "Try adjusting your filters"
                            : "You're all caught up!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                        />
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center pt-6">
                            <Button
                                onClick={loadMore}
                                disabled={loading}
                                variant="outline"
                                className="min-w-32"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
