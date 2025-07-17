"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { RoleName } from "@/lib/types/auth";
import { RBAC_PERMISSIONS } from "@/lib/constants/permissions";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import {
    LogOut,
    User,
    Settings,
    Users,
    Building,
    FileText,
    FolderOpen,
    Shield,
    ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function Navigation() {
    const { user, logout } = useAuth();
    const [showNotificationDropdown, setShowNotificationDropdown] =
        useState(false);
    const router = useRouter();

    const navigationItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: User,
            roles: [RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR],
        },
        {
            label: "Employees",
            href: "/employees",
            icon: Users,
            roles: [RoleName.ADMIN],
        },
        {
            label: "Vendors",
            href: "/vendors",
            icon: Building,
            roles: [RoleName.ADMIN, RoleName.EMPLOYEE],
        },
        {
            label: "Contracts",
            href: "/contracts",
            icon: FileText,
            roles: [RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR],
        },
        {
            label: "My Applications",
            href: "/contracts/my-applications",
            icon: ClipboardList,
            roles: [RoleName.VENDOR],
        },
        {
            label: "HR Resources",
            href: "/hr-resources",
            icon: FolderOpen,
            roles: [RoleName.ADMIN, RoleName.EMPLOYEE],
        },
        {
            label: "RBAC Management",
            href: "/admin/rbac",
            icon: Shield,
            roles: [RoleName.ADMIN],
            permission: RBAC_PERMISSIONS.ROLE_MANAGE,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: Settings,
            roles: [RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR],
        },
    ];

    return (
        <nav className="bg-background border-r border-border p-4 min-h-screen w-64">
            <div className="space-y-2">
                {" "}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">JDC Portal</h2>
                    {user && (
                        <p className="text-sm text-muted-foreground">
                            {user.fullName ||
                                `${user.firstName} ${user.lastName}`.trim() ||
                                user.email}{" "}
                            ({user.accountType})
                        </p>
                    )}
                </div>
                {/* Notifications */}
                <div className="mb-4 relative">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <NotificationBadge
                            onClick={() =>
                                setShowNotificationDropdown(
                                    !showNotificationDropdown
                                )
                            }
                        />
                        <Link href="/notifications" className="flex-1">
                            <span>Notifications</span>
                        </Link>
                    </div>
                    <NotificationDropdown
                        isOpen={showNotificationDropdown}
                        onClose={() => setShowNotificationDropdown(false)}
                    />
                </div>
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const navigationItem = (
                        <Link
                            href={item.href}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );

                    // If item has a specific permission requirement, use PermissionGuard
                    if ("permission" in item && item.permission) {
                        return (
                            <PermissionGuard
                                key={item.href}
                                requiredPermissions={item.permission}
                            >
                                {navigationItem}
                            </PermissionGuard>
                        );
                    }

                    // Otherwise use RoleGuard
                    return (
                        <RoleGuard key={item.href} requiredRoles={item.roles}>
                            {navigationItem}
                        </RoleGuard>
                    );
                })}
                <div className="pt-4 mt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await logout();
                            } catch (error) {
                                console.error("Logout failed:", error);
                                // Force redirect even if logout fails
                                router.push("/login");
                            }
                        }}
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
