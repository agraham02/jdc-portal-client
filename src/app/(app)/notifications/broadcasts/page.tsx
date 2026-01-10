"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BroadcastService } from "@/lib/services/broadcast";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";

/**
 * Admin broadcast notifications page
 * Allows admins to send system-wide announcements via Novu
 */
export default function NotificationsBroadcastsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [roles, setRoles] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function submitBroadcast() {
        if (!title.trim() || !message.trim()) {
            toast.error("Title and message are required");
            return;
        }

        setSubmitting(true);
        try {
            const targetRoles = roles
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean);

            const result = await BroadcastService.broadcast({
                title: title.trim(),
                message: message.trim(),
                targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
            });

            if (result.success) {
                const targetDescription =
                    result.topics?.length === 1 &&
                    result.topics[0] === "all-users"
                        ? "all users"
                        : `topics: ${result.topics?.join(", ")}`;
                toast.success(`Broadcast sent to ${targetDescription}`);
                setTitle("");
                setMessage("");
                setRoles("");
            }
        } catch {
            toast.error("Failed to send broadcast");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute
            anyOf={[P.NOTIFICATIONS_BROADCAST, P.NOTIFICATIONS_MANAGE]}
        >
            <main className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Broadcast Notification
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Send system-wide announcements to users
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="w-5 h-5" />
                            New Broadcast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., System Maintenance Notice"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your announcement message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                maxLength={2000}
                                disabled={submitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="roles">
                                Target Roles{" "}
                                <span className="text-muted-foreground">
                                    (optional, comma-separated)
                                </span>
                            </Label>
                            <Input
                                id="roles"
                                placeholder="e.g., Admin, Employee (leave empty for all users)"
                                value={roles}
                                onChange={(e) => setRoles(e.target.value)}
                                disabled={submitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to broadcast to all users. Enter
                                role names like &quot;Admin&quot;,
                                &quot;Employee&quot;, or &quot;Vendor&quot; to
                                target specific groups.
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={submitBroadcast}
                                disabled={
                                    submitting ||
                                    !title.trim() ||
                                    !message.trim()
                                }
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Megaphone className="w-4 h-4 mr-2" />
                                        Send Broadcast
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </ProtectedRoute>
    );
}
