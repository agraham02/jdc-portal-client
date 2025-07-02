"use client";

import Link from "next/link";
import { useAuth, UserRole } from "@/lib/contexts/auth-context";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import {
    LogOut,
    User,
    Settings,
    Users,
    Building,
    FileText,
} from "lucide-react";

export function Navigation() {
    const { user, logout } = useAuth();

    const navigationItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: User,
            roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VENDOR],
        },
        {
            label: "Employees",
            href: "/employees",
            icon: Users,
            roles: [UserRole.ADMIN],
        },
        {
            label: "Vendors",
            href: "/vendors",
            icon: Building,
            roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
        },
        {
            label: "Contracts",
            href: "/contracts",
            icon: FileText,
            roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VENDOR],
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings,
            roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VENDOR],
        },
    ];

    return (
        <nav className="bg-background border-r border-border p-4 min-h-screen w-64">
            <div className="space-y-2">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">JDC Portal</h2>
                    {user && (
                        <p className="text-sm text-muted-foreground">
                            {user.name} ({user.role})
                        </p>
                    )}
                </div>

                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <RoleGuard key={item.href} requiredRoles={item.roles}>
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        </RoleGuard>
                    );
                })}

                <div className="pt-4 mt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full justify-start"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </nav>
    );
}
