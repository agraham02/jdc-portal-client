import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { EmployeesTable } from "@/components/employees/EmployeesTable";

export default function EmployeesPage() {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <main className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Employees</h1>
                    <Can anyOf={[P.EMPLOYEE_CREATE]}>
                        <Link
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            href="/employees/new"
                        >
                            Create New Employee
                        </Link>
                    </Can>
                </div>
                <EmployeesTable />
            </main>
        </ProtectedRoute>
    );
}
