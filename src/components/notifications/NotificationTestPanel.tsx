"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationService } from "@/lib/services/notificationService";
import { NotificationType } from "@/lib/types/notifications";
import { useAuth } from "@/lib/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";

export function NotificationTestPanel() {
    const { user } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    const createTestNotification = async () => {
        if (!user) return;

        setIsCreating(true);
        try {
            await notificationService.createNotification({
                userId: user._id,
                type: NotificationType.SYSTEM_ANNOUNCEMENT,
                title: "Test Notification",
                message:
                    "This is a test notification created from the frontend.",
                data: { source: "frontend-test" },
            });

            // Refresh the page to see the new notification
            window.location.reload();
        } catch (error) {
            console.error("Failed to create test notification:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ProtectedRoute requiredRoles={[RoleName.ADMIN]}>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Notification Test Panel</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Create a test notification to verify the system is
                        working.
                    </p>
                    <Button
                        onClick={createTestNotification}
                        disabled={isCreating}
                    >
                        {isCreating
                            ? "Creating..."
                            : "Create Test Notification"}
                    </Button>
                </CardContent>
            </Card>
        </ProtectedRoute>
    );
}
