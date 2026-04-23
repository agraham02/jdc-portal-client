"use client";

import useSWR from "swr";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import {
    Users,
    Briefcase,
    FileText,
    Clock,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Activity,
    AlertCircle,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { QuickStartCard } from "./QuickStartCard";
import {
    AdminService,
    type DashboardStats,
    type ActivityTrendPoint,
    type RecentActivityItem,
} from "@/lib/services/admin";
import { useAuth } from "@/lib/contexts/auth-context";
import { apiClient } from "@/lib/api";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    subtitle?: string;
    href?: string;
    colorClass?: string;
}

function StatItem({
    icon,
    label,
    value,
    subtitle,
    href,
    colorClass = "bg-primary/10 text-primary",
}: StatItemProps) {
    const content = (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
            {href && (
                <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }
    return content;
}

interface ActivityChartProps {
    data: ActivityTrendPoint[] | undefined;
    isLoading: boolean;
}

function ActivityChart({ data, isLoading }: ActivityChartProps) {
    // Use data directly from API - no transformation needed
    const chartData = data ?? [];

    if (isLoading) {
        return (
            <BaseDashboardCard
                title="Activity Trends"
                className="lg:col-span-2"
            >
                <Skeleton className="h-64 w-full" />
            </BaseDashboardCard>
        );
    }

    if (!data || data.length === 0) {
        return (
            <BaseDashboardCard
                title="Activity Trends"
                className="lg:col-span-2"
            >
                <div className="flex h-64 flex-col items-center justify-center text-center">
                    <Activity className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                        No activity data available
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Activity will appear once users, vendors, or contracts
                        are created
                    </p>
                </div>
            </BaseDashboardCard>
        );
    }

    return (
        <BaseDashboardCard
            title="Activity Trends"
            className="lg:col-span-2"
            action={
                <span className="text-xs text-muted-foreground">
                    Last 7 days
                </span>
            }
        >
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        aria-label="Activity trends showing new users, vendors, and contracts over the last 7 days"
                        role="img"
                    >
                        <defs>
                            <linearGradient
                                id="colorUsers"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorVendors"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--chart-2))"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--chart-2))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorContracts"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="hsl(var(--chart-3))"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(var(--chart-3))"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                        />
                        <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="users"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                            name="Users"
                        />
                        <Area
                            type="monotone"
                            dataKey="vendors"
                            stroke="hsl(var(--chart-2))"
                            fillOpacity={1}
                            fill="url(#colorVendors)"
                            name="Vendors"
                        />
                        <Area
                            type="monotone"
                            dataKey="contracts"
                            stroke="hsl(var(--chart-3))"
                            fillOpacity={1}
                            fill="url(#colorContracts)"
                            name="Contracts"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </BaseDashboardCard>
    );
}

interface StatsHeaderProps {
    stats: DashboardStats | undefined;
    isLoading: boolean;
    onRefresh: () => void;
    isRefreshing: boolean;
}

function StatsHeader({
    stats,
    isLoading,
    onRefresh,
    isRefreshing,
}: StatsHeaderProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <motion.div variants={staggerItem} className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        System overview and pending actions
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                        }`}
                    />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ">
                <StatItem
                    icon={<Users className="h-6 w-6" />}
                    label="Total Users"
                    value={stats?.users.total ?? 0}
                    subtitle={`${stats?.users.active ?? 0} active`}
                    href="/users"
                    colorClass="bg-primary/10 text-primary"
                />
                <StatItem
                    icon={<Briefcase className="h-6 w-6" />}
                    label="Total Vendors"
                    value={stats?.vendors.total ?? 0}
                    href="/vendors"
                    colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <StatItem
                    icon={<FileText className="h-6 w-6" />}
                    label="Contracts"
                    value={stats?.contracts.total ?? 0}
                    subtitle={`${stats?.contracts.open ?? 0} open, ${
                        stats?.contracts.awarded ?? 0
                    } awarded`}
                    href="/contracts"
                    colorClass="bg-green-500/10 text-green-600 dark:text-green-400"
                />
                <StatItem
                    icon={<Clock className="h-6 w-6" />}
                    label="Pending Approvals"
                    value={stats?.pendingApprovals ?? 0}
                    href="/vendors?status=Pending"
                    colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
            </div>
        </motion.div>
    );
}

interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    variant?: "default" | "success" | "warning";
    permission?: string; // Optional permission required to see this action
}

function QuickActionsCard() {
    const { hasPermission } = useAuth();

    const allActions: QuickAction[] = [
        {
            label: "Approve Vendors",
            description: "Review pending vendor registrations",
            href: "/vendors?status=Pending",
            icon: <CheckCircle2 className="h-5 w-5" />,
            variant: "success",
            permission: "vendor:approve",
        },
        {
            label: "Manage Users",
            description: "View and manage user accounts",
            href: "/users",
            icon: <Users className="h-5 w-5" />,
            permission: "user:read:all",
        },
        {
            label: "View Contracts",
            description: "Manage contract lifecycle",
            href: "/contracts",
            icon: <FileText className="h-5 w-5" />,
            permission: "contract:read",
        },
    ];

    // Filter actions based on user permissions
    const actions = allActions.filter(
        (action) => !action.permission || hasPermission(action.permission),
    );

    const variantClasses = {
        default: "hover:border-primary/50",
        success: "hover:border-green-500/50 border-green-500/20",
        warning: "hover:border-amber-500/50 border-amber-500/20",
    };

    if (actions.length === 0) {
        return null;
    }

    return (
        <BaseDashboardCard title="Quick Actions">
            <div className="space-y-3">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                            variantClasses[action.variant || "default"]
                        }`}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {action.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{action.label}</p>
                            <p className="text-sm text-muted-foreground">
                                {action.description}
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                    </Link>
                ))}
            </div>
        </BaseDashboardCard>
    );
}

