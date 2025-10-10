import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityCreateForm from "@/components/common/EntityCreateForm";

export default function VendorCreatePage() {
    const sections = [
        {
            title: "General info",
            description: "Account and contact information",
            fields: [
                {
                    name: "email",
                    label: "Email",
                    placeholder: "vendor@example.com",
                    type: "email",
                    required: true,
                },
                {
                    name: "firstName",
                    label: "First name",
                    placeholder: "First name",
                },
                {
                    name: "lastName",
                    label: "Last name",
                    placeholder: "Last name",
                },
                {
                    name: "contactPhone",
                    label: "Phone",
                    placeholder: "(555) 555-5555",
                },
            ],
        },
        {
            title: "Vendor info",
            description: "Company details and services",
            fields: [
                {
                    name: "companyName",
                    label: "Company name",
                    placeholder: "Acme Co",
                    required: true,
                },
                {
                    name: "website",
                    label: "Website",
                    placeholder: "https://example.com",
                    type: "url",
                },
                {
                    name: "contactName",
                    label: "Contact name",
                    placeholder: "Primary contact",
                },
                {
                    name: "contactEmail",
                    label: "Contact email",
                    placeholder: "contact@example.com",
                    type: "email",
                },
                {
                    name: "servicesOffered",
                    label: "Services offered",
                    placeholder: "Comma-separated services",
                },
                {
                    name: "notes",
                    label: "Notes",
                    placeholder: "Internal notes",
                },
            ],
        },
    ];

    return (
        <ProtectedRoute anyOf={[P.VENDOR_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create Vendor</h1>
                <EntityCreateForm
                    sections={sections}
                    fields={[]}
                    apiPath="/vendors"
                    onSuccessPath="/vendors"
                    submitLabel="Create Vendor"
                />
            </main>
        </ProtectedRoute>
    );
}
