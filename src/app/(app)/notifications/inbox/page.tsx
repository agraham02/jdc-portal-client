import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function NotificationsInboxPage() {
    return (
        <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Notification Inbox</h1>
                <p className="text-muted-foreground">
                    Your notifications will appear here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
