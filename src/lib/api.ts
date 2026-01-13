// Lightweight fetch-based API client with JWT attach and auto-refresh
import { session } from "./session";
import { AuthService } from "./services/auth";
import { emitApiError } from "./api-events";
import type { StandardError } from "./types/errors";
import { isBackendError } from "./types/errors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
    headers?: Record<string, string>;
    // When true, skips the global 401 refresh+retry flow (used by refresh itself)
    skipAuthRetry?: boolean;
    // Optional controller to cancel requests
    signal?: AbortSignal;
    // Optional timeout override (ms) for this request
    timeoutMs?: number;
};

class ApiClient {
    private baseUrl: string;
    private deviceFingerprint: string;
    private readonly defaultTimeoutMs: number;
    // Paths where 401 errors are expected and should not be logged
    private readonly quietAuthPaths = ["/auth/me", "/users/permissions"];

    constructor() {
        // Trust the .env file to provide the correct API URL
        // If it's incorrect, the user must update their .env file
        const rawBase =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        // Remove trailing slashes for consistency
        this.baseUrl = rawBase.replace(/\/+$/, "");

        // Log the base URL in development for debugging
        if (process.env.NODE_ENV === "development") {
            console.log("[ApiClient] Base URL:", this.baseUrl);
        }

        this.deviceFingerprint = this.ensureFingerprint();
        this.defaultTimeoutMs = Number(
            process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 20000
        );
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

    /**
     * Check if an error is expected and should not be logged
     */
    private isExpectedError(error: StandardError, path: string): boolean {
        // Don't log 401s for auth-checking endpoints
        if (error.status === 401) {
            return this.quietAuthPaths.some((p) => path.includes(p));
        }
        return false;
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

        // Use type guard for safer error parsing
        const backendError = isBackendError(body) ? body : undefined;

        // Extract error code from backend or derive from HTTP status
        const code =
            backendError?.error ||
            backendError?.code ||
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

        // Extract message from backend response or use default
        const message =
            backendError?.message ||
            (backendError && Array.isArray(backendError.message)
                ? (backendError.message as unknown[]).join(", ")
                : undefined) ||
            `${code} (${status})`;

        // Extract request ID from headers or response body
        const requestId =
            res.headers.get("x-request-id") ||
            backendError?.requestId ||
            undefined;

        // Merge server-provided details with response headers (e.g., 429 retry-after)
        const serverDetails = backendError?.details;
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

        // Extract field errors if present
        const fieldErrors = backendError?.fieldErrors;

        // Extract path and method from response or use fallbacks
        const path = backendError?.path || fallbackPath;
        const methodFromBody = backendError?.method || method;

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

        // Provide a timeout via AbortController
        const ac = new AbortController();
        const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
        let timer: NodeJS.Timeout | null = setTimeout(
            () => ac.abort(),
            timeoutMs
        );

        let res: Response;
        try {
            res = await fetch(url, {
                method,
                headers,
                credentials: "include",
                body:
                    body instanceof FormData
                        ? body
                        : body != null
                        ? JSON.stringify(body)
                        : undefined,
                signal: options?.signal ?? ac.signal,
            });
        } catch (e) {
            // On network error or abort, attempt a single retry for idempotent methods
            if (method === "GET") {
                try {
                    res = await fetch(url, {
                        method,
                        headers,
                        credentials: "include",
                        signal: options?.signal ?? ac.signal,
                    });
                } catch (e2) {
                    if (timer) clearTimeout(timer);
                    timer = null;
                    const stdErr: StandardError = {
                        code: "NetworkError",
                        message: (e2 as Error)?.message || "Network error",
                        path,
                        method,
                    };
                    emitApiError({ ...stdErr, status: 0 });
                    const err = new Error(stdErr.message);
                    throw Object.assign(err, stdErr);
                }
            } else {
                if (timer) clearTimeout(timer);
                timer = null;
                const stdErr: StandardError = {
                    code:
                        (e as Error)?.name === "AbortError"
                            ? "Timeout"
                            : "NetworkError",
                    message:
                        (e as Error)?.message ||
                        ((e as Error)?.name === "AbortError"
                            ? "Request timed out"
                            : "Network error"),
                    path,
                    method,
                };
                emitApiError({ ...stdErr, status: 0 });
                const err = new Error(stdErr.message);
                throw Object.assign(err, stdErr);
            }
        } finally {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }

        if (res.status === 401 && !options?.skipAuthRetry) {
            // Try one refresh then retry the original request
            try {
                const { accessToken } = await AuthService.refreshToken();
                session.setAccessToken(accessToken);
            } catch (refreshError) {
                // Log the refresh error for debugging
                console.error(
                    "[ApiClient] Token refresh failed:",
                    refreshError
                );

                // Ensure we clear session on hard 401
                session.clear();
                const stdErr: StandardError = {
                    code: "Unauthorized",
                    message: "Session expired. Please log in again.",
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

        // Respect server rate-limit backoff once if provided
        if (res.status === 429 && !options?.skipAuthRetry) {
            const retryAfterHeader = res.headers.get("retry-after");
            const waitMs = retryAfterHeader
                ? Number(retryAfterHeader) * 1000
                : 0;
            if (waitMs > 0 && waitMs <= 10000) {
                await new Promise((r) => setTimeout(r, waitMs));
                return this.request<T>(method, path, body, {
                    ...options,
                    skipAuthRetry: true,
                });
            }
        }

        if (!res.ok) {
            const std = await this.parseStandardError(res, path, method);
            const err = new Error(std.message);
            Object.assign(err as unknown as object, std);

            // Only emit API error event if NOT an expected error
            if (!this.isExpectedError(std, path)) {
                emitApiError({ ...std, status: std.status ?? res.status });
            }

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

    /**
     * Upload FormData with real progress tracking using XMLHttpRequest
     * @param path - API endpoint path
     * @param formData - FormData to upload
     * @param onProgress - Callback for upload progress (0-100)
     * @param options - Request options
     */
    postFormDataWithProgress<T>(
        path: string,
        formData: FormData,
        onProgress?: (percent: number) => void,
        options?: RequestOptions
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${path}`;
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = (e.loaded / e.total) * 100;
                    onProgress(percent);
                }
            });

            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText) as T;
                        resolve(data);
                    } catch {
                        reject(new Error("Invalid response from server"));
                    }
                } else if (xhr.status === 401 && !options?.skipAuthRetry) {
                    // Handle 401 - attempt token refresh
                    AuthService.refreshToken()
                        .then(({ accessToken }) => {
                            session.setAccessToken(accessToken);
                            // Retry with new token
                            this.postFormDataWithProgress<T>(
                                path,
                                formData,
                                onProgress,
                                { ...options, skipAuthRetry: true }
                            )
                                .then(resolve)
                                .catch(reject);
                        })
                        .catch(() => {
                            session.clear();
                            reject(
                                new Error(
                                    "Session expired. Please log in again."
                                )
                            );
                        });
                } else {
                    // Parse error response
                    try {
                        const errorBody = JSON.parse(xhr.responseText);
                        const message =
                            errorBody?.message ||
                            `Upload failed: ${xhr.status}`;
                        reject(new Error(message));
                    } catch {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                }
            });

            xhr.addEventListener("error", () => {
                reject(new Error("Network error during upload"));
            });

            xhr.addEventListener("abort", () => {
                reject(new Error("Upload cancelled"));
            });

            xhr.open("POST", url);
            xhr.withCredentials = true;
            xhr.setRequestHeader(
                "x-device-fingerprint",
                this.deviceFingerprint
            );

            const token = session.getAccessToken();
            if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }

            xhr.send(formData);
        });
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

    // Binary download helper (Blob)
    async getBlob(path: string, options?: RequestOptions): Promise<Blob> {
        const url = `${this.baseUrl}${path}`;
        const headers = this.buildHeaders({ ...(options?.headers || {}) });

        const ac = new AbortController();
        const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
        const timer = setTimeout(() => ac.abort(), timeoutMs);
        let res: Response;
        try {
            res = await fetch(url, {
                method: "GET",
                headers,
                credentials: "include",
                signal: options?.signal ?? ac.signal,
            });
        } catch (e) {
            clearTimeout(timer);
            const stdErr: StandardError = {
                code:
                    (e as Error)?.name === "AbortError"
                        ? "Timeout"
                        : "NetworkError",
                message:
                    (e as Error)?.message ||
                    ((e as Error)?.name === "AbortError"
                        ? "Request timed out"
                        : "Network error"),
                path,
                method: "GET",
            };
            emitApiError({ ...stdErr, status: 0 });
            const err = new Error(stdErr.message);
            throw Object.assign(err, stdErr);
        } finally {
            clearTimeout(timer);
        }

        if (res.status === 401 && !options?.skipAuthRetry) {
            try {
                const { accessToken } = await AuthService.refreshToken();
                session.setAccessToken(accessToken);
            } catch {
                session.clear();
                const stdErr: StandardError = {
                    code: "Unauthorized",
                    message: "Unauthorized",
                    status: 401,
                    path,
                    method: "GET",
                };
                emitApiError({ ...stdErr, status: 401 });
                const error = new Error(stdErr.message);
                throw Object.assign(error, stdErr);
            }
            return this.getBlob(path, { ...options, skipAuthRetry: true });
        }

        if (res.status === 429 && !options?.skipAuthRetry) {
            const retryAfterHeader = res.headers.get("retry-after");
            const waitMs = retryAfterHeader
                ? Number(retryAfterHeader) * 1000
                : 0;
            if (waitMs > 0 && waitMs <= 10000) {
                await new Promise((r) => setTimeout(r, waitMs));
                return this.getBlob(path, { ...options, skipAuthRetry: true });
            }
        }

        if (!res.ok) {
            const std = await this.parseStandardError(res, path, "GET");
            const err = new Error(std.message);
            Object.assign(err as unknown as object, std);

            // Only emit API error event if NOT an expected error
            if (!this.isExpectedError(std, path)) {
                emitApiError({ ...std, status: std.status ?? res.status });
            }

            throw err;
        }
        return res.blob();
    }
}

export const apiClient = new ApiClient();
