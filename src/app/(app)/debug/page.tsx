"use client";

import { useState, useEffect } from "react";
import { AuthDebugger } from "@/lib/auth-debug";
import { apiClient } from "@/lib/api";
import { session } from "@/lib/session";

export default function AuthDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    };

    const clearLogs = () => setLogs([]);

    const runTest = async (testName: string, testFn: () => Promise<unknown>) => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const tests = [
        {
            name: "Backend Health Check",
            fn: () => AuthDebugger.testConnection(),
        },
        {
            name: "Debug Headers",
            fn: () => AuthDebugger.debugHeaders({ testSource: "debug-page" }),
        },
        {
            name: "Session State",
            fn: async () => {
                AuthDebugger.logSessionState();
                return session.debug?.();
            },
        },
        {
            name: "Token Info",
            fn: () => AuthDebugger.testTokenInfo(),
        },
        {
            name: "Test Login Flow",
            fn: () => AuthDebugger.testLogin(),
        },
        {
            name: "Auth Me Endpoint",
            fn: () => apiClient.get("/auth/me"),
        },
        {
            name: "Token Refresh",
            fn: () => apiClient.post("/auth/refresh", {}),
        },
        {
            name: "Full Diagnostic",
            fn: async () => {
                await AuthDebugger.runFullDiagnostic();
                return "Check browser console for detailed logs";
            },
        },
    ];

    useEffect(() => {
        addLog("Auth Debug Page loaded");
        addLog(`Environment: ${process.env.NODE_ENV}`);
        addLog(`API URL: ${process.env.NEXT_PUBLIC_API_URL || "Not set"}`);
        addLog(
            `Debug Auth: ${process.env.NEXT_PUBLIC_DEBUG_AUTH || "Not set"}`
        );
    }, []);

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
                                disabled={isLoading}
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
                        <pre className="text-sm">
                            {JSON.stringify(
                                {
                                    NODE_ENV: process.env.NODE_ENV,
                                    API_URL: process.env.NEXT_PUBLIC_API_URL,
                                    DEBUG_AUTH:
                                        process.env.NEXT_PUBLIC_DEBUG_AUTH,
                                    current_url:
                                        typeof window !== "undefined"
                                            ? window.location.href
                                            : "SSR",
                                    user_agent:
                                        typeof window !== "undefined"
                                            ? navigator.userAgent
                                            : "SSR",
                                },
                                null,
                                2
                            )}
                        </pre>
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
    const [email, setEmail] = useState("admin.test@jdc.com");
    const [password, setPassword] = useState("Admin123!");
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        onLog(`Testing login with email: ${email}`);

        try {
            const result = await AuthDebugger.testLogin(email, password);
            onLog(`✅ Login test completed`);
            onLog(`Result: ${JSON.stringify(result, null, 2)}`);
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
                    Default test credentials are pre-filled. This will test the
                    complete login flow:
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
