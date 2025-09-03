import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function NotificationsBroadcastsPage() {
    return (
        <ProtectedRoute
            anyOf={[P.NOTIFICATIONS_BROADCAST, P.NOTIFICATIONS_MANAGE]}
        >
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">
                    Broadcast Notifications
                </h1>
                <p className="text-muted-foreground">
                    Broadcast tools and history will appear here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
