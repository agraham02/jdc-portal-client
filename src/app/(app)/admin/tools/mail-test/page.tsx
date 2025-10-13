"use client";

import React, { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function MailTestPage() {
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSend() {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            toast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{ message: string }>(
                `/admin/mail/test?to=${encodeURIComponent(to)}`
            );
            toast.success(res?.message || "Test email requested");
        } catch (e: any) {
            const msg = e?.message || "Failed to send test email";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute anyOf={[P.RBAC_ROLE_MANAGE, P.RBAC_USER_ASSIGN_ROLES]}>
            <div className="max-w-xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Mail Test</CardTitle>
                        <CardDescription>
                            Send a one-off test email to verify delivery
                            configuration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input
                                type="email"
                                placeholder="recipient@example.com"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={onSend} disabled={loading}>
                                {loading ? "Sending..." : "Send"}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Requires permissions: role manage or user assign
                            roles.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
