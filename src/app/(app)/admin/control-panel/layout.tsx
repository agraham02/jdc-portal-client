"use client";

import { ReactNode } from "react";
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
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    permission?: string;
}

const navItems: NavItem[] = [
    {
        label: "Overview",
        href: "/admin/control-panel",
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: "Observability",
        href: "/admin/control-panel/observability",
        icon: <Activity className="h-4 w-4" />,
        permission: P.ADMIN_OBSERVABILITY_READ,
    },
    {
        label: "Storage Manager",
        href: "/admin/control-panel/storage",
        icon: <HardDrive className="h-4 w-4" />,
        permission: P.ADMIN_STORAGE_READ,
    },
    {
        label: "Database Sandbox",
        href: "/admin/control-panel/database",
        icon: <Database className="h-4 w-4" />,
        permission: P.ADMIN_DATABASE_READ,
    },
    {
        label: "Mail Testing",
        href: "/admin/control-panel/mail",
        icon: <Mail className="h-4 w-4" />,
        permission: P.ADMIN_MAIL_TEST,
    },
    {
        label: "Debug Console",
        href: "/admin/control-panel/debug",
        icon: <Bug className="h-4 w-4" />,
        permission: P.ADMIN_DEBUG,
    },
];

export default function ControlPanelLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();

    return (
        <ProtectedRoute anyOf={[P.SYSTEM_ADMIN]}>
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-muted/30 overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">
                            Admin Control Panel
                        </h2>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/admin/control-panel" &&
                                        pathname?.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Environment Indicator */}
                    <div className="p-4 border-t mt-auto">
                        <div className="text-xs text-muted-foreground">
                            <div>Environment:</div>
                            <div className="font-mono font-semibold text-foreground">
                                {process.env.NODE_ENV === "production"
                                    ? "🔴 Production"
                                    : "🟢 Development"}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-6">{children}</div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
