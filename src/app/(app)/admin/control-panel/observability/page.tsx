"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    TrendingUp,
    Database,
    RefreshCw,
    Cpu,
    HardDrive,
    Clock,
    Server,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Zap,
    BarChart3,
    Gauge,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";
import { cn } from "@/lib/utils";

interface SystemMetrics {
    timestamp: string;
    system: {
        uptime: number;
        platform: string;
        arch: string;
        cpuUsage: number;
        memoryUsage: {
            total: number;
            free: number;
            used: number;
            usagePercent: number;
        };
        loadAverage: number[];
    };
    process: {
        uptime: number;
        memoryUsage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
    };
    database: {
        connected: boolean;
        collections?: number;
        indexes?: number;
    };
}

interface PerformanceMetrics {
    timestamp: string;
    responseTime: {
        avg: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
    };
    requestCount: number;
    errorRate: number;
}

interface HealthStatus {
    status: "healthy" | "degraded";
    checks: {
        database: "up" | "down";
        memory: "ok" | "high";
        errorRate: "ok" | "high";
    };
    timestamp: string;
}

interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: string;
}

function formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getUsageColor(percent: number): string {
    if (percent >= 90) return "text-red-600 dark:text-red-400";
    if (percent >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
}

// Status indicator component
function StatusIndicator({
    status,
    label,
}: {
    status: "up" | "down" | "ok" | "high";
    label: string;
}) {
    const isGood = status === "up" || status === "ok";
    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "h-2 w-2 rounded-full",
                    isGood ? "bg-green-500" : "bg-red-500"
                )}
            />
            <span className="text-sm">{label}</span>
            <Badge
                variant="outline"
                className={cn(
                    "ml-auto text-xs",
                    isGood
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
            >
                {status.toUpperCase()}
            </Badge>
        </div>
    );
}

