"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    Database,
    Mail,
    HardDrive,
    Bug,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";

const features = [
    {
        title: "Observability",
        description: "Monitor system metrics, logs, and performance",
        icon: <Activity className="h-8 w-8" />,
        href: "/admin/control-panel/observability",
        color: "text-blue-600 dark:text-blue-400",
    },
    {
        title: "Storage Manager",
        description: "Browse and manage S3 objects",
        icon: <HardDrive className="h-8 w-8" />,
        href: "/admin/control-panel/storage",
        color: "text-purple-600 dark:text-purple-400",
    },
    {
        title: "Database Sandbox",
        description: "Clone, reset, and manage staging database",
        icon: <Database className="h-8 w-8" />,
        href: "/admin/control-panel/database",
        color: "text-green-600 dark:text-green-400",
    },
    {
        title: "Mail Testing",
        description: "Send test emails and monitor delivery",
        icon: <Mail className="h-8 w-8" />,
        href: "/admin/control-panel/mail",
        color: "text-orange-600 dark:text-orange-400",
    },
    {
        title: "Debug Console",
        description: "Advanced debugging and diagnostic tools",
        icon: <Bug className="h-8 w-8" />,
        href: "/admin/control-panel/debug",
        color: "text-red-600 dark:text-red-400",
    },
];

export default function ControlPanelPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                <p className="text-muted-foreground mt-2">
                    Centralized administration and monitoring tools
                </p>
            </div>

            {/* User Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Logged in as {user?.email}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Name</div>
                            <div className="font-medium">
                                {user?.firstName} {user?.lastName}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Role</div>
                            <div className="font-medium">
                                {typeof user?.roles?.[0] === "string"
                                    ? user?.roles?.[0]
                                    : user?.roles?.[0]?.name || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Status</div>
                            <div className="font-medium">Active</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">
                                Environment
                            </div>
                            <div className="font-medium font-mono">
                                {process.env.NODE_ENV}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <Card
                        key={feature.href}
                        className="hover:shadow-lg transition-shadow"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className={feature.color}>
                                    {feature.icon}
                                </div>
                            </div>
                            <CardTitle className="mt-4">
                                {feature.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {feature.description}
                            </p>
                            <Link href={feature.href}>
                                <Button variant="outline" className="w-full">
                                    Open
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/control-panel/observability">
                            <Button variant="outline" size="sm">
                                View Metrics
                            </Button>
                        </Link>
                        <Link href="/admin/control-panel/mail">
                            <Button variant="outline" size="sm">
                                Send Test Email
                            </Button>
                        </Link>
                        <Link href="/admin/control-panel/debug">
                            <Button variant="outline" size="sm">
                                Run Diagnostics
                            </Button>
                        </Link>
                        <Link href="/admin/tools/mail-test">
                            <Button variant="outline" size="sm">
                                Legacy Mail Test
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
