"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { AdminNotificationsApi } from "@/lib/services/notifications";
import type {
    Notification,
    NotificationQuery,
} from "@/lib/types/notifications";
import { toast } from "sonner";

export default function NotificationsBroadcastsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [roles, setRoles] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters] = useState<NotificationQuery>({ page: 1, limit: 25 });

    const targetRoles = useMemo(
        () =>
            roles
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean),
        [roles]
    );

    useEffect(() => {
        (async () => {
            try {
                const res = await AdminNotificationsApi.listAll({
                    ...filters,
                    type: undefined,
                });
                // Transform NotificationResponseDto[] to Notification[]
                const notifications = res.data.map((dto) => ({
                    ...dto,
                    id: dto._id,
                }));
                setHistory(notifications);
            } catch {
                toast.error("Failed to load broadcast history");
            } finally {
                setLoading(false);
            }
        })();
    }, [filters]);

    async function submitBroadcast() {
        if (!title.trim() || !message.trim()) {
            toast.error("Title and message are required");
            return;
        }
        setSubmitting(true);
        try {
            const res = await AdminNotificationsApi.broadcast({
                title: title.trim(),
                message: message.trim(),
                targetRoles: targetRoles.length ? targetRoles : undefined,
            });
            const sent = res.data?.notificationsSent ?? 0;
            toast.success(`Broadcast sent${sent ? ` to ${sent} users` : ""}`);
            setTitle("");
            setMessage("");
            setRoles("");
            // Refresh recent
            const list = await AdminNotificationsApi.listAll({
                page: 1,
                limit: 25,
            });
            // Transform NotificationResponseDto[] to Notification[]
            const notifications = list.data.map((dto) => ({
                ...dto,
                id: dto._id,
            }));
            setHistory(notifications);
        } catch {
            toast.error("Broadcast failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute
            anyOf={[P.NOTIFICATIONS_BROADCAST, P.NOTIFICATIONS_MANAGE]}
        >
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">
                    Broadcast Notifications
                </h1>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compose broadcast</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Textarea
                                placeholder="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-32"
                            />
                            <Input
                                placeholder="Target roles (comma-separated, optional)"
                                value={roles}
                                onChange={(e) => setRoles(e.target.value)}
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {targetRoles.length > 0
                                        ? `Targeting roles: ${targetRoles.join(
                                              ", "
                                          )}`
                                        : "Target: all eligible users"}
                                </span>
                                <Button
                                    onClick={submitBroadcast}
                                    disabled={submitting}
                                >
                                    {submitting ? "Sending..." : "Send"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Recent notifications (admin view)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-14 bg-muted rounded animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : history.length === 0 ? (
                                <p className="text-muted-foreground">
                                    No broadcasts yet.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {history.map((n) => (
                                        <li
                                            key={n.id}
                                            className="border rounded p-3"
                                        >
                                            <div className="text-sm font-medium">
                                                {n.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                {new Date(
                                                    n.createdAt
                                                ).toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </ProtectedRoute>
    );
}
