"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCheck, Filter, Loader2, Search } from "lucide-react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import {
    NotificationType,
    NotificationSeverity,
} from "@/lib/types/notifications";

/**
 * User notifications inbox page
 * Features: filtering by type/severity/read status, search, pagination, bulk actions
 */
export default function NotificationsInboxPage() {
    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        markAllRead,
        markRead,
        remove,
        list,
        loadMore,
    } = useNotificationsCtx();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<NotificationType | "all">(
        "all"
    );
    const [filterSeverity, setFilterSeverity] = useState<
        NotificationSeverity | "all"
    >("all");
    const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">(
        "all"
    );

    const handleFilter = () => {
        list({
            page: 1,
            limit: 20,
            ...(searchQuery && { search: searchQuery }),
            ...(filterType !== "all" && { type: filterType }),
            ...(filterSeverity !== "all" && { severity: filterSeverity }),
            ...(filterRead === "read" && { read: true }),
            ...(filterRead === "unread" && { read: false }),
        });
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setFilterType("all");
        setFilterSeverity("all");
        setFilterRead("all");
        list({ page: 1, limit: 20 });
    };

    const hasFilters =
        searchQuery ||
        filterType !== "all" ||
        filterSeverity !== "all" ||
        filterRead !== "all";

    return (
        <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
            <main className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${
                                      unreadCount !== 1 ? "s" : ""
                                  }`
                                : "All caught up!"}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => markAllRead()}
                        disabled={unreadCount === 0 || loading}
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all read
                    </Button>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleFilter()
                                    }
                                    className="pl-9"
                                />
                            </div>

                            {/* Type Filter */}
                            <Select
                                value={filterType}
                                onValueChange={(v) =>
                                    setFilterType(v as NotificationType | "all")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    {Object.values(NotificationType).map(
                                        (type) => (
                                            <SelectItem key={type} value={type}>
                                                {type
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Severity Filter */}
                            <Select
                                value={filterSeverity}
                                onValueChange={(v) =>
                                    setFilterSeverity(
                                        v as NotificationSeverity | "all"
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All severities
                                    </SelectItem>
                                    {Object.values(NotificationSeverity).map(
                                        (severity) => (
                                            <SelectItem
                                                key={severity}
                                                value={severity}
                                            >
                                                {severity
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    severity.slice(1)}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>

                            {/* Read Status Filter */}
                            <Select
                                value={filterRead}
                                onValueChange={(v) =>
                                    setFilterRead(
                                        v as "all" | "read" | "unread"
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All status
                                    </SelectItem>
                                    <SelectItem value="unread">
                                        Unread only
                                    </SelectItem>
                                    <SelectItem value="read">
                                        Read only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex gap-2">
                            <Button onClick={handleFilter} disabled={loading}>
                                Apply Filters
                            </Button>
                            {hasFilters && (
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <Card>
                    <CardContent className="p-6">
                        {loading && notifications.length === 0 ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-muted rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    No notifications found
                                </p>
                                <p className="text-sm mt-1">
                                    {hasFilters
                                        ? "Try adjusting your filters"
                                        : "You're all caught up!"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={markRead}
                                            onDelete={remove}
                                        />
                                    ))}
                                </div>

                                {/* Load More */}
                                {hasMore && (
                                    <div className="mt-6 text-center">
                                        <Button
                                            variant="outline"
                                            onClick={loadMore}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                "Load more"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </ProtectedRoute>
    );
}
