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
import { apiToast } from "@/lib/utils/toast-helpers";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";

export default function MailTestPage() {
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSend() {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            apiToast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{ message: string }>(
                `/admin/mail/test?to=${encodeURIComponent(to)}`,
            );
            apiToast.success(res?.message || "Test email requested");
        } catch (e: unknown) {
            console.error("[MailTest] Error:", e);
            if (!(e instanceof Error)) {
                apiToast.error("An unknown error occurred");
                return;
            }
            const msg = e?.message || "Failed to send test email";
            apiToast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute anyOf={[P.ADMIN_MAIL_TEST]}>
            <motion.div
                className="max-w-xl mx-auto"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
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
                            Requires permission: admin:mail:test. For enhanced
                            features, use the{" "}
                            <a
                                href="/admin/control-panel/mail"
                                className="underline"
                            >
                                Control Panel Mail Testing
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </ProtectedRoute>
    );
}
