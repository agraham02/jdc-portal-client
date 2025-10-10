import Link from "next/link";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Megaphone, Settings, Inbox } from "lucide-react";

export default function NotificationsPage() {
    return (
        <ProtectedRoute
            anyOf={[
                P.NOTIFICATIONS_READ,
                P.NOTIFICATIONS_MANAGE,
                P.NOTIFICATIONS_BROADCAST,
            ]}
        >
            <main className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your notifications and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Inbox */}
                    <Can anyOf={[P.NOTIFICATIONS_READ]}>
                        <Link href="/notifications/inbox">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Inbox className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Inbox</CardTitle>
                                            <CardDescription>
                                                View all your notifications
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </Can>

                    {/* Broadcasts */}
                    <Can
                        anyOf={[
                            P.NOTIFICATIONS_BROADCAST,
                            P.NOTIFICATIONS_MANAGE,
                        ]}
                    >
                        <Link href="/notifications/broadcasts">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                                            <Megaphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Broadcasts</CardTitle>
                                            <CardDescription>
                                                Send system announcements
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </Can>

                    {/* Preferences */}
                    <Can anyOf={[P.NOTIFICATIONS_READ]}>
                        <Link href="/notifications/preferences">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Preferences</CardTitle>
                                            <CardDescription>
                                                Manage notification settings
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </Can>
                </div>
            </main>
        </ProtectedRoute>
    );
}
