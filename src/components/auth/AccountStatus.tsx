"use client";

import { AlertTriangle, Clock, XCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, AuthUser, AccountStatus } from "@/lib/contexts/auth-context";

interface AccountStatusProps {
    user: AuthUser | null;
}

export function AccountStatusPage({ user }: AccountStatusProps) {
    const { logout } = useAuth();

    if (!user) return null;

    const getStatusConfig = () => {
        switch (user.status) {
            case AccountStatus.PENDING:
                return {
                    icon: Clock,
                    title: "Account Pending Approval",
                    message:
                        "Your account is awaiting admin approval. You will receive an email once approved.",
                    variant: "warning" as const,
                };
            case AccountStatus.SUSPENDED:
                return {
                    icon: XCircle,
                    title: "Account Suspended",
                    message:
                        "Your account has been suspended. Please contact support for assistance.",
                    variant: "destructive" as const,
                };
            case AccountStatus.INACTIVE:
                return {
                    icon: AlertTriangle,
                    title: "Account Inactive",
                    message:
                        "Your account is inactive. Please contact support to reactivate.",
                    variant: "warning" as const,
                };
            default:
                if (!user.isEmailVerified) {
                    return {
                        icon: Mail,
                        title: "Email Verification Required",
                        message:
                            "Please verify your email address to access all features.",
                        variant: "warning" as const,
                    };
                }
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
                            variant="outline"
                            onClick={logout}
                            className="flex-1"
                        >
                            Sign Out
                        </Button>
                        {!user.isEmailVerified && (
                            <Button className="flex-1">Resend Email</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
