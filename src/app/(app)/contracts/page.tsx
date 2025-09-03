import Link from "next/link";

export default function ContractsPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Contracts</h1>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/contracts/new"
                >
                    Create Contract
                </Link>
                <Link
                    className="text-blue-600 hover:underline"
                    href="/contracts/my-applications"
                >
                    My Applications
                </Link>
            </div>
            <p className="text-muted-foreground">
                Listing will appear here. Choose a contract to view details.
            </p>
        </main>
    );
}
