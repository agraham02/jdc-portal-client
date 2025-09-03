import Link from "next/link";

export default function RbacUsersPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">User Role Assignments</h1>
            <p className="text-muted-foreground">
                Assign roles to users and review access.
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
