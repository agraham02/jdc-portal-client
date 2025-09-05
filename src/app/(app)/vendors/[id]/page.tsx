import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

interface Params {
    id: string;
}
export default function Page({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.VENDOR_READ, P.VENDOR_READ_ALL]}>
            <main>
                <h1>Vendor Details</h1>
                <p>ID: {params.id}</p>
            </main>
        </ProtectedRoute>
    );
}
