"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { session } from "@/lib/session";

export function AuthDebugPanel() {
    const { user, refreshToken, refreshUser, logout } = useAuth();

    const handleManualRefresh = async () => {
        console.log("Manual refresh triggered");
        const success = await refreshToken();
        console.log("Manual refresh result:", success);
        if (success) {
            await refreshUser();
        }
    };

    const clearToken = () => {
        session.destroy();
        console.log("Access token cleared");
    };

    const checkToken = () => {
        const token = session.getAccessToken();
        console.log("Current access token:", token ? "exists" : "not found");
        console.log("Token value:", token);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Auth Debug Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-sm">
                    <p>User: {user ? user.email : "Not logged in"}</p>
                    <p>Status: {user ? user.status : "N/A"}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button onClick={checkToken} variant="outline" size="sm">
                        Check Token
                    </Button>
                    <Button onClick={handleManualRefresh} variant="outline" size="sm">
                        Manual Refresh
                    </Button>
                    <Button onClick={clearToken} variant="outline" size="sm">
                        Clear Token
                    </Button>
                    <Button onClick={logout} variant="destructive" size="sm">
                        Logout
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
