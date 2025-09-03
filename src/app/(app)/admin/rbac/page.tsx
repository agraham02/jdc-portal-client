import Link from "next/link";

export default function RbacPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">RBAC</h1>
            <p className="text-muted-foreground">
                Manage roles, permissions, and user assignments.
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/admin/rbac/roles"
                    >
                        Roles
                    </Link>
                </li>
                <li>
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/admin/rbac/permissions"
                    >
                        Permissions
                    </Link>
                </li>
                <li>
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/admin/rbac/users"
                    >
                        Users
                    </Link>
                </li>
            </ul>
        </main>
    );
}
