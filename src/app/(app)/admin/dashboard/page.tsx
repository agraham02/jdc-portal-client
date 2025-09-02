import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute
            anyOf={[P.SYSTEM_ADMIN, P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}
        >
            <div className="container mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Manage all users in the system.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Configure system-wide settings.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>View comprehensive system reports.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
