import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDashboardPage() {
    return (
        <ProtectedRoute requiredRoles={UserRole.EMPLOYEE}>
            <div className="container mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">Employee Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>View and manage your assigned tasks.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Time Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Track your work hours and projects.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
