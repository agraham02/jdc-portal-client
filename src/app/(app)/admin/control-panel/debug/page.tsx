"use client";

import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { session } from "@/lib/session";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName } from "@/lib/constants/permission-names";
import {
    Bug,
    Play,
    Trash2,
    Copy,
    Check,
    Terminal,
    Zap,
    Network,
    Key,
    User,
    RefreshCw,
    ChevronRight,
    Filter,
    Download,
    X,
    AlertCircle,
    CheckCircle2,
    Info,
} from "lucide-react";

interface LogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: "info" | "success" | "error" | "warning";
}

function DebugConsolePage() {
    const { isLoading } = useAuth();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tests");
    const [logFilter, setLogFilter] = useState<
        "all" | "success" | "error" | "info"
    >("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [copied, setCopied] = useState(false);

    const addLog = (message: string, type: LogEntry["type"] = "info") => {
        setLogs((prev) => [
            {
                id: Date.now().toString(),
                timestamp: new Date(),
                message,
                type,
            },
            ...prev,
        ]);
    };

    const clearLogs = () => setLogs([]);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (logFilter !== "all" && log.type !== logFilter) return false;
            if (
                searchQuery &&
                !log.message.toLowerCase().includes(searchQuery.toLowerCase())
            )
                return false;
            return true;
        });
    }, [logs, logFilter, searchQuery]);

    const runTest = async (
        testName: string,
        testFn: () => Promise<unknown>
    ) => {
        setIsTestLoading(true);
        addLog(`Starting test: ${testName}`, "info");
        try {
            const result = await testFn();
            addLog(`✅ ${testName} completed successfully`, "success");
            if (result) {
                addLog(`Result: ${JSON.stringify(result, null, 2)}`, "info");
            }
        } catch (error) {
            addLog(
                `❌ ${testName} failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                "error"
            );
        } finally {
            setIsTestLoading(false);
        }
    };

    const copyLogs = () => {
        const logText = logs
            .map((l) => `[${l.timestamp.toLocaleTimeString()}] ${l.message}`)
            .join("\n");
        navigator.clipboard.writeText(logText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addLog("Logs copied to clipboard", "success");
    };

    const downloadLogs = () => {
        const logText = logs
            .map(
                (l) =>
                    `[${l.timestamp.toISOString()}] [${l.type.toUpperCase()}] ${
                        l.message
                    }`
            )
            .join("\n");
        const blob = new Blob([logText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `debug-logs-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        addLog("Logs downloaded", "success");
    };

    const tests = [
        {
            name: "Backend Connectivity",
            icon: Network,
            description: "Test connection to backend via /auth/refresh",
            fn: () => AuthService.refreshToken(),
        },
        {
            name: "Session State",
            icon: Key,
            description: "Check if access token exists in session",
            fn: async () => {
                const token = session.getAccessToken();
                return {
                    hasToken: !!token,
                    tokenLength: token?.length || 0,
                };
            },
        },
        {
            name: "Token Decode",
            icon: Key,
            description: "Decode and inspect JWT payload",
            fn: async () => {
                const token = session.getAccessToken();
                if (!token) throw new Error("No access token in session");
                const [, payload] = token.split(".");
                const json = JSON.parse(
                    atob(payload.replaceAll("-", "+").replaceAll("_", "/"))
                );
                return json;
            },
        },
        {
            name: "Auth Profile",
            icon: User,
            description: "Fetch current user via /auth/me",
            fn: () => apiClient.get("/auth/me"),
        },
        {
            name: "Token Refresh",
            icon: RefreshCw,
            description: "Attempt to refresh the access token",
            fn: () => AuthService.refreshToken(),
        },
        {
            name: "Full Diagnostic",
            icon: Zap,
            description: "Run complete auth system check",
            fn: async () => {
                const out: Record<string, unknown> = {};
                try {
                    out.refresh = await AuthService.refreshToken();
                } catch (e) {
                    out.refreshError =
                        e instanceof Error ? e.message : String(e);
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
        addLog("Auth Debug Console loaded", "info");
        addLog(`Environment: ${process.env.NODE_ENV}`, "info");

        const hasToken = !!session.getAccessToken();
        if (hasToken) {
            addLog(
                `API URL: ${process.env.NEXT_PUBLIC_API_URL || "Not set"}`,
                "info"
            );
        } else {
            addLog("Not authenticated - some debug info hidden", "warning");
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Bug className="h-8 w-8 text-primary" />
                        Debug Console
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Authentication diagnostics and API testing
                    </p>
                </div>
                <Badge variant="outline" className="gap-1">
                    <Terminal className="h-3 w-3" />
                    {logs.length} log entries
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
                    <TabsTrigger
                        value="tests"
                        className="flex items-center gap-2"
                    >
                        <Play className="h-4 w-4" />
                        Quick Tests
                    </TabsTrigger>
                    <TabsTrigger
                        value="api"
                        className="flex items-center gap-2"
                    >
                        <Network className="h-4 w-4" />
                        API Tester
                    </TabsTrigger>
                    <TabsTrigger
                        value="logs"
                        className="flex items-center gap-2"
                    >
                        <Terminal className="h-4 w-4" />
                        Logs
                        {logs.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-1 h-5 min-w-[20px] p-0 justify-center"
                            >
                                {logs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Quick Tests Tab */}
                <TabsContent value="tests" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tests.map((test) => (
                            <Card key={test.name} className="relative">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <test.icon className="h-5 w-5 text-primary" />
                                        {test.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {test.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() =>
                                            runTest(test.name, test.fn)
                                        }
                                        disabled={isTestLoading}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        {isTestLoading ? (
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4 mr-2" />
                                        )}
                                        Run Test
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Environment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Environment Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EnvironmentInfo />
                        </CardContent>
                    </Card>

                    {/* Login Test */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Login Test
                            </CardTitle>
                            <CardDescription>
                                Test the complete login flow with credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginTest onLog={addLog} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Tester Tab */}
                <TabsContent value="api" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" />
                                Manual API Test
                            </CardTitle>
                            <CardDescription>
                                Send custom API requests for testing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ManualApiTest onLog={addLog} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Logs Tab */}
                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    Debug Logs
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyLogs}
                                        disabled={logs.length === 0}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Copy className="h-4 w-4 mr-1" />
                                        )}
                                        Copy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadLogs}
                                        disabled={logs.length === 0}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearLogs}
                                        disabled={logs.length === 0}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <Select
                                    value={logFilter}
                                    onValueChange={(v) =>
                                        setLogFilter(v as typeof logFilter)
                                    }
                                >
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Logs
                                        </SelectItem>
                                        <SelectItem value="success">
                                            Success
                                        </SelectItem>
                                        <SelectItem value="error">
                                            Errors
                                        </SelectItem>
                                        <SelectItem value="info">
                                            Info
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Log Display */}
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-[400px] overflow-y-auto font-mono text-sm">
                                {filteredLogs.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">
                                        {logs.length === 0
                                            ? "No logs yet. Run a test to see output."
                                            : "No logs match your filter."}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredLogs.map((log) => {
                                            const bgClass = {
                                                error: "bg-red-900/30",
                                                success: "bg-green-900/30",
                                                warning: "bg-yellow-900/30",
                                                info: "",
                                            }[log.type];

                                            const textClass = {
                                                error: "text-red-400",
                                                success: "text-green-400",
                                                warning: "text-yellow-400",
                                                info: "text-gray-300",
                                            }[log.type];

                                            return (
                                                <div
                                                    key={log.id}
                                                    className={`flex items-start gap-2 py-1 px-2 rounded ${bgClass}`}
                                                >
                                                    <span className="text-gray-500 flex-shrink-0">
                                                        [
                                                        {log.timestamp.toLocaleTimeString()}
                                                        ]
                                                    </span>
                                                    {log.type === "success" && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    {log.type === "error" && (
                                                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    {log.type === "warning" && (
                                                        <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    {log.type === "info" && (
                                                        <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <span
                                                        className={`whitespace-pre-wrap break-all ${textClass}`}
                                                    >
                                                        {log.message}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Component to handle client-side only environment info to prevent hydration mismatch
function EnvironmentInfo() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const envInfo = [
        { label: "Environment", value: process.env.NODE_ENV },
        {
            label: "API URL",
            value:
                process.env.NODE_ENV === "development"
                    ? process.env.NEXT_PUBLIC_API_URL || "Not set"
                    : "[Hidden in production]",
        },
        {
            label: "Debug Auth",
            value: process.env.NEXT_PUBLIC_DEBUG_AUTH || "false",
        },
        {
            label: "Current URL",
            value:
                mounted && globalThis.window !== undefined
                    ? globalThis.window.location.href
                    : "Loading...",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {envInfo.map((item) => (
                <div key={item.label} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                        {item.label}
                    </span>
                    <span className="font-mono text-sm truncate">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

type LogFn = (
    message: string,
    type?: "info" | "success" | "error" | "warning"
) => void;

function ManualApiTest({ onLog }: Readonly<{ onLog: LogFn }>) {
    const [endpoint, setEndpoint] = useState("/auth/me");
    const [method, setMethod] = useState("GET");
    const [body, setBody] = useState("{}");
    const [loading, setLoading] = useState(false);

    const runManualTest = async () => {
        setLoading(true);
        onLog(`Manual test: ${method} ${endpoint}`, "info");

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

            onLog(`✅ Manual test successful`, "success");
            onLog(`Response: ${JSON.stringify(result, null, 2)}`, "info");
        } catch (error) {
            onLog(
                `❌ Manual test failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const commonEndpoints = [
        "/auth/me",
        "/auth/refresh",
        "/users",
        "/employees",
        "/vendors",
        "/contracts",
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="md:col-span-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                </Select>

                <div className="md:col-span-8 relative">
                    <Input
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="/auth/me"
                    />
                </div>

                <Button
                    onClick={runManualTest}
                    disabled={loading}
                    className="md:col-span-2"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Play className="h-4 w-4 mr-2" />
                    )}
                    Run
                </Button>
            </div>

            {/* Quick Endpoints */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Quick:</span>
                {commonEndpoints.map((ep) => (
                    <Badge
                        key={ep}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setEndpoint(ep)}
                    >
                        {ep}
                    </Badge>
                ))}
            </div>

            {method !== "GET" && (
                <div className="space-y-2">
                    <label
                        htmlFor="request-body"
                        className="text-sm text-muted-foreground"
                    >
                        Request Body (JSON)
                    </label>
                    <textarea
                        id="request-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full px-3 py-2 border rounded-lg h-24 font-mono text-sm bg-background"
                    />
                </div>
            )}
        </div>
    );
}

function LoginTest({ onLog }: Readonly<{ onLog: LogFn }>) {
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
        onLog(`Testing login with email: ${email}`, "info");

        try {
            const result = await AuthService.login({ email, password });
            onLog(`✅ Login successful`, "success");
            onLog(`User: ${JSON.stringify(result.user, null, 2)}`, "info");
            try {
                const me = await AuthService.getProfile();
                onLog(
                    `/auth/me verified: ${JSON.stringify(me, null, 2)}`,
                    "success"
                );
            } catch (e) {
                onLog(
                    `⚠️ /auth/me failed after login: ${
                        e instanceof Error ? e.message : String(e)
                    }`,
                    "warning"
                );
            }
        } catch (error) {
            onLog(
                `❌ Login test failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="md:col-span-5"
                />

                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="md:col-span-5"
                />

                <Button
                    onClick={testLogin}
                    disabled={loading}
                    className="md:col-span-2"
                >
                    {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Play className="h-4 w-4 mr-2" />
                    )}
                    Test
                </Button>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">
                    {process.env.NODE_ENV === "development"
                        ? "Default test credentials are pre-filled."
                        : "Enter credentials to test the login flow."}
                </p>
                <p className="text-xs">
                    Tests: POST /auth/login → Token storage → Cookie setting →
                    GET /auth/me
                </p>
            </div>
        </div>
    );
}

export default function ProtectedDebugConsolePage() {
    return (
        <ProtectedRoute requiredPermissions={[PermissionName.ADMIN_DEBUG]}>
            <DebugConsolePage />
        </ProtectedRoute>
    );
}
