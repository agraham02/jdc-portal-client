"use client";

import useSWR from "swr";
import Link from "next/link";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { motion } from "motion/react";
import {
    FileText,
    Clock,
    CheckCircle2,
    ArrowRight,
    RefreshCw,
    AlertTriangle,
    ExternalLink,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BaseDashboardCard } from "./BaseDashboardCard";
import {
    ApplicationsService,
    ContractsService,
} from "@/lib/services/contracts";
import {
    ApplicationStatus,
    type Application,
    type Contract,
} from "@/lib/types/contracts";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface VendorStats {
    total: number;
    submitted: number;
    inReview: number;
    awarded: number;
    rejected: number;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    colorClass?: string;
}

function StatItem({
    icon,
    label,
    value,
    colorClass = "text-primary",
}: StatItemProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className={colorClass}>{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );
}

function ApplicationProgressCard({ stats }: { stats: VendorStats | null }) {
    const total = stats?.total ?? 0;
    const awarded = stats?.awarded ?? 0;
    const successRate = total > 0 ? Math.round((awarded / total) * 100) : 0;

    return (
        <BaseDashboardCard
            title="Application Progress"
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/contracts/my-applications">
                        View All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            <div className="space-y-4">
                {/* Success Rate */}
                <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            Success Rate
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {successRate}%
                        </span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {awarded} of {total} applications awarded
                    </p>
                </div>

                {/* Status breakdown */}
                <div className="grid grid-cols-2 gap-2">
                    <StatItem
                        icon={<Clock className="h-4 w-4" />}
                        label="Submitted"
                        value={stats?.submitted ?? 0}
                        colorClass="text-blue-600 dark:text-blue-400"
                    />
                    <StatItem
                        icon={<TrendingUp className="h-4 w-4" />}
                        label="In Review"
                        value={stats?.inReview ?? 0}
                        colorClass="text-amber-600 dark:text-amber-400"
                    />
                    <StatItem
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        label="Awarded"
                        value={stats?.awarded ?? 0}
                        colorClass="text-green-600 dark:text-green-400"
                    />
                    <StatItem
                        icon={<AlertTriangle className="h-4 w-4" />}
                        label="Rejected"
                        value={stats?.rejected ?? 0}
                        colorClass="text-red-600 dark:text-red-400"
                    />
                </div>
            </div>
        </BaseDashboardCard>
    );
}

function UpcomingDeadlinesCard({
    contracts,
}: {
    contracts: Contract[] | null;
}) {
    // Filter contracts with deadlines and sort by nearest deadline
    const upcomingDeadlines = (contracts ?? [])
        .filter((c) => c.deadline && !isPast(new Date(c.deadline)))
        .sort(
            (a, b) =>
                new Date(a.deadline!).getTime() -
                new Date(b.deadline!).getTime(),
        )
        .slice(0, 4);

    return (
        <BaseDashboardCard
            title="Upcoming Deadlines"
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/contracts">
                        Browse All
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            {upcomingDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No upcoming deadlines
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {upcomingDeadlines.map((contract) => {
                        const deadline = new Date(contract.deadline!);
                        const daysUntil = Math.ceil(
                            (deadline.getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24),
                        );
                        const isUrgent = daysUntil <= 3;

                        return (
                            <Link
                                key={contract._id}
                                href={`/contracts/${contract._id}`}
                                className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                                    isUrgent
                                        ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
                                        : ""
                                }`}
                            >
                                <div className="flex-1 space-y-1">
                                    <p className="font-medium line-clamp-1">
                                        {contract.title}
                                    </p>
                                    <p
                                        className={`text-xs ${
                                            isUrgent
                                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {isUrgent && "⚠️ "}
                                        {formatDistanceToNow(deadline, {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        {format(deadline, "MMM d")}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </BaseDashboardCard>
    );
}

function QuickActionsCard() {
    const actions = [
        {
            label: "Browse Contracts",
            description: "Find new opportunities",
            href: "/contracts",
            icon: <FileText className="h-5 w-5" />,
        },
        {
            label: "My Applications",
            description: "Track your submissions",
            href: "/contracts/my-applications",
            icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
            label: "Company Profile",
            description: "Update your information",
            href: "/profile",
            icon: <TrendingUp className="h-5 w-5" />,
        },
    ];

    return (
        <BaseDashboardCard title="Quick Actions">
            <div className="space-y-2">
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
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

/**
 * VendorDashboard - Enhanced with application progress, deadlines, and quick actions
 */
export function VendorDashboard() {
    const {
        data: appData,
        error: appError,
        mutate: mutateApps,
        isValidating: isRefreshing,
    } = useSWR("/my-applications-summary", async () => {
        const result = await ApplicationsService.getMyApplications({
            limit: 100,
            page: 1,
        });
        const apps = result.data || [];

        return {
            total: apps.length,
            submitted: apps.filter(
                (a: Application) => a.status === ApplicationStatus.SUBMITTED,
            ).length,
            inReview: apps.filter(
                (a: Application) =>
                    a.status === ApplicationStatus.REVIEWED ||
                    a.status === ApplicationStatus.ACCEPTED,
            ).length,
            awarded: apps.filter(
                (a: Application) => a.status === ApplicationStatus.AWARDED,
            ).length,
            rejected: apps.filter(
                (a: Application) => a.status === ApplicationStatus.REJECTED,
            ).length,
        };
    });

    const { data: contracts, error: contractsError } = useSWR(
        "/open-contracts",
        async () => {
            const response = await ContractsService.listActiveContracts();
            return response.data || [];
        },
    );

    const error = appError?.message || contractsError?.message;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div
                variants={staggerItem}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Vendor Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your applications and explore opportunities
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateApps()}
                    disabled={isRefreshing}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                        }`}
                    />
                    Refresh
                </Button>
            </motion.div>

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <ApplicationProgressCard stats={appData ?? null} />
                <UpcomingDeadlinesCard contracts={contracts ?? null} />
                <QuickActionsCard />
            </div>
        </motion.div>
    );
}
