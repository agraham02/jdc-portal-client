import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function HRResourcesPage() {
    return (
        <ProtectedRoute anyOf={[P.FILE_READ, P.FILE_READ_ALL]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">HR Resources</h1>
                <div className="flex gap-3">
                    <Can anyOf={[P.FILE_UPLOAD]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/hr-resources/upload"
                        >
                            Upload Document
                        </Link>
                    </Can>
                    <Link
                        className="text-blue-600 hover:underline"
                        href="/hr-resources/library"
                    >
                        View Library
                    </Link>
                </div>
                <p className="text-muted-foreground">
                    HR document library and management will appear here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
