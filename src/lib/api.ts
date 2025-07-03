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

    const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }));

            if (
                response.status === 401 &&
                !options.headers?.hasOwnProperty("_retry")
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
};
