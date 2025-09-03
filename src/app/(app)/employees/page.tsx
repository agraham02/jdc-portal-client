import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function EmployeesPage() {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Employees</h1>
                <div className="flex gap-3">
                    <Can anyOf={[P.EMPLOYEE_CREATE]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/employees/new"
                        >
                            Create Employee
                        </Link>
                    </Can>
                </div>
                <p className="text-muted-foreground">
                    Listing will appear here. Select an employee to view
                    details.
                </p>
            </main>
        </ProtectedRoute>
    );
}
