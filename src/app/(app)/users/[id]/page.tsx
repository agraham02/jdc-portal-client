import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityDetail from "@/components/common/EntityDetail";

interface Params {
    id: string;
}
export default function Page({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.USER_READ, P.USER_READ_ALL]}>
            <main>
                <EntityDetail
                    entityType="user"
                    id={params.id}
                    canUpdate={true}
                />
            </main>
        </ProtectedRoute>
    );
}
