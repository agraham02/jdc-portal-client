"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/profile";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
import { toast } from "sonner";
import { AlertTriangle, Trash2, Clock } from "lucide-react";

export default function SettingsPage() {
    const { user, refresh } = useAuth();
    const router = useRouter();
    const [cancelling, setCancelling] = useState(false);

    async function handleCancel() {
        if (!user?._id) return;
        setCancelling(true);
        try {
            await AuthService.cancelDeletion(user._id);
            toast.success("Deletion request cancelled");
            await refresh();
        } catch (e: unknown) {
            const err = e as { message?: string };
            toast.error(err.message || "Failed to cancel deletion request");
        } finally {
            setCancelling(false);
        }
    }

    const hasPendingDeletion =
        !!user?.deleteRequested || !!user?.deletionScheduledFor;

    return (
        <main className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {hasPendingDeletion && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 flex items-start gap-3"
                >
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold">
                            Deletion{" "}
                            {user?.deletionScheduledFor
                                ? "scheduled"
                                : "requested"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {user?.deletionScheduledFor
                                ? `Your account will be permanently anonymized on ${new Date(
                                      user.deletionScheduledFor,
                                  ).toLocaleDateString()}. You can cancel before then.`
                                : "Your deletion request is pending approval. You can cancel it at any time."}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={cancelling}
                    >
                        {cancelling ? "Cancelling..." : "Cancel"}
                    </Button>
                </motion.div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        View your basic account details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Email
                        </p>
                        <p className="text-base">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Account Status
                        </p>
                        <p className="text-base capitalize">{user?.status}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Member Since
                        </p>
                        <p className="text-base">
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>
                        Access common account management pages
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => router.push("/profile")}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => router.push("/profile/security")}
                    >
                        Change Password
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() =>
                            router.push("/notifications/preferences")
                        }
                    >
                        Notification Preferences
                    </Button>
                </CardContent>
            </Card>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions that affect your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Account Deletion
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Close your account. Depending on your role,
                                deletion may be immediate (with a grace period)
                                or require administrative approval. Anonymized
                                accounts cannot be recovered.
                            </p>
                            {user && (
                                <DeleteAccountDialog
                                    user={user}
                                    onSuccess={() => refresh()}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
("use client");
