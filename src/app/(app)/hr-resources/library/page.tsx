import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function HRLibraryPage() {
    return (
        <ProtectedRoute anyOf={[P.FILE_READ, P.FILE_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">HR Document Library</h1>
                <p className="text-muted-foreground">
                    Documents list will be implemented here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
