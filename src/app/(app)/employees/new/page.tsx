import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityCreateForm from "@/components/forms/EntityCreateForm";

export default function EmployeeCreatePage() {
    const sections = [
        {
            title: "General info",
            description: "Account and contact information",
            fields: [
                {
                    name: "email",
                    label: "Email",
                    placeholder: "employee@example.com",
                    type: "email",
                    required: true,
                },
                {
                    name: "firstName",
                    label: "First name",
                    placeholder: "First name",
                    required: true,
                },
                {
                    name: "lastName",
                    label: "Last name",
                    placeholder: "Last name",
                    required: true,
                },
                {
                    name: "contactPhone",
                    type: "tel",
                    label: "Phone",
                    placeholder: "(555) 555-5555",
                },
                {
                    name: "contactEmail",
                    type: "email",
                    label: "Contact Email (Optional)",
                    placeholder: "personal@example.com",
                },
            ],
        },
        {
            title: "Employee info",
            description: "HR-specific fields",
            fields: [
                {
                    name: "employeeId",
                    label: "Employee ID",
                    placeholder: "E12345",
                },
                {
                    name: "jobTitle",
                    label: "Job title",
                    placeholder: "Software Engineer",
                },
                {
                    name: "department",
                    label: "Department",
                    placeholder: "Engineering",
                },
                {
                    name: "hireDate",
                    label: "Hire date",
                    placeholder: "YYYY-MM-DD",
                    type: "date",
                },
            ],
        },
    ];

    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create Employee</h1>
                <EntityCreateForm
                    sections={sections}
                    fields={[]}
                    apiPath="/employees"
                    onSuccessPath="/employees"
                    submitLabel="Create Employee"
                />
            </main>
        </ProtectedRoute>
    );
}
