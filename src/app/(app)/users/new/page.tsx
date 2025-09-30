import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityCreateForm from "@/components/forms/EntityCreateForm";

export default function UserCreatePage() {
    const fields = [
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
            name: "email",
            label: "Email",
            placeholder: "user@example.com",
            type: "email",
            required: true,
        },
    ];

    return (
        <ProtectedRoute anyOf={[P.USER_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create New User</h1>
                <EntityCreateForm
                    fields={fields}
                    apiPath="/users"
                    onSuccessPath="/users"
                    submitLabel="Create User"
                />
            </main>
        </ProtectedRoute>
    );
}
