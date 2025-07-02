import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { UserRole } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                {/* Admin Only Section */}
                <RoleGuard requiredRoles={UserRole.ADMIN}>
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

                {/* Employee and Admin Section */}
                <RoleGuard requiredRoles={[UserRole.ADMIN, UserRole.EMPLOYEE]}>
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

                {/* Vendor Only Section */}
                <RoleGuard requiredRoles={UserRole.VENDOR}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vendor Portal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This section is only visible to vendors.</p>
                        </CardContent>
                    </Card>
                </RoleGuard>

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
