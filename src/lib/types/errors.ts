export type FieldError = {
    field: string;
    message: string;
    code?: string;
};

// Standardized client error shape, mapped from server envelope when possible
export type StandardError = {
    // Stable code name (maps from server "error" when available)
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
    fieldErrors?: FieldError[];
    status?: number;
    path?: string;
    method?: string;
};

/**
 * Backend error response shape from API
 * This is the raw error structure returned by the server
 */
export interface BackendErrorResponse {
    error?: string;
    message?: string;
    code?: string;
    requestId?: string;
    details?: Record<string, unknown>;
    fieldErrors?: Array<{
        field: string;
        message: string;
        code?: string;
    }>;
    status?: number;
    statusCode?: number;
    path?: string;
    method?: string;
}

/**
 * Type guard to check if an error is a StandardError
 *
 * @param error - Error object to check
 * @returns True if error is StandardError
 */
export function isStandardError(error: unknown): error is StandardError {
    if (!error || typeof error !== "object") return false;

    const err = error as Record<string, unknown>;

    // Must have code and message
    return typeof err.code === "string" && typeof err.message === "string";
}

/**
 * Type guard to check if an object is a BackendErrorResponse
 *
 * @param obj - Object to check
 * @returns True if object matches BackendErrorResponse shape
 */
export function isBackendError(obj: unknown): obj is BackendErrorResponse {
    if (!obj || typeof obj !== "object") return false;

    const err = obj as Record<string, unknown>;

    // Backend errors always have either 'error' or 'message' field
    return typeof err.error === "string" || typeof err.message === "string";
}

export type ApiRequestEvent = {
    id: string; // client-generated request id
    url: string;
    method: string;
    startedAt: number; // ms epoch
    headers?: Record<string, string>;
};

export type ApiResponseEvent = {
    id: string;
    url: string;
    method: string;
    status: number;
    durationMs: number;
    ok: boolean;
    retry?: { attempt: number; max: number };
};