function SystemHealthCard() {
    // Fetch real health data from /health/ready endpoint
    const { data: healthData, isLoading } = useSWR(
        "/health/ready",
        async () => {
            const response = await apiClient.get("/health/ready");
            return response as {
                status: "ok" | "error";
                timestamp: string;
                uptime: number;
                checks: {
                    database: "ok" | "error";
                };
            };
        },
        { refreshInterval: 60000 }, // Refresh every minute
    );

    const healthItems = [
        {
            label: "API Status",
            status:
                healthData?.status === "ok"
                    ? ("healthy" as const)
                    : ("error" as const),
        },
        {
            label: "Database",
            status:
                healthData?.checks?.database === "ok"
                    ? ("healthy" as const)
                    : ("error" as const),
        },
    ];

    const statusIcons = {
        healthy: (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ),
        warning: (
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        ),
        error: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    };

    if (isLoading) {
        return (
            <BaseDashboardCard title="System Health">
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                </div>
            </BaseDashboardCard>
        );
    }

    return (
        <BaseDashboardCard title="System Health">
            <div className="space-y-3">
                {healthItems.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg border p-3"
                    >
                        <span className="text-sm font-medium">
                            {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                            {statusIcons[item.status]}
                            <span className="text-xs capitalize text-muted-foreground">
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </BaseDashboardCard>
    );
}

interface RecentActivityCardProps {
    data: RecentActivityItem[] | undefined;
    isLoading: boolean;
}

function RecentActivityCard({ data, isLoading }: RecentActivityCardProps) {
    // Format action names for display
    const formatAction = (action: string) => {
        return action
            .replace(":", " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (isLoading) {
        return (
            <BaseDashboardCard
                title="Recent Activity"
                className="lg:col-span-2"
            >
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                </div>
            </BaseDashboardCard>
        );
    }

    if (!data || data.length === 0) {
        return (
            <BaseDashboardCard
                title="Recent Activity"
                className="lg:col-span-2"
            >
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                        No recent activity
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        System actions will be logged here
                    </p>
                </div>
            </BaseDashboardCard>
        );
    }

    return (
        <BaseDashboardCard title="Recent Activity" className="lg:col-span-2">
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                                {formatAction(item.action)}
                            </p>
                            {item.actor && (
                                <p className="text-xs text-muted-foreground truncate">
                                    by {item.actor.firstName}{" "}
                                    {item.actor.lastName}
                                </p>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </BaseDashboardCard>
    );
}

/**
 * AdminDashboard - Redesigned with summary header, activity charts,
 * quick actions, and system health monitoring
 */
export function AdminDashboard() {
    const {
        data: stats,
        error: statsError,
        isLoading,
        mutate,
        isValidating,
    } = useSWR("/admin-stats", () => AdminService.getDashboardStats());

    // Fetch activity trends for the chart
    const {
        data: activityTrends,
        error: trendsError,
        isLoading: isLoadingTrends,
        mutate: mutateActivityTrends,
    } = useSWR("/admin-activity-trends", () =>
        AdminService.getActivityTrends(7),
    );

    // Fetch recent activity
    const {
        data: recentActivity,
        error: activityError,
        isLoading: isLoadingActivity,
        mutate: mutateRecentActivity,
    } = useSWR("/admin-recent-activity", () =>
        AdminService.getRecentActivity(8),
    );

    // Refresh all dashboard data
    const handleRefreshAll = () => {
        mutate();
        mutateActivityTrends();
        mutateRecentActivity();
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Stats Header with 4 key metrics */}
            <StatsHeader
                stats={stats}
                isLoading={isLoading}
                onRefresh={handleRefreshAll}
                isRefreshing={isValidating}
            />

            {(statsError || trendsError || activityError) && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    Failed to load some dashboard data. Please try refreshing.
                </div>
            )}

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Activity chart takes 2 columns */}
                <ActivityChart
                    data={activityTrends?.trends}
                    isLoading={isLoadingTrends}
                />

                {/* Quick actions sidebar */}
                <QuickActionsCard />
            </div>

            {/* Quick Start Tour */}
            <QuickStartCard />

            {/* Bottom row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SystemHealthCard />
                <RecentActivityCard
                    data={recentActivity?.data}
                    isLoading={isLoadingActivity}
                />
            </div>
        </motion.div>
    );
}
