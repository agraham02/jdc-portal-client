// Lightweight fetch-based API client with JWT attach and auto-refresh
import { session } from "./session";
import { AuthService } from "./services/auth";
import { emitApiError } from "./api-events";
import type { StandardError } from "./types/errors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
    headers?: Record<string, string>;
    // When true, skips the global 401 refresh+retry flow (used by refresh itself)
    skipAuthRetry?: boolean;
    // Optional controller to cancel requests
    signal?: AbortSignal;
};

class ApiClient {
    private baseUrl: string;
    private deviceFingerprint: string;

    constructor() {
        this.baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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
            "x-device-fingerprint": this.deviceFingerprint,
            ...extra,
        };

        const token = session.getAccessToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        if (extra?.["Content-Type"] == null) {
            // Allow callers to override; default to JSON
            headers["Content-Type"] = "application/json";
        }
        return headers;
    }

    private parseStandardError = async (
        res: Response,
        fallbackPath: string,
        method: string
    ): Promise<StandardError> => {
        let body: unknown = null;
        try {
            body = await res.clone().json();
        } catch {}
        const status = res.status;
        const b =
            body && typeof body === "object"
                ? (body as Record<string, unknown>)
                : undefined;
        const code =
            (b && typeof b["error"] === "string" && (b["error"] as string)) ||
            (status === 401
                ? "Unauthorized"
                : status === 403
                ? "Forbidden"
                : status === 404
                ? "NotFound"
                : status === 409
                ? "Conflict"
                : status === 429
                ? "TooManyRequests"
                : status >= 500
                ? "ServerError"
                : "HttpError");
        const message =
            (b &&
                typeof b["message"] === "string" &&
                (b["message"] as string)) ||
            (b && Array.isArray(b["message"])
                ? (b["message"] as unknown[]).join(", ")
                : undefined) ||
            `${code} (${status})`;
        const requestId =
            (res.headers.get("x-request-id") ||
                (b && (b["requestId"] as string))) ??
            undefined;
        // Merge server-provided details with selected response headers for better UX (e.g., 429 retry-after)
        const serverDetails =
            b && (b["details"] as Record<string, unknown> | undefined);
        const retryAfterHeader = res.headers.get("retry-after");
        const retryAfterSeconds = retryAfterHeader
            ? Number(retryAfterHeader)
            : undefined;
        const details: Record<string, unknown> | undefined = {
            ...(serverDetails || {}),
            ...(retryAfterSeconds && !Number.isNaN(retryAfterSeconds)
                ? { retryAfterSeconds }
                : {}),
        };
        const fieldErrorsRaw = b?.["fieldErrors"] as unknown;
        const fieldErrors = Array.isArray(fieldErrorsRaw)
            ? (fieldErrorsRaw as {
                  field: string;
                  message: string;
                  code?: string;
              }[])
            : undefined;
        const path = (b?.["path"] as string) || fallbackPath;
        const methodFromBody = (b?.["method"] as string) || method;
        return {
            code,
            message,
            requestId,
            details,
            fieldErrors,
            status,
            path,
            method: methodFromBody,
        };
    };

    private async request<T>(
        method: HttpMethod,
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers = this.buildHeaders({
            ...(options?.headers || {}),
        });

        // If sending FormData, let the browser set the multipart boundary
        if (body instanceof FormData && headers["Content-Type"]) {
            delete headers["Content-Type"];
        }

        const res = await fetch(url, {
            method,
            headers,
            credentials: "include",
            body:
                body instanceof FormData
                    ? body
                    : body != null
                    ? JSON.stringify(body)
                    : undefined,
            signal: options?.signal,
        });

        if (res.status === 401 && !options?.skipAuthRetry) {
            // Try one refresh then retry the original request
            try {
                const { accessToken } = await AuthService.refreshToken();
                session.setAccessToken(accessToken);
            } catch {
                // Ensure we clear session on hard 401
                session.clear();
                const stdErr: StandardError = {
                    code: "Unauthorized",
                    message: "Unauthorized",
                    status: 401,
                    path,
                };
                emitApiError({ ...stdErr, status: stdErr.status ?? 401 });
                const error = new Error(stdErr.message);
                throw Object.assign(error, stdErr);
            }
            return this.request<T>(method, path, body, {
                ...options,
                skipAuthRetry: true,
            });
        }

        if (!res.ok) {
            const std = await this.parseStandardError(res, path, method);
            const err = new Error(std.message);
            Object.assign(err as unknown as object, std);
            emitApiError({ ...std, status: std.status ?? res.status });
            throw err;
        }

        // No content
        if (res.status === 204) {
            return undefined as unknown as T;
        }
        const data = (await res.json()) as T;
        return data;
    }

    get<T>(path: string, options?: RequestOptions) {
        return this.request<T>("GET", path, undefined, options);
    }
    post<T>(path: string, body?: unknown, options?: RequestOptions) {
        return this.request<T>("POST", path, body, options);
    }
    postFormData<T>(
        path: string,
        formData: FormData,
        options?: RequestOptions
    ) {
        const headers = { ...(options?.headers || {}) };
        // Let browser set multipart boundary
        delete headers["Content-Type"];
        return this.request<T>("POST", path, formData, { ...options, headers });
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
