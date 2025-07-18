"use client";

import { useAuth } from "@/lib/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { session } from "@/lib/session";
import { AuthDebugger } from "@/lib/auth-debug";
import { useState, useEffect } from "react";

export function AuthDebugPanel() {
    const { user, refreshToken, refreshUser, logout } = useAuth();
    const [sessionInfo, setSessionInfo] = useState<any>(null);

    const DEBUG_ENABLED = 
        process.env.NODE_ENV !== 'production' || 
        process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';

    useEffect(() => {
        if (DEBUG_ENABLED && session.debug) {
            const interval = setInterval(() => {
                setSessionInfo(session.debug!());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [DEBUG_ENABLED]);

    if (!DEBUG_ENABLED) {
        return null;
    }

    const handleManualRefresh = async () => {
        console.log("Manual refresh triggered");
        AuthDebugger.log("Manual refresh triggered from debug panel");
        const success = await refreshToken();
        console.log("Manual refresh result:", success);
        if (success) {
            await refreshUser();
        }
    };

    const clearToken = () => {
        session.destroy();
        AuthDebugger.log("Access token cleared from debug panel");
        console.log("Access token cleared");
    };

    const checkToken = () => {
        const token = session.getAccessToken();
        console.log("Current access token:", token ? "exists" : "not found");
        AuthDebugger.log("Token check", { exists: !!token, length: token?.length });
    };

    const runFullDiagnostic = async () => {
        AuthDebugger.log("Running full diagnostic from debug panel");
        await AuthDebugger.runFullDiagnostic();
    };

    const testBackend = async () => {
        AuthDebugger.log("Testing backend connection from debug panel");
        await AuthDebugger.testConnection();
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Auth Debug Panel
                    <div className={`w-2 h-2 rounded-full ${sessionInfo?.hasToken ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                    <p>User: {user ? user.email : "Not logged in"}</p>
                    <p>Status: {user ? user.status : "N/A"}</p>
                    <p>Token: {sessionInfo?.hasToken ? "Present" : "None"}</p>
                    <p>Env: {process.env.NODE_ENV}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button onClick={checkToken} variant="outline" size="sm">
                        Check Token
                    </Button>
                    <Button onClick={handleManualRefresh} variant="outline" size="sm">
                        Manual Refresh
                    </Button>
                    <Button onClick={testBackend} variant="outline" size="sm">
                        Test Backend
                    </Button>
                    <Button onClick={runFullDiagnostic} variant="outline" size="sm">
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
                    <a href="/debug" className="text-blue-600 hover:underline">
                        Full Debug Page →
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
