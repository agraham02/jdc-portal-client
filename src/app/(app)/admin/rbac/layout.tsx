"use client";

import { ReactNode } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { RBAC_PERMISSIONS } from "@/lib/constants/permissions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function RBACLayout({ children }: { children: ReactNode }) {
    return (
        <PermissionGuard
            requiredPermissions={RBAC_PERMISSIONS.ROLE_MANAGE}
            fallback={
                <Card className="max-w-md mx-auto mt-8">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don&apos;t have permission to access RBAC
                            management features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Contact your administrator if you believe you should
                            have access to this area.
                        </p>
                    </CardContent>
                </Card>
            }
        >
            <div className="space-y-6">
                <div className="border-b border-border pb-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        RBAC Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage roles, permissions, and user access control
                    </p>
                </div>
                {children}
            </div>
        </PermissionGuard>
    );
}
