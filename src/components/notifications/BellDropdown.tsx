"use client";

import { useState } from "react";
import { Bell, CheckCheck, Loader2, Wifi, WifiOff } from "lucide-react";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

/**
 * Bell dropdown component - displays notification badge and dropdown list
 * Shows unread count, real-time connection status, and quick actions
 */
export function BellDropdown() {
    const {
        notifications,
        unreadCount,
        loading,
        isConnected,
        markAllRead,
        markRead,
        remove,
    } = useNotificationsCtx();
    const [open, setOpen] = useState(false);

    const displayNotifications = notifications.slice(0, 10);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <div className="relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                        {/* Connection indicator */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${
                                isConnected
                                    ? "bg-green-500"
                                    : "bg-gray-400 dark:bg-gray-600"
                            }`}
                            title={
                                isConnected
                                    ? "Real-time connected"
                                    : "Disconnected"
                            }
                        />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[28rem]">
                {/* Header */}
                <DropdownMenuLabel className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Notifications</span>
                        {isConnected ? (
                            <Wifi className="w-3 h-3 text-green-600" />
                        ) : (
                            <WifiOff className="w-3 h-3 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllRead()}
                                className="h-7 text-xs"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {loading && notifications.length === 0 ? (
                        <div className="py-8 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Loading...
                        </div>
                    ) : displayNotifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>You&apos;re all caught up!</p>
                        </div>
                    ) : (
                        <DropdownMenuGroup className="p-2 space-y-2">
                            {displayNotifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="p-0 cursor-pointer focus:bg-transparent"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <NotificationItem
                                        notification={notification}
                                        onMarkRead={markRead}
                                        onDelete={remove}
                                        compact
                                    />
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Link href="/notifications/inbox">
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setOpen(false)}
                                >
                                    View all notifications
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
