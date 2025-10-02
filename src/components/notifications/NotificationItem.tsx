"use client";

import { formatDistanceToNow } from "date-fns";
import {
    CheckCheck,
    Trash2,
    AlertCircle,
    CheckCircle,
    Info,
    AlertTriangle,
} from "lucide-react";
import type { Notification } from "@/lib/types/notifications";
import { NotificationSeverity } from "@/lib/types/notifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    notification: Notification;
    onMarkRead?: (id: string) => void;
    onDelete?: (id: string) => void;
    onClick?: (notification: Notification) => void;
    compact?: boolean;
}

/**
 * Get icon and colors based on notification severity
 */
function getSeverityDisplay(severity: NotificationSeverity) {
    switch (severity) {
        case NotificationSeverity.SUCCESS:
            return {
                icon: CheckCircle,
                bgColor: "bg-green-50 dark:bg-green-950",
                borderColor: "border-green-200 dark:border-green-800",
                iconColor: "text-green-600 dark:text-green-400",
                dotColor: "bg-green-500",
            };
        case NotificationSeverity.WARNING:
            return {
                icon: AlertTriangle,
                bgColor: "bg-yellow-50 dark:bg-yellow-950",
                borderColor: "border-yellow-200 dark:border-yellow-800",
                iconColor: "text-yellow-600 dark:text-yellow-400",
                dotColor: "bg-yellow-500",
            };
        case NotificationSeverity.ERROR:
        case NotificationSeverity.CRITICAL:
            return {
                icon: AlertCircle,
                bgColor: "bg-red-50 dark:bg-red-950",
                borderColor: "border-red-200 dark:border-red-800",
                iconColor: "text-red-600 dark:text-red-400",
                dotColor: "bg-red-500",
            };
        default:
            return {
                icon: Info,
                bgColor: "bg-blue-50 dark:bg-blue-950",
                borderColor: "border-blue-200 dark:border-blue-800",
                iconColor: "text-blue-600 dark:text-blue-400",
                dotColor: "bg-blue-500",
            };
    }
}

/**
 * Reusable notification item component
 * Displays notification with severity indicator, actions, and timestamp
 */
export function NotificationItem({
    notification,
    onMarkRead,
    onDelete,
    onClick,
    compact = false,
}: NotificationItemProps) {
    const {
        icon: Icon,
        bgColor,
        borderColor,
        iconColor,
        dotColor,
    } = getSeverityDisplay(notification.severity);

    const handleClick = () => {
        if (onClick) {
            onClick(notification);
        }
    };

    const handleMarkRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkRead?.(notification.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(notification.id);
    };

    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors border",
                    !notification.read && bgColor,
                    !notification.read ? borderColor : "border-border",
                    onClick && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={handleClick}
            >
                {/* Unread indicator */}
                {!notification.read && (
                    <div
                        className={cn(
                            "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                            dotColor
                        )}
                    />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <Icon
                            className={cn(
                                "w-4 h-4 flex-shrink-0 mt-0.5",
                                iconColor
                            )}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    {
                                        addSuffix: true,
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && onMarkRead && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleMarkRead}
                            title="Mark as read"
                        >
                            <CheckCheck className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={handleDelete}
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                !notification.read && bgColor,
                !notification.read ? borderColor : "border-border",
                onClick && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={handleClick}
        >
            {/* Severity Icon */}
            <div className={cn("p-2 rounded-full", bgColor)}>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {!notification.read && (
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full flex-shrink-0",
                                        dotColor
                                    )}
                                />
                            )}
                            <h4 className="font-semibold text-sm">
                                {notification.title}
                            </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    {
                                        addSuffix: true,
                                    }
                                )}
                            </p>
                            {notification.category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                    {notification.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {!notification.read && onMarkRead && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkRead}
                                title="Mark as read"
                            >
                                <CheckCheck className="w-4 h-4 mr-1" />
                                Mark read
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={handleDelete}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
