"use client";

import { useState } from "react";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationCreationPanel } from "@/components/notifications/NotificationCreationPanel";
import { NotificationCreationPanelAdvanced } from "@/components/notifications/NotificationCreationPanelAdvanced";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users } from "lucide-react";

export default function NotificationsPage() {
    const [useAdvancedPanel, setUseAdvancedPanel] = useState(false);

    return (
        <ProtectedRoute
            requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR]}
        >
            <div className="container mx-auto p-6 space-y-6">
                {/* Header with toggle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Notification Management
                            </span>
                            <ProtectedRoute requiredRoles={[RoleName.ADMIN]}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {useAdvancedPanel
                                            ? "Advanced Mode"
                                            : "Simple Mode"}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setUseAdvancedPanel(
                                                !useAdvancedPanel
                                            )
                                        }
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        {useAdvancedPanel
                                            ? "Simple Mode"
                                            : "Advanced Mode"}
                                    </Button>
                                </div>
                            </ProtectedRoute>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {useAdvancedPanel
                                ? "Advanced panel with user search and multiple recipient selection"
                                : "Simple panel for basic notification creation and testing"}
                        </p>
                    </CardContent>
                </Card>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Creation Panel - Only visible to admins */}
                    <div className="lg:w-1/2">
                        {useAdvancedPanel ? (
                            <NotificationCreationPanelAdvanced />
                        ) : (
                            <NotificationCreationPanel />
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="lg:w-1/2">
                        <NotificationList className="bg-card rounded-lg shadow-sm border p-6" />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
