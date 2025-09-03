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
