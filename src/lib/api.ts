import { session } from "./session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let isRefreshing = false;

type FailedQueueItem = {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
};
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const token = session.getAccessToken();

    const defaultHeaders: HeadersInit = {};

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        credentials: "include", // This is crucial for httpOnly cookies
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
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

            if (
                process.env.NODE_ENV !== "production" &&
                process.env.NEXT_PUBLIC_DEBUG_API === "true"
            ) {
                console.log(
                    `API Error: ${endpoint} - ${response.status}`,
                    errorData
                );
            }

            if (
                response.status === 401 &&
                !options.headers?.hasOwnProperty("_retry") &&
                endpoint !== "/auth/refresh" // Prevent infinite refresh loops
            ) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const { accessToken } = await apiClient.post<{
                            accessToken: string;
                        }>("/auth/refresh", {});
                        session.setAccessToken(accessToken);
                        processQueue(null, accessToken);
                        return request(endpoint, {
                            ...options,
                            headers: { ...options.headers, _retry: "true" },
                        });
                    } catch (err) {
                        processQueue(err, null);
                        session.destroy();
                        window.location.href = "/login";
                        return Promise.reject(err);
                    } finally {
                        isRefreshing = false;
                    }
                }

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return request(endpoint, {
                            ...options,
                            headers: { ...options.headers, _retry: "true" },
                        });
                    })
                    .catch((err: unknown) => {
                        return Promise.reject(err);
                    }) as Promise<T>;
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

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: "DELETE" }),

    // FormData-specific methods that don't JSON.stringify the body
    postFormData: <T>(
        endpoint: string,
        formData: FormData,
        options?: RequestInit
    ) => {
        const { headers, ...restOptions } = options || {};
        
        // Create clean headers without Content-Type for FormData
        const cleanHeaders: HeadersInit = {};
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'content-type') {
                    cleanHeaders[key] = value;
                }
            });
        }
        
        return request<T>(endpoint, {
            ...restOptions,
            method: "POST",
            body: formData,
            headers: cleanHeaders,
        });
    },

    patchFormData: <T>(
        endpoint: string,
        formData: FormData,
        options?: RequestInit
    ) => {
        const { headers, ...restOptions } = options || {};
        
        // Create clean headers without Content-Type for FormData
        const cleanHeaders: HeadersInit = {};
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'content-type') {
                    cleanHeaders[key] = value;
                }
            });
        }
        
        return request<T>(endpoint, {
            ...restOptions,
            method: "PATCH",
            body: formData,
            headers: cleanHeaders,
        });
    },
};
