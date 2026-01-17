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
        // Client-side validation
        if (!title.trim() || !message.trim()) {
            toast.error("Title and message are required");
            return;
        }

        if (title.trim().length > 200) {
            toast.error("Title must be 200 characters or less");
            return;
        }

        if (message.trim().length > 2000) {
            toast.error("Message must be 2000 characters or less");
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

            // Validate response structure
            if (result && result.success) {
                const targetDescription =
                    result.topics?.length === 1 &&
                    result.topics[0] === "all-users"
                        ? "all users"
                        : `topics: ${result.topics?.join(", ")}`;
                toast.success(`Broadcast sent to ${targetDescription}`);
                setTitle("");
                setMessage("");
                setRoles("");
            } else {
                console.error("[Broadcast] Unexpected response:", result);
                toast.error("Broadcast may not have been sent correctly");
            }
        } catch (error) {
            console.error("[Broadcast] Failed to send:", error);
            const message =
                error instanceof Error ? error.message : "Unknown error";
            toast.error(`Failed to send broadcast: ${message}`);
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
                            <div className="flex justify-between">
                                <Label htmlFor="title">Title</Label>
                                <span className="text-xs text-muted-foreground">
                                    {title.length}/200
                                </span>
                            </div>
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
                            <div className="flex justify-between">
                                <Label htmlFor="message">Message</Label>
                                <span className="text-xs text-muted-foreground">
                                    {message.length}/2000
                                </span>
                            </div>
                            <Textarea
                                id="message"
                                placeholder="Enter your announcement message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                maxLength={2000}
                                disabled={submitting}
                                className="resize-none"
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
