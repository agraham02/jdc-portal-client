"use client";

import { Inbox } from "@novu/nextjs";
import { useAuth } from "@/lib/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { useRouter } from "next/navigation";

/**
 * Full-page Novu notification inbox
 * Provides a dedicated view for all notifications with preferences access
 */
export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_ID;

    if (!applicationIdentifier) {
        return (
            <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
                <main className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            Notifications are not configured. Please set
                            NEXT_PUBLIC_NOVU_APP_ID.
                        </p>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
            <main className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage all your notifications
                    </p>
                </div>

                <div className="bg-background border rounded-lg p-4 min-h-[600px]">
                    <Inbox
                        applicationIdentifier={applicationIdentifier}
                        subscriberId={user._id}
                        appearance={{
                            variables: {
                                colorBackground: "hsl(var(--background))",
                                colorForeground: "hsl(var(--foreground))",
                                colorPrimary: "hsl(var(--primary))",
                                colorPrimaryForeground:
                                    "hsl(var(--primary-foreground))",
                                colorSecondary: "hsl(var(--secondary))",
                                colorSecondaryForeground:
                                    "hsl(var(--secondary-foreground))",
                                colorNeutral: "hsl(var(--muted-foreground))",
                                colorCounter: "hsl(var(--destructive))",
                                colorCounterForeground:
                                    "hsl(var(--destructive-foreground))",
                                fontSize: "14px",
                            },
                        }}
                        onNotificationClick={(notification) => {
                            const redirectUrl = notification.redirect?.url;
                            if (redirectUrl) {
                                if (redirectUrl.startsWith("/")) {
                                    router.push(redirectUrl);
                                } else {
                                    window.location.href = redirectUrl;
                                }
                            }
                        }}
                    />
                </div>
            </main>
        </ProtectedRoute>
    );
}
