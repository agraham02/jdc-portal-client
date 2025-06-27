const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    // You can add logic here to get the token from storage (e.g., localStorage, cookies)
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;

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

    const response = await fetch(url, config);

    if (!response.ok) {
        // You can create a custom error object for better error handling
        const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "An unknown error occurred");
    }

    // Handle cases with no content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body: any, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    patch: <T>(endpoint: string, body: any, options?: RequestInit) =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string, options?: RequestInit) =>
        request<T>(endpoint, { ...options, method: "DELETE" }),
};
