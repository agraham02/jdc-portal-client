"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { session } from "@/lib/session";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
import Link from "next/link";

export default function AuthDebugPage() {
    const { user, isLoading } = useAuth();
    const [logs, setLogs] = useState<string[]>([]);
    const [isTestLoading, setIsTestLoading] = useState(false);

    // Only allow debug page in development or when explicitly enabled
    const DEBUG_ENABLED =
        process.env.NODE_ENV !== "production" ||
        process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => setLogs([]);

    const runTest = async (
        testName: string,
        testFn: () => Promise<unknown>
    ) => {
        setIsTestLoading(true);
        addLog(`Starting test: ${testName}`);
        try {
            const result = await testFn();
            addLog(`✅ ${testName} completed successfully`);
            if (result) {
                addLog(`Result: ${JSON.stringify(result, null, 2)}`);
            }
        } catch (error) {
            addLog(
                `❌ ${testName} failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setIsTestLoading(false);
        }
    };

    const tests = [
        {
            name: "Backend Connectivity (/auth/refresh)",
            fn: () => AuthService.refreshToken(),
        },
        {
            name: "Session State",
            fn: async () => {
                const token = session.getAccessToken();
                return {
                    hasToken: !!token,
                    tokenLength: token?.length || 0,
                };
            },
        },
        {
            name: "Token Info (decode payload)",
            fn: async () => {
                const token = session.getAccessToken();
                if (!token) throw new Error("No access token in session");
                const [, payload] = token.split(".");
                const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
                return json;
            },
        },
        {
            name: "Auth Me Endpoint",
            fn: () => apiClient.get("/auth/me"),
        },
        {
            name: "Token Refresh",
            fn: () => AuthService.refreshToken(),
        },
        {
            name: "Full Diagnostic",
            fn: async () => {
                const out: Record<string, unknown> = {};
                try {
                    out.refresh = await AuthService.refreshToken();
                } catch (e) {
                    out.refreshError = e instanceof Error ? e.message : String(e);
                }
                try {
                    out.me = await AuthService.getProfile();
                } catch (e) {
                    out.meError = e instanceof Error ? e.message : String(e);
                }
                return out;
            },
        },
    ];

    useEffect(() => {
        if (DEBUG_ENABLED) {
            addLog("Auth Debug Page loaded");
            addLog(`Environment: ${process.env.NODE_ENV}`);

            // Only log API and auth info if an access token exists
            const hasToken = !!session.getAccessToken();
            if (hasToken) {
                addLog(
                    `API URL: ${process.env.NEXT_PUBLIC_API_URL || "Not set"}`
                );
                addLog(
                    `Debug Auth: ${
                        process.env.NEXT_PUBLIC_DEBUG_AUTH || "Not set"
                    }`
                );
            } else {
                addLog("Not authenticated - some debug info hidden");
            }
        }
    }, [DEBUG_ENABLED]);

    // Redirect or show error if debug is not enabled
    if (!DEBUG_ENABLED) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4 text-red-600">
                        Debug Mode Disabled
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Debug functionality is only available in development
                        mode or when explicitly enabled.
                    </p>
                    <p className="text-sm text-gray-500">
                        To enable debug mode in production, set
                        NEXT_PUBLIC_DEBUG_AUTH=true
                    </p>
                </div>
            </div>
        );
    }

    // Show loading while auth is being checked
    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Loading...</h1>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Require authentication for debug page
    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4 text-orange-600">
                        Authentication Required
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Please log in to access the debug console.
                    </p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Go to Login →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">
                Authentication Debug Console
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Controls */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {tests.map((test, index) => (
                            <button
                                key={index}
                                onClick={() => runTest(test.name, test.fn)}
                                disabled={isTestLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-left"
                            >
                                {test.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={clearLogs}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Clear Logs
                        </button>
                        <button
                            onClick={() => {
                                const logText = logs.join("\\n");
                                navigator.clipboard.writeText(logText);
                                addLog("Logs copied to clipboard");
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Copy Logs
                        </button>
                    </div>

                    {/* Environment Info */}
                    <div className="mt-6 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold mb-2">Environment Info</h3>
                        <EnvironmentInfo />
                    </div>
                </div>

                {/* Logs Display */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
                    <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-gray-500">
                                No logs yet. Run a test to see output.
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Test Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Login Test</h2>
                <LoginTest onLog={addLog} />
            </div>

            {/* Manual API Test Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Manual API Test</h2>
                <ManualApiTest onLog={addLog} />
            </div>
        </div>
    );
}

// Component to handle client-side only environment info to prevent hydration mismatch
function EnvironmentInfo() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        // Only show API URL in development
        API_URL:
            process.env.NODE_ENV === "development"
                ? process.env.NEXT_PUBLIC_API_URL
                : "[Hidden in production]",
        DEBUG_AUTH: process.env.NEXT_PUBLIC_DEBUG_AUTH || "false",
        current_url:
            mounted && typeof window !== "undefined"
                ? window.location.href
                : "Loading...",
        // Sanitize user agent to avoid fingerprinting
        user_agent:
            mounted &&
            typeof window !== "undefined" &&
            process.env.NODE_ENV === "development"
                ? navigator.userAgent
                : process.env.NODE_ENV === "development"
                ? "Loading..."
                : "[Hidden in production]",
    };

    return <pre className="text-sm">{JSON.stringify(envInfo, null, 2)}</pre>;
}

function ManualApiTest({ onLog }: { onLog: (message: string) => void }) {
    const [endpoint, setEndpoint] = useState("/auth/me");
    const [method, setMethod] = useState("GET");
    const [body, setBody] = useState("{}");
    const [loading, setLoading] = useState(false);

    const runManualTest = async () => {
        setLoading(true);
        onLog(`Manual test: ${method} ${endpoint}`);

        try {
            let result;
            const bodyData =
                method !== "GET" && body.trim() ? JSON.parse(body) : undefined;

            switch (method) {
                case "GET":
                    result = await apiClient.get(endpoint);
                    break;
                case "POST":
                    result = await apiClient.post(endpoint, bodyData);
                    break;
                case "PUT":
                    result = await apiClient.put(endpoint, bodyData);
                    break;
                case "PATCH":
                    result = await apiClient.patch(endpoint, bodyData);
                    break;
                case "DELETE":
                    result = await apiClient.delete(endpoint);
                    break;
                default:
                    throw new Error("Unsupported method");
            }

            onLog(`✅ Manual test successful`);
            onLog(`Response: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            onLog(
                `❌ Manual test failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="px-3 py-2 border rounded"
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                </select>

                <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/auth/me"
                    className="px-3 py-2 border rounded md:col-span-2"
                />

                <button
                    onClick={runManualTest}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? "Testing..." : "Test"}
                </button>
            </div>

            {method !== "GET" && (
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Request body (JSON)"
                    className="w-full px-3 py-2 border rounded h-24"
                />
            )}
        </div>
    );
}

function LoginTest({ onLog }: { onLog: (message: string) => void }) {
    // Only pre-fill credentials in development
    const [email, setEmail] = useState(
        process.env.NODE_ENV === "development" ? "admin.test@jdc.com" : ""
    );
    const [password, setPassword] = useState(
        process.env.NODE_ENV === "development" ? "Admin123!" : ""
    );
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        onLog(`Testing login with email: ${email}`);

        try {
            const result = await AuthService.login({ email, password });
            onLog(`✅ Login test completed`);
            onLog(`User: ${JSON.stringify(result.user, null, 2)}`);
            try {
                const me = await AuthService.getProfile();
                onLog(`/auth/me: ${JSON.stringify(me, null, 2)}`);
            } catch (e) {
                onLog(
                    `⚠️ /auth/me failed after login: ${
                        e instanceof Error ? e.message : String(e)
                    }`
                );
            }
        } catch (error) {
            onLog(
                `❌ Login test failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="px-3 py-2 border rounded"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="px-3 py-2 border rounded"
                />

                <button
                    onClick={testLogin}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Testing..." : "Test Login"}
                </button>
            </div>

            <div className="text-sm text-gray-600">
                <p>
                    {process.env.NODE_ENV === "development"
                        ? "Default test credentials are pre-filled. "
                        : "Enter your credentials to test the login flow. "}
                    This will test the complete login flow:
                </p>
                <ul className="list-disc list-inside mt-1">
                    <li>POST /auth/login</li>
                    <li>Token storage in memory</li>
                    <li>Cookie setting for refresh token</li>
                    <li>GET /auth/me with new token</li>
                </ul>
            </div>
        </div>
    );
}
