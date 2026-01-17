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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";
import {
    Mail,
    Send,
    CheckCircle,
    Clock,
    FileText,
    AlertCircle,
    History,
    Settings,
    Inbox,
    RefreshCw,
} from "lucide-react";

interface EmailLogEntry {
    id: string;
    to: string;
    template: string;
    status: "sent" | "failed";
    timestamp: Date;
}

const EMAIL_TEMPLATES = [
    { id: "test", name: "Basic Test", description: "Simple test email" },
    {
        id: "welcome",
        name: "Welcome Email",
        description: "New user welcome message",
    },
    {
        id: "password-reset",
        name: "Password Reset",
        description: "Password reset link",
    },
    {
        id: "notification",
        name: "Notification",
        description: "System notification",
    },
];

export default function MailTestPage() {
    const [to, setTo] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("test");
    const [emailLog, setEmailLog] = useState<EmailLogEntry[]>([]);
    const [activeTab, setActiveTab] = useState("send");

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

            // Add to email log
            setEmailLog((prev) => [
                {
                    id: Date.now().toString(),
                    to,
                    template:
                        EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)
                            ?.name || "Test",
                    status: "sent",
                    timestamp: new Date(),
                },
                ...prev.slice(0, 9), // Keep last 10 entries
            ]);

            setTo(""); // Clear input after successful send
        } catch (e: unknown) {
            console.error("[MailTest] Error:", e);

            // Log failed attempt
            setEmailLog((prev) => [
                {
                    id: Date.now().toString(),
                    to,
                    template:
                        EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)
                            ?.name || "Test",
                    status: "failed",
                    timestamp: new Date(),
                },
                ...prev.slice(0, 9),
            ]);

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

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <ProtectedRoute anyOf={[P.ADMIN_MAIL_TEST]}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Mail className="h-8 w-8 text-primary" />
                            Mail Testing
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Send test emails and verify email delivery
                            configuration
                        </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                        <Settings className="h-3 w-3" />
                        Resend Provider
                    </Badge>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger
                            value="send"
                            className="flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Send Email
                        </TabsTrigger>
                        <TabsTrigger
                            value="templates"
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex items-center gap-2"
                        >
                            <History className="h-4 w-4" />
                            History
                            {emailLog.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 h-5 w-5 p-0 justify-center"
                                >
                                    {emailLog.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Send Email Tab */}
                    <TabsContent value="send" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Send Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Inbox className="h-5 w-5" />
                                        Send Test Email
                                    </CardTitle>
                                    <CardDescription>
                                        Enter a recipient and choose a template
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Recipient Email
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="recipient@example.com"
                                            value={to}
                                            onChange={(e) =>
                                                setTo(e.target.value)
                                            }
                                            onKeyPress={handleKeyPress}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Email Template
                                        </label>
                                        <Select
                                            value={selectedTemplate}
                                            onValueChange={setSelectedTemplate}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EMAIL_TEMPLATES.map(
                                                    (template) => (
                                                        <SelectItem
                                                            key={template.id}
                                                            value={template.id}
                                                        >
                                                            {template.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {
                                                EMAIL_TEMPLATES.find(
                                                    (t) =>
                                                        t.id ===
                                                        selectedTemplate
                                                )?.description
                                            }
                                        </p>
                                    </div>

                                    <Button
                                        onClick={onSend}
                                        disabled={loading || !to}
                                        className="w-full gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Send Test Email
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        About Test Emails
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="p-3 bg-muted rounded-lg space-y-2">
                                        <p className="font-medium">
                                            Test emails include:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            <li>
                                                System environment information
                                            </li>
                                            <li>Timestamp of the test</li>
                                            <li>
                                                Confirmation that delivery is
                                                working
                                            </li>
                                            <li>Links to the portal</li>
                                        </ul>
                                    </div>
                                    <div className="p-3 border rounded-lg border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
                                        <p className="font-medium text-yellow-700 dark:text-yellow-400">
                                            💡 Tip
                                        </p>
                                        <p className="text-muted-foreground mt-1">
                                            Check your spam folder if you
                                            don&apos;t receive the email within
                                            a few minutes.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Templates Tab */}
                    <TabsContent value="templates" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Templates</CardTitle>
                                <CardDescription>
                                    Available email templates for testing
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {EMAIL_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                                                selectedTemplate === template.id
                                                    ? "border-primary bg-primary/5"
                                                    : "hover:bg-muted/50"
                                            }`}
                                            onClick={() => {
                                                setSelectedTemplate(
                                                    template.id
                                                );
                                                setActiveTab("send");
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {
                                                    setSelectedTemplate(
                                                        template.id
                                                    );
                                                    setActiveTab("send");
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {template.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {template.description}
                                                    </p>
                                                </div>
                                                {selectedTemplate ===
                                                    template.id && (
                                                    <CheckCircle className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Send History</CardTitle>
                                        <CardDescription>
                                            Recent email test attempts (session
                                            only)
                                        </CardDescription>
                                    </div>
                                    {emailLog.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEmailLog([])}
                                        >
                                            Clear History
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {emailLog.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            No emails sent this session
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Send a test email to see it here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {emailLog.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {entry.status === "sent" ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">
                                                            {entry.to}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {entry.template}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            entry.status ===
                                                            "sent"
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {entry.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(
                                                            entry.timestamp
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}
