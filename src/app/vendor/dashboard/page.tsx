import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VendorDashboardPage() {
    return (
        <ProtectedRoute requiredRoles={UserRole.VENDOR}>
            <div className="container mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">Vendor Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>View your active contracts and agreements.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoicing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Submit and track your invoices.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
