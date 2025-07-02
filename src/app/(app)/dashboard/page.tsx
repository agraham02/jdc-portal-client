"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AccountTypeGuard } from "@/components/auth/AccountTypeGuard";
import { RoleName, AccountType } from "@/lib/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/contexts/auth-context";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const { displayName, getRoleDisplay, needsOnboarding, hasAccountIssues } =
        useUserProfile();

    if (!isAuthenticated) {
        return null; // This shouldn't happen due to ProtectedRoute, but good to be safe
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{user?.accountType}</Badge>
                        <Badge variant="secondary">{getRoleDisplay()}</Badge>
                        {needsOnboarding() && (
                            <Badge variant="destructive">
                                Onboarding Required
                            </Badge>
                        )}
                        {hasAccountIssues() && (
                            <Badge variant="destructive">Account Issues</Badge>
                        )}
                    </div>
                </div>

                {/* Welcome Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {displayName}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Welcome to your JDC Portal dashboard.</p>
                        {user && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>Account Type: {user.accountType}</p>
                                <p>Status: {user.status}</p>
                                <p>
                                    Last Login:{" "}
                                    {user.lastLogin
                                        ? new Date(
                                              user.lastLogin
                                          ).toLocaleDateString()
                                        : "Never"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Admin Only Section - Using RoleGuard */}
                <RoleGuard requiredRoles={RoleName.ADMIN}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                This section is only visible to administrators.
                            </p>
                        </CardContent>
                    </Card>
                </RoleGuard>

                {/* Employee and Admin Section - Using multiple roles */}
                <RoleGuard requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE]}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Portal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                This section is visible to employees and
                                administrators.
                            </p>
                        </CardContent>
                    </Card>
                </RoleGuard>

                {/* Vendor Only Section - Using AccountTypeGuard */}
                <AccountTypeGuard requiredAccountTypes={AccountType.VENDOR}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Portal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                This section is only visible to vendor accounts.
                            </p>
                            {user?.vendor && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    <p>Company: {user.vendor.companyName}</p>
                                    {user.vendor.website && (
                                        <p>Website: {user.vendor.website}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </AccountTypeGuard>

                {/* Everyone Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            This section is visible to all authenticated users.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
