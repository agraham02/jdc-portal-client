"use client";

import { useUnreadCount } from "@/lib/hooks/useUnreadCount";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
    className?: string;
    onClick?: () => void;
}

export function NotificationBadge({
    className = "",
    onClick,
}: NotificationBadgeProps) {
    const { unreadCount, loading } = useUnreadCount();

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="w-6 h-6 bg-muted rounded-full"></div>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`relative p-2 hover:bg-muted transition-colors rounded-lg ${className}`}
            aria-label={`${unreadCount} unread notifications`}
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
}
