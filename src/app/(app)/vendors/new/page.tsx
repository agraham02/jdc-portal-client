import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function VendorCreatePage() {
    return (
        <ProtectedRoute anyOf={[P.VENDOR_CREATE]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Create Vendor</h1>
                <p className="text-muted-foreground">
                    Form will be implemented here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
