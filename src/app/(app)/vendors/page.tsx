import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function VendorsPage() {
    return (
        <ProtectedRoute anyOf={[P.VENDOR_READ, P.VENDOR_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Vendors</h1>
                <div className="flex gap-3">
                    <Can anyOf={[P.VENDOR_CREATE]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/vendors/new"
                        >
                            Create Vendor
                        </Link>
                    </Can>
                </div>
                <p className="text-muted-foreground">
                    Listing will appear here. Select a vendor to view details.
                </p>
            </main>
        </ProtectedRoute>
    );
}
