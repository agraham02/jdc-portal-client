"use client";

import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationTestPanel } from "@/components/notifications/NotificationTestPanel";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";

export default function NotificationsPage() {
    return (
        <ProtectedRoute
            requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR]}
        >
            <div className="container mx-auto p-6 space-y-6">
                <NotificationTestPanel />
                <NotificationList className="bg-card rounded-lg shadow-sm border p-6" />
            </div>
        </ProtectedRoute>
    );
}
