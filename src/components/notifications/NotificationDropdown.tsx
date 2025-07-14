"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NotificationType } from "@/lib/types/notifications";
import { Bell, X, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function NotificationDropdown({
    isOpen,
    onClose,
    className = "",
}: NotificationDropdownProps) {
    const { notifications, loading, markAsRead, unreadCount } =
        useNotifications({
            limit: 5,
            page: 1,
        });

    if (!isOpen) return null;

    const formatNotificationType = (type: NotificationType): string => {
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getNotificationColor = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.APPLICATION_ACCEPTED:
            case NotificationType.EMPLOYEE_APPROVED:
            case NotificationType.VENDOR_APPROVED:
            case NotificationType.FILE_APPROVED:
            case NotificationType.CONTRACT_AWARDED:
                return "text-green-600";
            case NotificationType.APPLICATION_REJECTED:
            case NotificationType.EMPLOYEE_REJECTED:
            case NotificationType.VENDOR_REJECTED:
            case NotificationType.FILE_REJECTED:
                return "text-red-600";
            case NotificationType.CONTRACT_DEADLINE_APPROACHING:
                return "text-yellow-600";
            default:
                return "text-blue-600";
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

            {/* Dropdown */}
            <Card
                className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg ${className}`}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="text-xs"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-muted h-16 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                                        !notification.read
                                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification.id);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium line-clamp-1">
                                                {notification.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getNotificationColor(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {formatNotificationType(
                                                        notification.type
                                                    )}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.createdAt
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="p-3 border-t border-border bg-muted/30">
                        <Link href="/notifications" onClick={onClose}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                            >
                                View all notifications
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
