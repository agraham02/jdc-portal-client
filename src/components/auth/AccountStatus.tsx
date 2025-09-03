"use client";

import { AlertTriangle, Clock, XCircle, Archive, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { UserStatus, type User } from "@/lib/types/auth";

interface AccountStatusProps {
    user: User | null;
}

export function AccountStatusPage({ user }: AccountStatusProps) {
    const { logout } = useAuth();

    if (!user) return null;

    const getStatusConfig = () => {
        switch (user.status) {
            case UserStatus.PENDING:
                return {
                    icon: Clock,
                    title: "Account Pending Approval",
                    message:
                        "Your account is awaiting admin approval. You will receive an email once approved.",
                    variant: "warning" as const,
                };
            case UserStatus.ONBOARDING:
                return {
                    icon: Clock,
                    title: "Account Setup In Progress",
                    message:
                        "Your account is being set up. Please complete the onboarding process.",
                    variant: "warning" as const,
                };
            case UserStatus.INACTIVE:
                return {
                    icon: AlertTriangle,
                    title: "Account Inactive",
                    message:
                        "Your account is temporarily inactive. Please contact support to reactivate.",
                    variant: "warning" as const,
                };
            case UserStatus.REJECTED:
                return {
                    icon: XCircle,
                    title: "Account Application Rejected",
                    message:
                        "Your account application has been rejected. Please contact support for more information.",
                    variant: "destructive" as const,
                };
            case UserStatus.TERMINATED:
                return {
                    icon: Ban,
                    title: "Account Terminated",
                    message:
                        "Your account has been terminated. Please contact support if you believe this is an error.",
                    variant: "destructive" as const,
                };
            case UserStatus.ARCHIVED:
                return {
                    icon: Archive,
                    title: "Account Archived",
                    message:
                        "Your account has been archived. Please contact support to restore access.",
                    variant: "warning" as const,
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    const { icon: Icon, title, message, variant } = config;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        {message}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant={
                                variant === "destructive"
                                    ? "destructive"
                                    : "outline"
                            }
                            onClick={logout}
                            className="flex-1"
                        >
                            Sign Out
                        </Button>
                        {user.status === UserStatus.PENDING && (
                            <Button className="flex-1">Contact Support</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
