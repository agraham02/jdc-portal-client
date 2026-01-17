"use client";

import Link from "next/link";
import {
    Users,
    Briefcase,
    User,
    BookOpen,
    Calendar,
    Bell,
    ArrowRight,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { useAuth } from "@/lib/contexts/auth-context";

interface QuickLink {
    href: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

function getGreeting(hour: number): string {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function WelcomeHeader() {
    const { user } = useAuth();
    const firstName = user?.firstName ?? "there";
    const greeting = getGreeting(new Date().getHours());

    return (
        <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
            <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
                Welcome back! Here&apos;s your overview for today.
            </p>
        </div>
    );
}

function ProfileCompletionCard() {
    const { user } = useAuth();

    // Calculate profile completion based on available fields
    const completionItems = [
        {
            label: "Basic Info",
            completed: !!user?.firstName && !!user?.lastName,
        },
        { label: "Email", completed: !!user?.email },
        { label: "Profile Photo", completed: !!user?.profilePhotoUrl },
        { label: "Contact Phone", completed: !!user?.contactPhone },
    ];

    const completedCount = completionItems.filter(
        (item) => item.completed
    ).length;
    const completionPercentage = Math.round(
        (completedCount / completionItems.length) * 100
    );

    if (completionPercentage === 100) {
        return null; // Don't show if profile is complete
    }

    return (
        <BaseDashboardCard
            title="Complete Your Profile"
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile">Edit Profile</Link>
                </Button>
            }
        >
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            Profile Completion
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {completionPercentage}%
                        </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                    {completionItems.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-2 text-sm"
                        >
                            {item.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span
                                className={
                                    item.completed
                                        ? "text-muted-foreground"
                                        : ""
                                }
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </BaseDashboardCard>
    );
}

function QuickActionsCard() {
    const links: QuickLink[] = [
        {
            href: "/hr-resources",
            label: "HR Resources",
            icon: <BookOpen className="h-5 w-5" />,
            description: "Policies, forms & documents",
        },
        {
            href: "/employees",
            label: "Employee Directory",
            icon: <Users className="h-5 w-5" />,
            description: "Find colleagues",
        },
        {
            href: "/vendors",
            label: "Vendor Directory",
            icon: <Briefcase className="h-5 w-5" />,
            description: "View approved vendors",
        },
        {
            href: "/profile",
            label: "My Profile",
            icon: <User className="h-5 w-5" />,
            description: "Update your information",
        },
    ];

    return (
        <BaseDashboardCard title="Quick Actions">
            <div className="space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {link.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{link.label}</p>
                            <p className="text-sm text-muted-foreground">
                                {link.description}
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
                    </Link>
                ))}
            </div>
        </BaseDashboardCard>
    );
}

function AnnouncementsCard() {
    // Announcements are delivered through the notification system (Novu)
    // Direct users to the notifications page for announcements
    return (
        <BaseDashboardCard
            title="Announcements"
            action={
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/notifications">View All</Link>
                </Button>
            }
        >
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    Check your notifications for announcements
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Open Notifications
                    </Link>
                </Button>
            </div>
        </BaseDashboardCard>
    );
}

function UpcomingEventsCard() {
    // Events feature is planned for future development
    return (
        <BaseDashboardCard title="Upcoming Events">
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    No upcoming events
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Events will appear here when scheduled
                </p>
            </div>
        </BaseDashboardCard>
    );
}

/**
 * EmployeeDashboard - Enhanced with welcome message, profile completion,
 * announcements, and quick actions
 */
export function EmployeeDashboard() {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <WelcomeHeader />

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <QuickActionsCard />
                    <AnnouncementsCard />
                </div>

                <div className="space-y-6">
                    <ProfileCompletionCard />
                    <UpcomingEventsCard />
                </div>
            </div>
        </div>
    );
}
