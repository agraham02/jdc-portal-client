// Core API response types based on the new API documentation

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
}

export interface SuccessResponse {
    message: string;
}

// Query parameters for paginated endpoints
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// Common filtering parameters
export interface BaseFilterParams extends PaginationParams {
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// Standard error field validation
export interface FieldError {
    field: string;
    message: string;
    code?: string;
}

// Enhanced API response types matching new standards
export interface StandardApiResponse<T = unknown> {
    data?: T;
    message?: string;
    errors?: FieldError[];
    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
    };
}

// Health check response
export interface HealthResponse {
    status: "ok" | "error";
    timestamp: string;
    uptime: number;
    checks?: {
        database?: "ok" | "error";
        storage?: "ok" | "error";
        [key: string]: "ok" | "error" | undefined;
    };
}
