import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

interface Params {
    id: string;
}
export default function EmployeeDetailsPage({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <main>
                <h1>Employee Details</h1>
                <p>ID: {params.id}</p>
            </main>
        </ProtectedRoute>
    );
}
