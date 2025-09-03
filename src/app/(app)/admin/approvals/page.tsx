import Link from "next/link";

export default function ApprovalsPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Account Approvals</h1>
            <p className="text-muted-foreground">
                Review and decide on external account sign-up requests.
            </p>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/admin/dashboard"
                >
                    Back to Admin Dashboard
                </Link>
                <Link
                    className="text-blue-600 hover:underline"
                    href="/admin/rbac"
                >
                    RBAC
                </Link>
            </div>
            <p className="text-sm text-muted-foreground">
                Listing and actions will be implemented in a future step.
            </p>
        </main>
    );
}
