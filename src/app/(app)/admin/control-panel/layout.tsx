"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Activity,
    Database,
    Mail,
    HardDrive,
    Bug,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Shield,
    Terminal,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    permission?: string;
    description?: string;
}

const navItems: NavItem[] = [
    {
        label: "Overview",
        href: "/admin/control-panel",
        icon: <LayoutDashboard className="h-4 w-4" />,
        description: "System dashboard",
    },
    {
        label: "Observability",
        href: "/admin/control-panel/observability",
        icon: <Activity className="h-4 w-4" />,
        permission: P.ADMIN_OBSERVABILITY_READ,
        description: "Metrics & monitoring",
    },
    {
        label: "Storage",
        href: "/admin/control-panel/storage",
        icon: <HardDrive className="h-4 w-4" />,
        permission: P.ADMIN_STORAGE_READ,
        description: "S3 file management",
    },
    {
        label: "Database",
        href: "/admin/control-panel/database",
        icon: <Database className="h-4 w-4" />,
        permission: P.ADMIN_DATABASE_READ,
        description: "Collection browser",
    },
    {
        label: "Mail",
        href: "/admin/control-panel/mail",
        icon: <Mail className="h-4 w-4" />,
        permission: P.ADMIN_MAIL_TEST,
        description: "Email testing",
    },
    {
        label: "Debug",
        href: "/admin/control-panel/debug",
        icon: <Bug className="h-4 w-4" />,
        permission: P.ADMIN_DEBUG,
        description: "Diagnostics",
    },
];

function NavLink({
    item,
    isActive,
    isCollapsed,
}: {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
}) {
    const linkContent = (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
            )}
        >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    {item.description && (
                        <span className="text-xs text-muted-foreground">
                            {item.description}
                        </span>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

export default function ControlPanelLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Find current page title for breadcrumb
    const currentPage = navItems.find(
        (item) =>
            pathname === item.href ||
            (item.href !== "/admin/control-panel" &&
                pathname?.startsWith(item.href))
    );

    return (
        <ProtectedRoute anyOf={[P.SYSTEM_ADMIN]}>
            <TooltipProvider>
                <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                    {/* Sidebar */}
                    <aside
                        className={cn(
                            "border-r bg-card/50 overflow-y-auto transition-all duration-300 flex flex-col",
                            isCollapsed ? "w-16" : "w-56"
                        )}
                    >
                        {/* Header */}
                        <div
                            className={cn(
                                "p-4 border-b flex items-center",
                                isCollapsed
                                    ? "justify-center"
                                    : "justify-between"
                            )}
                        >
                            {!isCollapsed && (
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-sm">
                                        Control Panel
                                    </span>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <ChevronLeft className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-3 space-y-1">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/admin/control-panel" &&
                                        pathname?.startsWith(item.href));

                                return (
                                    <NavLink
                                        key={item.href}
                                        item={item}
                                        isActive={!!isActive}
                                        isCollapsed={isCollapsed}
                                    />
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div
                            className={cn(
                                "p-3 border-t mt-auto",
                                isCollapsed && "flex justify-center"
                            )}
                        >
                            {isCollapsed ? (
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-full",
                                                process.env.NODE_ENV ===
                                                    "production"
                                                    ? "bg-red-500"
                                                    : "bg-green-500"
                                            )}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {process.env.NODE_ENV === "production"
                                            ? "Production"
                                            : "Development"}
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <div className="flex items-center gap-2 px-2 text-xs">
                                    <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        {process.env.NODE_ENV === "production"
                                            ? "🔴 Production"
                                            : "🟢 Development"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-muted/20">
                        {/* Breadcrumb */}
                        <div className="border-b bg-background px-6 py-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Link
                                    href="/admin/control-panel"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Control Panel
                                </Link>
                                {currentPage &&
                                    currentPage.href !==
                                        "/admin/control-panel" && (
                                        <>
                                            <span className="text-muted-foreground">
                                                /
                                            </span>
                                            <span className="font-medium">
                                                {currentPage.label}
                                            </span>
                                        </>
                                    )}
                            </div>
                        </div>

                        {/* Page Content */}
                        <div className="p-6">{children}</div>
                    </main>
                </div>
            </TooltipProvider>
        </ProtectedRoute>
    );
}
