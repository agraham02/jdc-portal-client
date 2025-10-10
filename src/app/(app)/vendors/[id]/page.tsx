import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { VendorDetailsWithApproval } from "@/components/vendors/VendorDetailsWithApproval";

interface Params {
    id: string;
}

export default function Page({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.VENDOR_READ, P.VENDOR_READ_ALL]}>
            <VendorDetailsWithApproval vendorId={params.id} />
        </ProtectedRoute>
    );
}
