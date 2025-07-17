import { session } from "./session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

type QueuedRequest<T = unknown> = {
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
    request: () => Promise<T>;
};

let requestQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: unknown = null) => {
    requestQueue.forEach((queued) => {
        if (error) {
            queued.reject(error);
        } else {
            // Retry the original request
            queued.request().then(queued.resolve).catch(queued.reject);
        }
    });
    requestQueue = [];
};

/**
 * Refresh access token using httpOnly cookie
 */
const refreshAccessToken = async (): Promise<string> => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;

    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Essential for httpOnly cookies
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error("Token refresh failed");
            }

            const data = await response.json();
            const newToken = data.accessToken;

            if (!newToken) {
                throw new Error("No access token received");
            }

            session.setAccessToken(newToken);
            return newToken;
        })
        .catch((error) => {
            // Clear session on refresh failure
            session.destroy();

            // Redirect to login page
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }

            throw error;
        })
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
};

/**
 * Create device fingerprint for enhanced security
 */
const createDeviceFingerprint = (): string => {
    if (typeof window === "undefined") return "";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillText("Device fingerprint", 2, 2);
    }

    const fingerprint = btoa(
        [
            navigator.userAgent,
            navigator.language,
            screen.width + "x" + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
        ].join("|")
    ).slice(0, 32);

    return fingerprint;
};

/**
 * Enhanced request function with automatic token refresh
 */
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const token = session.getAccessToken();

    const defaultHeaders: HeadersInit = {
        "X-Device-Fingerprint": createDeviceFingerprint(),
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        credentials: "include", // Essential for httpOnly cookies
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // Debug logging in development
        if (
            process.env.NODE_ENV !== "production" &&
            process.env.NEXT_PUBLIC_DEBUG_API === "true"
        ) {
            console.log(
                `API Request: ${endpoint} - Status: ${response.status}`
            );
        }

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }));

            // Handle 401 Unauthorized - Token expired
            if (response.status === 401 && endpoint !== "/auth/refresh") {
                // If already refreshing, queue this request
                if (isRefreshing) {
                    return new Promise<T>((resolve, reject) => {
                        requestQueue.push({
                            resolve: resolve as (value: unknown) => void,
                            reject,
                            request: () => request<T>(endpoint, options),
                        });
                    });
                }

                // Attempt token refresh
                try {
                    await refreshAccessToken();

                    // Process queued requests
                    processQueue();

                    // Retry original request with new token
                    return request<T>(endpoint, options);
                } catch (refreshError) {
                    // Process queue with error
                    processQueue(refreshError);
                    throw new Error(
                        "Authentication failed - please log in again"
                    );
                }
            }

            throw new Error(errorData.message || "An unknown error occurred");
        }

        // Handle cases with no content
        if (response.status === 204) {
            return null as T;
        }

        return await response.json();
    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * Enhanced API client with proper error handling and token management
 */
export const apiClient = {
    /**
     * GET request
     */
    get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
        request<T>(endpoint, { ...options, method: "GET" }),

    /**
     * POST request
     */
    post: <T>(
        endpoint: string,
        data?: unknown,
        options?: RequestInit
    ): Promise<T> => {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return request<T>(endpoint, { ...options, method: "POST", body });
    },

    /**
     * PUT request
     */
    put: <T>(
        endpoint: string,
        data?: unknown,
        options?: RequestInit
    ): Promise<T> => {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return request<T>(endpoint, { ...options, method: "PUT", body });
    },

    /**
     * PATCH request
     */
    patch: <T>(
        endpoint: string,
        data?: unknown,
        options?: RequestInit
    ): Promise<T> => {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return request<T>(endpoint, { ...options, method: "PATCH", body });
    },

    /**
     * DELETE request
     */
    delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
        request<T>(endpoint, { ...options, method: "DELETE" }),

    /**
     * File upload with proper FormData handling
     */
    upload: <T>(
        endpoint: string,
        formData: FormData,
        options?: RequestInit
    ): Promise<T> =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: formData,
        }),

    /**
     * FormData POST method for backward compatibility
     */
    postFormData: <T>(
        endpoint: string,
        formData: FormData,
        options?: RequestInit
    ): Promise<T> =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: formData,
        }),

    /**
     * FormData PATCH method for backward compatibility
     */
    patchFormData: <T>(
        endpoint: string,
        formData: FormData,
        options?: RequestInit
    ): Promise<T> =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: formData,
        }),

    /**
     * Download file with proper response handling
     */
    download: async (
        endpoint: string,
        filename?: string,
        options?: RequestInit
    ): Promise<void> => {
        const token = session.getAccessToken();
        const headers: HeadersInit = {
            "X-Device-Fingerprint": createDeviceFingerprint(),
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                ...headers,
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },
};

// Export default for convenience
export default apiClient;

// Legacy exports for backward compatibility
export { request };
export const api = apiClient;
