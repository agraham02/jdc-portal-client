// Lightweight fetch-based API client with JWT attach and auto-refresh
import { session } from "./session";
import { AuthService } from "./services/auth";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
    headers?: Record<string, string>;
    // When true, skips the global 401 refresh+retry flow (used by refresh itself)
    skipAuthRetry?: boolean;
};

class ApiClient {
    private baseUrl: string;
    private deviceFingerprint: string;

    constructor() {
        this.baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        this.deviceFingerprint = this.ensureFingerprint();
    }

    private ensureFingerprint(): string {
        const key = "jdc_device_fingerprint";
        if (typeof window === "undefined") return "server";

        const existing = window.localStorage.getItem(key);
        if (existing) return existing;

        const fp = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        window.localStorage.setItem(key, fp);
        return fp;
    }

    private buildHeaders(extra?: Record<string, string>) {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-device-fingerprint": this.deviceFingerprint,
            ...extra,
        };
        
        const token = session.getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    private async request<T>(
        method: HttpMethod,
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const res = await fetch(url, {
            method,
            headers: this.buildHeaders(options?.headers),
            credentials: "include", // send/receive httpOnly cookies
            body: body != null ? JSON.stringify(body) : undefined,
        });

        if (res.status === 401 && !options?.skipAuthRetry) {
            // Try one refresh then retry the original request
            try {
                const { accessToken } = await AuthService.refreshToken();
                session.setAccessToken(accessToken);
            } catch {
                // Ensure we clear session on hard 401
                session.clear();
                throw new Error("Unauthorized");
            }
            return this.request<T>(method, path, body, {
                ...options,
                skipAuthRetry: true,
            });
        }

        if (!res.ok) {
            let message = `Request failed (${res.status})`;
            try {
                const data = (await res.json()) as {
                    message?: string;
                    error?: string;
                };
                message = data.message || data.error || message;
            } catch {
                // swallow JSON parse error
            }
            throw new Error(message);
        }

        // No content
        if (res.status === 204) return undefined as unknown as T;

        return (await res.json()) as T;
    }

    get<T>(path: string, options?: RequestOptions) {
        return this.request<T>("GET", path, undefined, options);
    }
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>("POST", path, body, options);
    }
    patch<T>(path: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>("PATCH", path, body, options);
    }
    put<T>(path: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>("PUT", path, body, options);
    }
    delete<T>(path: string, options?: RequestOptions) {
        return this.request<T>("DELETE", path, undefined, options);
    }
}

export const apiClient = new ApiClient();
