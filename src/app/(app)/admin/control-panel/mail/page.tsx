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
import { Mail, Send, CheckCircle } from "lucide-react";

export default function MailTestPage() {
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [lastSent, setLastSent] = useState<string | null>(null);

    async function onSend() {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            apiToast.error("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.get<{ message: string }>(
                `/admin/mail/test?to=${encodeURIComponent(to)}`
            );
            apiToast.success(res?.message || "Test email sent successfully");
            setLastSent(to);
            setTo(""); // Clear input after successful send
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !loading) {
            onSend();
        }
    };

    return (
        <ProtectedRoute anyOf={[P.ADMIN_MAIL_TEST]}>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Mail className="h-8 w-8" />
                        Mail Testing
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Send test emails to verify email delivery configuration
                    </p>
                </div>

                {/* Quick Send Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Send Test Email</CardTitle>
                        <CardDescription>
                            Enter an email address to receive a test email
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input
                                type="email"
                                placeholder="recipient@example.com"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button
                                onClick={onSend}
                                disabled={loading || !to}
                                className="gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send
                                    </>
                                )}
                            </Button>
                        </div>

                        {lastSent && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Last sent to: {lastSent}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Test Emails</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Test emails are sent using the configured email
                            provider (Resend).
                        </p>
                        <p>The test email includes:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>System information (environment, timestamp)</li>
                            <li>Confirmation that email delivery is working</li>
                            <li>Links to the portal</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Note:</strong> Check your spam folder if you
                            don&apos;t receive the email within a few minutes.
                        </p>
                    </CardContent>
                </Card>

                {/* Future Features Card */}
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">
                            Coming Soon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>📧 View recent sent emails</li>
                            <li>📝 Test custom email templates</li>
                            <li>📊 Email delivery statistics</li>
                            <li>🔄 Retry failed emails</li>
                            <li>📬 Email queue monitoring</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
