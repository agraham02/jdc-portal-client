"use client";

import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCheck } from "lucide-react";

export default function NotificationsInboxPage() {
    const {
        notifications,
        unreadCount,
        loading,
        markAllRead,
        markRead,
        remove,
    } = useNotificationsCtx();
    return (
        <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
            <main className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Notification Inbox
                    </h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllRead()}
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Notifications{" "}
                            {unreadCount > 0 ? `(Unread: ${unreadCount})` : ""}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && notifications.length === 0 ? (
                            <div className="space-y-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-muted rounded animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <p className="text-muted-foreground">
                                You&apos;re all caught up.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {notifications.map((n) => (
                                    <li
                                        key={n.id}
                                        className={`rounded border p-3 ${
                                            n.read
                                                ? "opacity-80"
                                                : "border-blue-300 bg-blue-50 dark:bg-blue-950/30"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`mt-1 h-2 w-2 rounded-full ${
                                                    n.read
                                                        ? "bg-muted"
                                                        : "bg-blue-500"
                                                }`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {n.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                                    {n.message}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {new Date(
                                                        n.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!n.read && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            markRead(n.id)
                                                        }
                                                    >
                                                        Mark read
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => remove(n.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </main>
        </ProtectedRoute>
    );
}
