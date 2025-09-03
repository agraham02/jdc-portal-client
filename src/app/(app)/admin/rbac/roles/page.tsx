import Link from "next/link";

export default function RolesPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Roles</h1>
            <p className="text-muted-foreground">
                Manage role definitions and their permissions.
            </p>
            <div className="flex gap-4">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/admin/rbac"
                >
                    Back to RBAC
                </Link>
            </div>
        </main>
    );
}
