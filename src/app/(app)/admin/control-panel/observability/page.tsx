"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Activity,
    TrendingUp,
    Database,
    RefreshCw,
    Cpu,
    HardDrive,
    Clock,
    Server,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { apiClient } from "@/lib/api";
import { apiToast } from "@/lib/utils/toast-helpers";

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

    const fetchMetrics = async () => {
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
        } catch (error) {
            console.error(error);
            apiToast.error("Failed to fetch metrics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const formatBytes = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading metrics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="h-8 w-8" />
                        Observability Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Real-time system metrics and performance monitoring
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchMetrics}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Health Status Banner */}
            {healthStatus && (
                <Card
                    className={
                        healthStatus.status === "healthy"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                    }
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity
                                className={`h-5 w-5 ${
                                    healthStatus.status === "healthy"
                                        ? "text-green-600"
                                        : "text-yellow-600"
                                }`}
                            />
                            System Status:{" "}
                            {healthStatus.status === "healthy"
                                ? "Healthy"
                                : "Degraded"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Database:
                                </span>{" "}
                                <span
                                    className={
                                        healthStatus.checks.database === "up"
                                            ? "text-green-600 font-semibold"
                                            : "text-red-600 font-semibold"
                                    }
                                >
                                    {healthStatus.checks.database.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Memory:
                                </span>{" "}
                                <span
                                    className={
                                        healthStatus.checks.memory === "ok"
                                            ? "text-green-600 font-semibold"
                                            : "text-yellow-600 font-semibold"
                                    }
                                >
                                    {healthStatus.checks.memory.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Error Rate:
                                </span>{" "}
                                <span
                                    className={
                                        healthStatus.checks.errorRate === "ok"
                                            ? "text-green-600 font-semibold"
                                            : "text-yellow-600 font-semibold"
                                    }
                                >
                                    {healthStatus.checks.errorRate.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* System Metrics Grid */}
            {systemMetrics && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Cpu className="h-4 w-4" />
                                    CPU Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {systemMetrics.system.cpuUsage.toFixed(1)}%
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Load: [
                                    {systemMetrics.system.loadAverage
                                        .map((l) => l.toFixed(2))
                                        .join(", ")}
                                    ]
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" />
                                    Memory Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {systemMetrics.system.memoryUsage.usagePercent.toFixed(
                                        1
                                    )}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatBytes(
                                        systemMetrics.system.memoryUsage.used
                                    )}{" "}
                                    /{" "}
                                    {formatBytes(
                                        systemMetrics.system.memoryUsage.total
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    System Uptime
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatUptime(systemMetrics.system.uptime)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Process:{" "}
                                    {formatUptime(systemMetrics.process.uptime)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    Database
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {systemMetrics.database.connected
                                        ? "Connected"
                                        : "Disconnected"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {systemMetrics.database.collections || 0}{" "}
                                    collections,{" "}
                                    {systemMetrics.database.indexes || 0}{" "}
                                    indexes
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Process Memory Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Process Memory Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">
                                        RSS
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics.process.memoryUsage
                                                .rss
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">
                                        Heap Total
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics.process.memoryUsage
                                                .heapTotal
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">
                                        Heap Used
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics.process.memoryUsage
                                                .heapUsed
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">
                                        External
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {formatBytes(
                                            systemMetrics.process.memoryUsage
                                                .external
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">
                                    Avg Response Time
                                </div>
                                <div className="text-lg font-semibold">
                                    {performanceMetrics.responseTime.avg.toFixed(
                                        2
                                    )}
                                    ms
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">P95</div>
                                <div className="text-lg font-semibold">
                                    {performanceMetrics.responseTime.p95.toFixed(
                                        2
                                    )}
                                    ms
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">P99</div>
                                <div className="text-lg font-semibold">
                                    {performanceMetrics.responseTime.p99.toFixed(
                                        2
                                    )}
                                    ms
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Total Requests
                                </div>
                                <div className="text-lg font-semibold">
                                    {performanceMetrics.requestCount}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Error Rate
                                </div>
                                <div
                                    className={`text-lg font-semibold ${
                                        performanceMetrics.errorRate > 0.1
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {(
                                        performanceMetrics.errorRate * 100
                                    ).toFixed(2)}
                                    %
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Permission Cache Stats */}
            {cacheStats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Permission Cache Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">
                                    Cache Size
                                </div>
                                <div className="text-lg font-semibold">
                                    {cacheStats.size} entries
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Cache Hits
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                    {cacheStats.hits}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Cache Misses
                                </div>
                                <div className="text-lg font-semibold text-yellow-600">
                                    {cacheStats.misses}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Hit Rate
                                </div>
                                <div
                                    className={`text-lg font-semibold ${
                                        parseFloat(cacheStats.hitRate) > 90
                                            ? "text-green-600"
                                            : parseFloat(cacheStats.hitRate) >
                                              70
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {cacheStats.hitRate}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Permission cache reduces database queries by storing
                            computed user permissions in memory. Higher hit
                            rates indicate better performance.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* System Info */}
            {systemMetrics && (
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">
                                    Platform
                                </div>
                                <div className="font-semibold">
                                    {systemMetrics.system.platform}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Architecture
                                </div>
                                <div className="font-semibold">
                                    {systemMetrics.system.arch}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">
                                    Last Updated
                                </div>
                                <div className="font-semibold">
                                    {new Date(
                                        systemMetrics.timestamp
                                    ).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
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
