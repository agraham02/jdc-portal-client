import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityDetail from "@/components/common/EntityDetail";

interface Params {
    id: string;
}
export default function EmployeeDetailsPage({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <main>
                <EntityDetail
                    entityType="employee"
                    id={params.id}
                    canUpdate={true}
                />
            </main>
        </ProtectedRoute>
    );
}
