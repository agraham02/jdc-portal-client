import Link from "next/link";

export default function VendorsPage() {
    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-semibold">Vendors</h1>
            <div className="flex gap-3">
                <Link
                    className="text-blue-600 hover:underline"
                    href="/vendors/new"
                >
                    Create Vendor
                </Link>
            </div>
            <p className="text-muted-foreground">
                Listing will appear here. Select a vendor to view details.
            </p>
        </main>
    );
}
