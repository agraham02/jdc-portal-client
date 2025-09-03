import Link from "next/link";

export default function EmployeesPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Employees</h1>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/employees/new"
                >
                    Create Employee
                </Link>
            </div>
            <p className="text-muted-foreground">
                Listing will appear here. Select an employee to view details.
            </p>
        </main>
    );
}
