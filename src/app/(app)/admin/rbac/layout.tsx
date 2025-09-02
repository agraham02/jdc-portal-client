"use client";

import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function RBACLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute
            anyOf={[P.RBAC_ROLE_MANAGE, P.RBAC_ROLE_READ]}
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
        </ProtectedRoute>
    );
}
