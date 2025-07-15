"use client";

import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Building, Bell, Clock, Upload } from "lucide-react";
import type { Notification } from "@/lib/types/notifications";
import { NotificationType } from "@/lib/types/notifications";

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.CONTRACT_CREATED:
        case NotificationType.CONTRACT_AWARDED:
            return FileText;
        case NotificationType.APPLICATION_SUBMITTED:
        case NotificationType.APPLICATION_ACCEPTED:
        case NotificationType.APPLICATION_REJECTED:
            return FileText;
        case NotificationType.EMPLOYEE_APPROVED:
        case NotificationType.EMPLOYEE_REJECTED:
            return Users;
        case NotificationType.VENDOR_APPROVED:
        case NotificationType.VENDOR_REJECTED:
            return Building;
        case NotificationType.FILE_UPLOADED:
        case NotificationType.FILE_APPROVED:
        case NotificationType.FILE_REJECTED:
            return Upload;
        case NotificationType.CONTRACT_DEADLINE_APPROACHING:
            return Clock;
        case NotificationType.SYSTEM_ANNOUNCEMENT:
        default:
            return Bell;
    }
};

const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
        case NotificationType.APPLICATION_ACCEPTED:
        case NotificationType.EMPLOYEE_APPROVED:
        case NotificationType.VENDOR_APPROVED:
        case NotificationType.FILE_APPROVED:
        case NotificationType.CONTRACT_AWARDED:
            return "border-l-green-500";
        case NotificationType.APPLICATION_REJECTED:
        case NotificationType.EMPLOYEE_REJECTED:
        case NotificationType.VENDOR_REJECTED:
        case NotificationType.FILE_REJECTED:
            return "border-l-red-500";
        case NotificationType.CONTRACT_DEADLINE_APPROACHING:
            return "border-l-yellow-500";
        case NotificationType.CONTRACT_CREATED:
        case NotificationType.APPLICATION_SUBMITTED:
        case NotificationType.FILE_UPLOADED:
            return "border-l-blue-500";
        default:
            return "border-l-gray-500";
    }
};

const formatNotificationType = (type: NotificationType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
    });

    const Icon = getNotificationIcon(notification.type);

    const handleMarkAsRead = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    const handleDelete = () => {
        onDelete(notification.id);
    };

    return (
        <div
            className={`
        border-l-4 ${getNotificationColor(notification.type)}
        bg-card p-4 shadow-sm hover:shadow-md transition-shadow rounded-lg
        ${!notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}
      `}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4
                            className={`text-sm font-medium ${
                                notification.read
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            }`}
                        >
                            {notification.title}
                        </h4>
                        <p
                            className={`mt-1 text-sm ${
                                notification.read
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {notification.message}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{timeAgo}</span>
                            <Badge variant="outline" className="text-xs">
                                {formatNotificationType(notification.type)}
                            </Badge>
                            {!notification.read && (
                                <Badge variant="default" className="text-xs">
                                    Unread
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAsRead}
                            className="text-xs h-8"
                        >
                            Mark as read
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="text-xs h-8 text-destructive hover:text-destructive"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}
