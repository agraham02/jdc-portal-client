import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function EmployeeCreatePage() {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create Employee</h1>
                <p className="text-muted-foreground">
                    Form will be implemented here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
