import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

export default function NotificationsPage() {
    return (
        <ProtectedRoute
            anyOf={[
                P.NOTIFICATIONS_READ,
                P.NOTIFICATIONS_MANAGE,
                P.NOTIFICATIONS_BROADCAST,
            ]}
        >
            <main className="space-y-4">
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <div className="flex gap-3">
                    <Can anyOf={[P.NOTIFICATIONS_READ]}>
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/notifications/inbox"
                        >
                            Inbox
                        </Link>
                    </Can>
                    <Can
                        anyOf={[
                            P.NOTIFICATIONS_BROADCAST,
                            P.NOTIFICATIONS_MANAGE,
                        ]}
                    >
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/notifications/broadcasts"
                        >
                            Broadcasts
                        </Link>
                    </Can>
                </div>
                <p className="text-muted-foreground">
                    Notifications and preferences will appear here.
                </p>
            </main>
        </ProtectedRoute>
    );
}
