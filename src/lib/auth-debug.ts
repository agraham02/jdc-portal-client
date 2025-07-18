// Debug utilities for authentication troubleshooting
// Only active in development or when explicitly enabled

import { session } from "./session";

const DEBUG_ENABLED =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEBUG_AUTH === "true";

export class AuthDebugger {
    private static logPrefix = "[AUTH DEBUG]";

    static log(message: string, data?: unknown) {
        if (!DEBUG_ENABLED) return;

        const timestamp = new Date().toISOString();
        console.log(`${this.logPrefix} ${timestamp} - ${message}`);
        if (data) {
            console.log(`${this.logPrefix} Data:`, data);
        }
    }

    static error(message: string, error?: unknown) {
        if (!DEBUG_ENABLED) return;

        const timestamp = new Date().toISOString();
        console.error(`${this.logPrefix} ${timestamp} - ERROR: ${message}`);
        if (error) {
            console.error(`${this.logPrefix} Error details:`, error);
        }
    }

    static warn(message: string, data?: unknown) {
        if (!DEBUG_ENABLED) return;

        const timestamp = new Date().toISOString();
        console.warn(`${this.logPrefix} ${timestamp} - WARNING: ${message}`);
        if (data) {
            console.warn(`${this.logPrefix} Data:`, data);
        }
    }

