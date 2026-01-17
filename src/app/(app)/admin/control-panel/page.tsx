"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    Database,
    Mail,
    HardDrive,
    Bug,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    ArrowRight,
    Server,
    Clock,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface HealthResponse {
    status: "ok" | "error";
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    checks?: {
        database: "ok" | "error";
    };
}

interface SystemMetrics {
    system: {
        uptime: number;
        cpuUsage: number;
        memoryUsage: {
            usagePercent: number;
            used: number;
            total: number;
        };
    };
    process: {
        uptime: number;
        memoryUsage: {
            heapUsed: number;
            heapTotal: number;
        };
    };
}

type FeatureStatus = "operational" | "degraded" | "offline" | "unknown";

interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    bgColor: string;
    status?: FeatureStatus;
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function StatusBadge({ status }: { status: FeatureStatus }) {
    const config = {
        operational: {
            icon: <CheckCircle2 className="h-3 w-3" />,
            label: "Operational",
            className:
                "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        },
        degraded: {
            icon: <AlertCircle className="h-3 w-3" />,
            label: "Degraded",
            className:
                "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        },
        offline: {
            icon: <XCircle className="h-3 w-3" />,
            label: "Offline",
            className:
                "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        },
        unknown: {
            icon: <AlertCircle className="h-3 w-3" />,
            label: "Unknown",
            className:
                "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
        },
    };

    const { icon, label, className } = config[status];

    return (
        <Badge
            variant="outline"
            className={cn("gap-1 text-xs font-normal", className)}
        >
            {icon}
            {label}
        </Badge>
    );
}

function SystemStatusCard({
    health,
    metrics,
    isLoading,
    onRefresh,
}: {
    health: HealthResponse | undefined;
    metrics: SystemMetrics | undefined;
    isLoading: boolean;
    onRefresh: () => void;
}) {
    const isHealthy =
        health?.status === "ok" && health?.checks?.database === "ok";
    const memoryPercent = metrics?.system?.memoryUsage?.usagePercent ?? 0;
    const cpuUsage = metrics?.system?.cpuUsage ?? 0;

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Status
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={cn("h-4 w-4", isLoading && "animate-spin")}
                    />
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading && !health ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-muted"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Overall Status */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
                                {isHealthy ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm font-medium">
                                    Status
                                </span>
                            </div>
                            <p
                                className={cn(
                                    "text-lg font-bold",
                                    isHealthy
                                        ? "text-green-600"
                                        : "text-red-600"
                                )}
                            >
                                {isHealthy ? "Healthy" : "Unhealthy"}
                            </p>
                        </div>

                        {/* Uptime */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    Uptime
                                </span>
                            </div>
                            <p className="text-lg font-bold">
                                {metrics?.process?.uptime
                                    ? formatUptime(metrics.process.uptime)
                                    : "—"}
                            </p>
                        </div>

                        {/* CPU Usage */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">CPU</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold">
                                    {cpuUsage.toFixed(1)}%
                                </p>
                                <Progress value={cpuUsage} className="h-1.5" />
                            </div>
                        </div>

                        {/* Memory */}
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <HardDrive className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    Memory
                                </span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold">
                                    {memoryPercent.toFixed(1)}%
                                </p>
                                <Progress
                                    value={memoryPercent}
                                    className="h-1.5"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function QuickInfoCard({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    Current Session
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User</span>
                    <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge variant="secondary">
                        {typeof user?.roles?.[0] === "string"
                            ? user?.roles?.[0]
                            : user?.roles?.[0]?.name || "N/A"}
                    </Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Environment
                    </span>
                    <Badge
                        variant="outline"
                        className={cn(
                            process.env.NODE_ENV === "production"
                                ? "border-red-500/50 text-red-600"
                                : "border-green-500/50 text-green-600"
                        )}
                    >
                        {process.env.NODE_ENV}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

function FeatureCard({ feature }: { feature: Feature }) {
    return (
        <Link href={feature.href} className="block group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-hover:bg-muted/30">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className={cn("p-2.5 rounded-lg", feature.bgColor)}
                        >
                            <div className={feature.color}>{feature.icon}</div>
                        </div>
                        {feature.status && (
                            <StatusBadge status={feature.status} />
                        )}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        {feature.description}
                    </p>
                    <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Open</span>
                        <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function ControlPanelPage() {
    const { user } = useAuth();

    // Fetch health status
    const {
        data: health,
        isLoading: healthLoading,
        mutate: mutateHealth,
    } = useSWR(
        "/health/ready",
        () => apiClient.get<HealthResponse>("/health/ready"),
        { refreshInterval: 30000 }
    );

    // Fetch system metrics
    const {
        data: metrics,
        isLoading: metricsLoading,
        mutate: mutateMetrics,
    } = useSWR(
        "/admin/observability/metrics/system",
        () =>
            apiClient.get<SystemMetrics>("/admin/observability/metrics/system"),
        { refreshInterval: 30000 }
    );

    const handleRefresh = () => {
        mutateHealth();
        mutateMetrics();
    };

    const isLoading = healthLoading || metricsLoading;

    // Determine feature statuses based on health
    const getFeatureStatus = (feature: string): FeatureStatus => {
        if (!health) return "unknown";
        if (feature === "observability") {
            return health.status === "ok" ? "operational" : "degraded";
        }
        if (feature === "database") {
            return health.checks?.database === "ok" ? "operational" : "offline";
        }
        return health.status === "ok" ? "operational" : "unknown";
    };

    const features: Feature[] = [
        {
            title: "Observability",
            description:
                "Monitor system metrics, logs, and performance in real-time",
            icon: <Activity className="h-5 w-5" />,
            href: "/admin/control-panel/observability",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-500/10",
            status: getFeatureStatus("observability"),
        },
        {
            title: "Storage Manager",
            description: "Browse, upload, and manage S3 objects and files",
            icon: <HardDrive className="h-5 w-5" />,
            href: "/admin/control-panel/storage",
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-500/10",
            status: getFeatureStatus("storage"),
        },
        {
            title: "Database Sandbox",
            description: "Inspect collections, run queries, and manage data",
            icon: <Database className="h-5 w-5" />,
            href: "/admin/control-panel/database",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-500/10",
            status: getFeatureStatus("database"),
        },
        {
            title: "Mail Testing",
            description: "Send test emails and verify email delivery",
            icon: <Mail className="h-5 w-5" />,
            href: "/admin/control-panel/mail",
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-500/10",
            status: getFeatureStatus("mail"),
        },
        {
            title: "Debug Console",
            description: "Run diagnostics and debug authentication issues",
            icon: <Bug className="h-5 w-5" />,
            href: "/admin/control-panel/debug",
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-500/10",
            status: getFeatureStatus("debug"),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Admin Control Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        System administration and monitoring tools
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        "gap-1",
                        health?.status === "ok"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                    )}
                >
                    {health?.status === "ok" ? (
                        <CheckCircle2 className="h-3 w-3" />
                    ) : (
                        <AlertCircle className="h-3 w-3" />
                    )}
                    {health?.status === "ok"
                        ? "All Systems Operational"
                        : "System Issues Detected"}
                </Badge>
            </div>

            {/* Top Row: System Status + Quick Info */}
            <div className="grid gap-6 lg:grid-cols-3">
                <SystemStatusCard
                    health={health}
                    metrics={metrics}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                />
                <QuickInfoCard user={user} />
            </div>

            {/* Features Grid */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {features.map((feature) => (
                        <FeatureCard key={feature.href} feature={feature} />
                    ))}
                </div>
            </div>

            {/* Version Info */}
            <Card className="bg-muted/30">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>
                                API Version:{" "}
                                <code className="text-foreground">
                                    {health?.version || "—"}
                                </code>
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">
                                Environment:{" "}
                                <code className="text-foreground">
                                    {health?.environment || "—"}
                                </code>
                            </span>
                        </div>
                        <span className="text-muted-foreground">
                            Last updated:{" "}
                            {health?.timestamp
                                ? new Date(
                                      health.timestamp
                                  ).toLocaleTimeString()
                                : "—"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
