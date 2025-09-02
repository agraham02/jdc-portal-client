"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { session } from "@/lib/session";
import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/auth";
import Link from "next/link";

export function AuthDebugPanel() {
    const { user, refresh, logout } = useAuth();
    const [hasToken, setHasToken] = useState<boolean>(
        !!session.getAccessToken()
    );

    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

    useEffect(() => {
        if (!DEBUG_ENABLED) return;
        const interval = setInterval(() => {
            try {
                setHasToken(!!session.getAccessToken());
            } catch (error) {
                console.error("Error updating token state:", error);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [DEBUG_ENABLED]);

    if (!DEBUG_ENABLED) {
        return null;
    }

    const handleManualRefresh = async () => {
        console.log("Manual refresh triggered");
        try {
            await refresh();
            console.log("Manual refresh complete");
        } catch (e) {
            console.error("Manual refresh failed", e);
        }
    };

    const clearToken = () => {
        session.clear();
        setHasToken(false);
        console.log("Access token cleared");
    };

    const checkToken = () => {
        const token = session.getAccessToken();
        console.log("Current access token:", token ? "exists" : "not found");
    };

    const runFullDiagnostic = async () => {
        console.log("Running lightweight diagnostic...");
        try {
            const me = await AuthService.getProfile();
            console.log("/auth/me response:", me);
        } catch (e) {
            console.error("/auth/me failed", e);
        }
    };

    const testBackend = async () => {
        console.log("Testing backend connection (/auth/refresh) ...");
        try {
            const res = await AuthService.refreshToken();
            console.log("/auth/refresh OK", res);
        } catch (e) {
            console.error("/auth/refresh failed", e);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Auth Debug Panel
                    <div
                        className={`w-2 h-2 rounded-full ${
                            hasToken ? "bg-green-400" : "bg-red-400"
                        }`}
                    ></div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                    <p>User: {user ? user.email : "Not logged in"}</p>
                    <p>Status: {user ? user.status : "N/A"}</p>
                    <p>Token: {hasToken ? "Present" : "None"}</p>
                    <p>Env: {process.env.NODE_ENV}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button onClick={checkToken} variant="outline" size="sm">
                        Check Token
                    </Button>
                    <Button
                        onClick={handleManualRefresh}
                        variant="outline"
                        size="sm"
                    >
                        Manual Refresh
                    </Button>
                    <Button onClick={testBackend} variant="outline" size="sm">
                        Test Backend
                    </Button>
                    <Button
                        onClick={runFullDiagnostic}
                        variant="outline"
                        size="sm"
                    >
                        Full Diagnostic
                    </Button>
                    <Button onClick={clearToken} variant="outline" size="sm">
                        Clear Token
                    </Button>
                    <Button onClick={logout} variant="destructive" size="sm">
                        Logout
                    </Button>
                </div>
                <div className="text-center text-xs">
                    <Link
                        href="/debug"
                        className="text-blue-600 hover:underline"
                    >
                        Full Debug Page →
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
