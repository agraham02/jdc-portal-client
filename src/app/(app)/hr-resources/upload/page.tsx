import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function HRUploadPage() {
    return (
        <ProtectedRoute anyOf={[P.FILE_UPLOAD]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Upload HR Document</h1>
                <p className="text-muted-foreground">
                    Upload form will be implemented here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