// Metric card with progress bar
function MetricCard({
    icon,
    title,
    value,
    subtitle,
    percent,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    percent?: number;
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-muted">{icon}</div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p
                        className={cn(
                            "text-2xl font-bold",
                            percent !== undefined && getUsageColor(percent)
                        )}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
                {percent !== undefined && (
                    <div className="mt-3">
                        <Progress value={percent} className="h-1.5" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ObservabilityDashboard() {
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
        null
    );
    const [performanceMetrics, setPerformanceMetrics] =
        useState<PerformanceMetrics | null>(null);
    const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchMetrics = useCallback(async () => {
        try {
            const [system, performance, health, cache] = await Promise.all([
                apiClient.get<SystemMetrics>(
                    "/admin/observability/metrics/system"
                ),
                apiClient.get<PerformanceMetrics>(
                    "/admin/observability/metrics/performance"
                ),
                apiClient.get<HealthStatus>("/admin/observability/health"),
                apiClient.get<CacheStats>("/admin/cache/stats"),
            ]);

            setSystemMetrics(system);
            setPerformanceMetrics(performance);
            setHealthStatus(health);
            setCacheStats(cache);
            setLastUpdate(new Date());
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch metrics");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();

        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, fetchMetrics]);

    if (loading && !systemMetrics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Loading metrics...</p>
                </div>
            </div>
        );
    }

    const isHealthy = healthStatus?.status === "healthy";
    const cpuUsage = systemMetrics?.system.cpuUsage ?? 0;
    const memoryPercent = systemMetrics?.system.memoryUsage.usagePercent ?? 0;
    const heapPercent = systemMetrics?.process.memoryUsage
        ? (systemMetrics.process.memoryUsage.heapUsed /
              systemMetrics.process.memoryUsage.heapTotal) *
          100
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Observability
                    </h1>
                    <p className="text-muted-foreground">
                        Real-time system metrics and performance monitoring
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="gap-2"
                    >
                        <Activity
                            className={cn(
                                "h-4 w-4",
                                autoRefresh && "animate-pulse"
                            )}
                        />
                        {autoRefresh ? "Live" : "Paused"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMetrics}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw
                            className={cn("h-4 w-4", loading && "animate-spin")}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overall Status Banner */}
            <Card
                className={cn(
                    "border-l-4",
                    isHealthy ? "border-l-green-500" : "border-l-amber-500"
                )}
            >
                <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {isHealthy ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-amber-500" />
                            )}
                            <div>
                                <p className="font-semibold">
                                    {isHealthy
                                        ? "All Systems Operational"
                                        : "System Degraded"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Last checked:{" "}
                                    {lastUpdate?.toLocaleTimeString() ?? "—"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {healthStatus && (
                                <>
                                    <StatusIndicator
                                        status={healthStatus.checks.database}
                                        label="Database"
                                    />
                                    <StatusIndicator
                                        status={healthStatus.checks.memory}
                                        label="Memory"
                                    />
                                    <StatusIndicator
                                        status={healthStatus.checks.errorRate}
                                        label="Error Rate"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different metric categories */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="gap-2">
                        <Gauge className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="cache" className="gap-2">
                        <Database className="h-4 w-4" />
                        Cache
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            icon={
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                            }
                            title="CPU Usage"
                            value={`${cpuUsage.toFixed(1)}%`}
                            subtitle={`Load: ${
                                systemMetrics?.system.loadAverage?.[0]?.toFixed(
                                    2
                                ) ?? "—"
                            }`}
                            percent={cpuUsage}
                        />
                        <MetricCard
                            icon={
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            }
                            title="System Memory"
                            value={`${memoryPercent.toFixed(1)}%`}
                            subtitle={`${formatBytes(
                                systemMetrics?.system.memoryUsage.used ?? 0
                            )} / ${formatBytes(
                                systemMetrics?.system.memoryUsage.total ?? 0
                            )}`}
                            percent={memoryPercent}
                        />
                        <MetricCard
                            icon={
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            }
                            title="Uptime"
                            value={formatUptime(
                                systemMetrics?.process.uptime ?? 0
                            )}
                            subtitle={`System: ${formatUptime(
                                systemMetrics?.system.uptime ?? 0
                            )}`}
                        />
                        <MetricCard
                            icon={
                                <Database className="h-4 w-4 text-muted-foreground" />
                            }
                            title="Database"
                            value={
                                systemMetrics?.database.connected
                                    ? "Connected"
                                    : "Disconnected"
                            }
                            subtitle={`${
                                systemMetrics?.database.collections ?? 0
                            } collections`}
                        />
                    </div>

                    {/* Process Memory Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Server className="h-5 w-5" />
                                Process Memory
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Heap Used
                                        </span>
                                        <span className="text-sm font-medium">
                                            {heapPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={heapPercent}
                                        className="h-2"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(
                                            systemMetrics?.process.memoryUsage
                                                .heapUsed ?? 0
                                        )}{" "}
                                        /{" "}
                                        {formatBytes(
                                            systemMetrics?.process.memoryUsage
                                                .heapTotal ?? 0
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        RSS
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics?.process.memoryUsage
                                                .rss ?? 0
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        External
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics?.process.memoryUsage
                                                .external ?? 0
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Platform
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {systemMetrics?.system.platform} (
                                        {systemMetrics?.system.arch})
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    {performanceMetrics ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <MetricCard
                                    icon={
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="Avg Response"
                                    value={`${performanceMetrics.responseTime.avg.toFixed(
                                        1
                                    )}ms`}
                                />
                                <MetricCard
                                    icon={
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="P95 Latency"
                                    value={`${performanceMetrics.responseTime.p95.toFixed(
                                        1
                                    )}ms`}
                                />
                                <MetricCard
                                    icon={
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="P99 Latency"
                                    value={`${performanceMetrics.responseTime.p99.toFixed(
                                        1
                                    )}ms`}
                                />
                                <MetricCard
                                    icon={
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="Total Requests"
                                    value={performanceMetrics.requestCount.toLocaleString()}
                                />
                                <MetricCard
                                    icon={
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="Error Rate"
                                    value={`${(
                                        performanceMetrics.errorRate * 100
                                    ).toFixed(2)}%`}
                                    percent={performanceMetrics.errorRate * 100}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Response Time Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold text-green-600">
                                                {performanceMetrics.responseTime.min.toFixed(
                                                    1
                                                )}
                                                ms
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Min
                                            </p>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold">
                                                {performanceMetrics.responseTime.avg.toFixed(
                                                    1
                                                )}
                                                ms
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Average
                                            </p>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold text-amber-600">
                                                {performanceMetrics.responseTime.p95.toFixed(
                                                    1
                                                )}
                                                ms
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                P95
                                            </p>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-muted/50">
                                            <p className="text-2xl font-bold text-red-600">
                                                {performanceMetrics.responseTime.max.toFixed(
                                                    1
                                                )}
                                                ms
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Max
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">
                                    No performance data available
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Cache Tab */}
                <TabsContent value="cache" className="space-y-6">
                    {cacheStats ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    icon={
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="Cache Size"
                                    value={`${cacheStats.size}`}
                                    subtitle="entries"
                                />
                                <MetricCard
                                    icon={
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    }
                                    title="Cache Hits"
                                    value={cacheStats.hits.toLocaleString()}
                                />
                                <MetricCard
                                    icon={
                                        <XCircle className="h-4 w-4 text-amber-500" />
                                    }
                                    title="Cache Misses"
                                    value={cacheStats.misses.toLocaleString()}
                                />
                                <MetricCard
                                    icon={
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    }
                                    title="Hit Rate"
                                    value={cacheStats.hitRate}
                                    percent={parseFloat(cacheStats.hitRate)}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        About Permission Cache
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-2">
                                    <p>
                                        The permission cache stores computed
                                        user permissions in memory to reduce
                                        database queries. A high hit rate
                                        indicates efficient caching.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            <strong className="text-foreground">
                                                Hit rate &gt; 90%
                                            </strong>{" "}
                                            — Excellent performance
                                        </li>
                                        <li>
                                            <strong className="text-foreground">
                                                Hit rate 70-90%
                                            </strong>{" "}
                                            — Good performance
                                        </li>
                                        <li>
                                            <strong className="text-foreground">
                                                Hit rate &lt; 70%
                                            </strong>{" "}
                                            — Consider reviewing cache TTL
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">
                                    No cache data available
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function ObservabilityPage() {
    return (
        <ProtectedRoute anyOf={[P.ADMIN_OBSERVABILITY_READ]}>
            <ObservabilityDashboard />
        </ProtectedRoute>
    );
}
