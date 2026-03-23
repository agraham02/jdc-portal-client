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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AuthService } from "@/lib/services/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRequestDeletion = async () => {
        setIsDeleting(true);
        try {
            const response = await AuthService.requestAccountDeletion();
            toast.success(
                response.message ||
                    "Account deletion requested. An administrator will review your request.",
            );
            // Optionally log out after requesting deletion
            router.push("/dashboard");
        } catch (e: unknown) {
            const error = e as { message?: string };
            toast.error(
                error.message ||
                    "Failed to request account deletion. Please try again.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Account Information */}
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

            {/* Quick Links */}
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

            {/* Danger Zone */}
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
                                Request Account Deletion
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                This will submit a request to permanently delete
                                your account. An administrator will review your
                                request. Once approved, all your data will be
                                permanently removed and cannot be recovered.
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={isDeleting}
                                    >
                                        Request Account Deletion
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will submit a request to
                                            delete your account. An
                                            administrator will review and
                                            approve the deletion. Once approved,
                                            this action cannot be undone. All
                                            your data will be permanently
                                            removed from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleRequestDeletion}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Yes, Request Deletion
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
