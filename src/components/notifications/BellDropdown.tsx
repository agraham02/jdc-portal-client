"use client";

import { useState } from "react";
import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
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

export function BellDropdown() {
    const {
        notifications,
        unreadCount,
        loading,
        markAllRead,
        markRead,
        remove,
    } = useNotificationsCtx();
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <div className="relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllRead()}
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading ? (
                    <div className="py-8 flex items-center justify-center text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                        Loading
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        You&apos;re all caught up
                    </div>
                ) : (
                    <DropdownMenuGroup className="max-h-96 overflow-auto">
                        {notifications.slice(0, 15).map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className="flex items-start gap-2"
                            >
                                <div
                                    className={`mt-1 h-2 w-2 rounded-full ${
                                        n.read ? "bg-muted" : "bg-blue-500"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {n.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                        {n.message}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!n.read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Mark read"
                                            onClick={() => markRead(n.id)}
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete"
                                        onClick={() => remove(n.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