    static async testConnection() {
        if (!DEBUG_ENABLED) return null;

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const response = await fetch(`${baseUrl}/auth/debug/health`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();
            this.log("Backend connection test", {
                status: response.status,
                ok: response.ok,
                data,
                url: baseUrl,
                responseHeaders: Object.fromEntries(response.headers.entries()),
            });

            return { status: response.status, ok: response.ok, data };
        } catch (error) {
            this.error("Backend connection test failed", error);
            return {
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    static async testCloudFrontConfig() {
        if (!DEBUG_ENABLED) return null;

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const response = await fetch(
                `${baseUrl}/auth/debug/cloudfront-test`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Authorization: "Bearer test-token-for-cloudfront-test",
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            this.log("CloudFront configuration test", {
                status: response.status,
                ok: response.ok,
                data,
            });

            return { status: response.status, ok: response.ok, data };
        } catch (error) {
            this.error("CloudFront test failed", error);
            return {
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    static async debugHeaders(additionalData?: Record<string, unknown>) {
        if (!DEBUG_ENABLED) return null;

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

            // Test with Authorization header to see if it gets through
            const token = session.getAccessToken();
            const testHeaders: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
                testHeaders["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${baseUrl}/auth/debug/headers`, {
                method: "POST",
                credentials: "include",
                headers: testHeaders,
                body: JSON.stringify({
                    frontendInfo: {
                        userAgent: navigator.userAgent,
                        currentUrl: window.location.href,
                        origin: window.location.origin,
                        timestamp: new Date().toISOString(),
                        tokenSentFromFrontend: !!token,
                        cookiesEnabled: navigator.cookieEnabled,
                        ...additionalData,
                    },
                }),
            });

            const data = await response.json();

            // Analyze the response for common issues
            const analysis = this.analyzeHeaderResponse(data);

            this.log("Headers debug response", {
                status: response.status,
                ok: response.ok,
                data,
                analysis,
            });

            return { status: response.status, ok: response.ok, data, analysis };
        } catch (error) {
            this.error("Headers debug failed", error);
            return {
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    static analyzeHeaderResponse(debugResponse: unknown) {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Type guard to safely access debugResponse properties
        const response = debugResponse as {
            debugInfo?: {
                requestAnalysis?: {
                    isCloudFront?: boolean;
                    isProxied?: boolean;
                    potentialIssues?: string[];
                };
                headers?: {
                    authorization?: string;
                };
                cookies?: {
                    present?: unknown[];
                };
            };
        };

        if (response?.debugInfo?.requestAnalysis?.isCloudFront) {
            issues.push("Request is being proxied through CloudFront");

            if (!response.debugInfo.headers?.authorization) {
                issues.push("Authorization header not reaching backend");
                recommendations.push(
                    "Configure CloudFront to forward Authorization headers"
                );
            }

            if (response.debugInfo.cookies?.present?.length === 0) {
                issues.push("No cookies reaching backend");
                recommendations.push(
                    "Configure CloudFront to forward Cookie headers"
                );
            }
        }

        if (
            response?.debugInfo?.requestAnalysis?.potentialIssues?.length &&
            response.debugInfo.requestAnalysis.potentialIssues.length > 0
        ) {
            issues.push(...response.debugInfo.requestAnalysis.potentialIssues);
        }

        return {
            issues,
            recommendations,
            isProxied: response?.debugInfo?.requestAnalysis?.isProxied || false,
            isCloudFront:
                response?.debugInfo?.requestAnalysis?.isCloudFront || false,
        };
    }

    static async testTokenInfo() {
        if (!DEBUG_ENABLED) return null;

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

            // Get token from memory-based session manager (not localStorage)
            const token = session.getAccessToken();

            const response = await fetch(`${baseUrl}/auth/debug/token-info`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            const data = await response
                .json()
                .catch(() => ({ error: "Failed to parse response" }));
            this.log("Token info debug response", {
                status: response.status,
                ok: response.ok,
                data,
                tokenFromSession: token ? "Present" : "Not found",
            });

            return {
                status: response.status,
                ok: response.ok,
                data,
                tokenFromSession: token ? "Present" : "Not found",
            };
        } catch (error) {
            this.error("Token info test failed", error);
            return null;
        }
    }

    static logSessionState() {
        if (!DEBUG_ENABLED) return;

        const sessionDebug = session.debug ? session.debug() : null;

        this.log("Current session state", {
            memorySession: sessionDebug || {
                hasToken: session.hasValidToken(),
                tokenExists: session.getAccessToken() ? "Yes" : "No",
            },
            localStorage: {
                keys: Object.keys(localStorage),
                authRelated: Object.keys(localStorage).filter(
                    (key) =>
                        key.toLowerCase().includes("token") ||
                        key.toLowerCase().includes("auth")
                ),
            },
            sessionStorage: {
                keys: Object.keys(sessionStorage),
                authRelated: Object.keys(sessionStorage).filter(
                    (key) =>
                        key.toLowerCase().includes("token") ||
                        key.toLowerCase().includes("auth")
                ),
            },
            cookies: document.cookie,
            currentUrl: window.location.href,
        });
    }

    static async runFullDiagnostic() {
        if (!DEBUG_ENABLED) return;

        this.log("=== STARTING FULL AUTH DIAGNOSTIC ===");

        // Test 1: Session state
        this.logSessionState();

        // Test 2: Backend connection
        await this.testConnection();

        // Test 3: CloudFront configuration (if applicable)
        await this.testCloudFrontConfig();

        // Test 4: Headers debug
        await this.debugHeaders({ diagnostic: true });

        // Test 5: Token info (if available)
        await this.testTokenInfo();

        // Test 6: Login flow
        await this.testLogin();

        this.log("=== FULL AUTH DIAGNOSTIC COMPLETE ===");
        this.log("Review the logs above for issues and recommendations");
    }

    static async testLogin(email?: string, password?: string) {
        if (!DEBUG_ENABLED) return null;

        // Only use test credentials in development, require them in production
        if (!email || !password) {
            if (process.env.NODE_ENV === "development") {
                email = email || "admin.test@jdc.com";
                password = password || "Admin123!";
            } else {
                throw new Error(
                    "Email and password are required in production mode"
                );
            }
        }

        const testEmail = email;
        const testPassword = password;

        this.log("Testing login flow", {
            email: testEmail,
            isProduction: process.env.NODE_ENV === "production",
        });

        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

            const response = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword,
                }),
            });

            const data = await response
                .json()
                .catch(() => ({ error: "Failed to parse response" }));

            if (response.ok && data.accessToken) {
                this.log("Login successful, setting token in session");
                session.setAccessToken(data.accessToken);

                // Test the /auth/me endpoint immediately after login
                this.log("Testing /auth/me endpoint with new token");
                const meResponse = await fetch(`${baseUrl}/auth/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${data.accessToken}`,
                    },
                });

                const meData = await meResponse
                    .json()
                    .catch(() => ({ error: "Failed to parse me response" }));

                this.log("Login test complete", {
                    loginStatus: response.status,
                    loginOk: response.ok,
                    tokenReceived: !!data.accessToken,
                    meStatus: meResponse.status,
                    meOk: meResponse.ok,
                    userData: meData,
                });

                return {
                    loginStatus: response.status,
                    loginOk: response.ok,
                    loginData: data,
                    tokenReceived: !!data.accessToken,
                    meStatus: meResponse.status,
                    meOk: meResponse.ok,
                    meData,
                };
            } else {
                this.error("Login failed", {
                    status: response.status,
                    data,
                });
                return {
                    loginStatus: response.status,
                    loginOk: response.ok,
                    loginData: data,
                    tokenReceived: false,
                };
            }
        } catch (error) {
            this.error("Login test failed with exception", error);
            return {
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}

// Global window access for easy debugging in production
if (typeof window !== "undefined" && DEBUG_ENABLED) {
    (window as unknown as Record<string, unknown>).authDebug = AuthDebugger;
}
