import { StandardError } from "../types/errors";

/**
 * Common API error codes that can be handled gracefully
 */
export const ERROR_CODES = {
    // Authentication & Authorization
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    INVALID_CREDENTIALS: "InvalidCredentials",
    TOKEN_EXPIRED: "TokenExpired",
    ACCOUNT_PENDING: "AccountPending",
    ACCOUNT_REJECTED: "AccountRejected",
    ACCOUNT_DEACTIVATED: "AccountDeactivated",

    // Validation
    VALIDATION_ERROR: "ValidationError",
    INVALID_REQUEST: "InvalidRequest",
    MISSING_FIELD: "MissingField",
    INVALID_FORMAT: "InvalidFormat",

    // Resource Management
    NOT_FOUND: "NotFound",
    CONFLICT: "Conflict",
    DUPLICATE_RESOURCE: "DuplicateResource",
    RESOURCE_EXISTS: "ResourceExists",
    DEPENDENCY_CONFLICT: "DependencyConflict",

    // File Operations
    FILE_TOO_LARGE: "FileTooLarge",
    INVALID_FILE_TYPE: "InvalidFileType",
    FILE_UPLOAD_FAILED: "FileUploadFailed",
    VIRUS_DETECTED: "VirusDetected",

    // Rate Limiting
    TOO_MANY_REQUESTS: "TooManyRequests",
    RATE_LIMITED: "RateLimited",

    // Server Errors
    SERVER_ERROR: "ServerError",
    SERVICE_UNAVAILABLE: "ServiceUnavailable",
    DATABASE_ERROR: "DatabaseError",

    // Network
    NETWORK_ERROR: "NetworkError",
    TIMEOUT: "Timeout",
    CONNECTION_REFUSED: "ConnectionRefused",

    // Business Logic
    PERMISSION_DENIED: "PermissionDenied",
    INSUFFICIENT_PERMISSIONS: "InsufficientPermissions",
    OPERATION_NOT_ALLOWED: "OperationNotAllowed",
    DEADLINE_PASSED: "DeadlinePassed",
    CONTRACT_CLOSED: "ContractClosed",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Enhanced error class for API errors
 */
export class ApiError extends Error {
    public readonly code: string;
    public readonly status?: number;
    public readonly requestId?: string;
    public readonly details?: Record<string, unknown>;
    public readonly fieldErrors?: Array<{
        field: string;
        message: string;
        code?: string;
    }>;

    constructor(error: StandardError) {
        super(error.message);
        this.name = "ApiError";
        this.code = error.code;
        this.status = error.status;
        this.requestId = error.requestId;
        this.details = error.details;
        this.fieldErrors = error.fieldErrors;
    }

    /**
     * Check if error is of a specific type
     */
    is(code: ErrorCode): boolean {
        return this.code === code;
    }

    /**
     * Check if error is retryable
     */
    isRetryable(): boolean {
        return (
            this.code === ERROR_CODES.TOO_MANY_REQUESTS ||
            this.code === ERROR_CODES.RATE_LIMITED ||
            this.code === ERROR_CODES.SERVICE_UNAVAILABLE ||
            this.code === ERROR_CODES.TIMEOUT ||
            this.code === ERROR_CODES.NETWORK_ERROR ||
            this.code === ERROR_CODES.CONNECTION_REFUSED ||
            this.code === ERROR_CODES.DATABASE_ERROR ||
            (this.status !== undefined && this.status >= 500)
        );
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(): string {
        switch (this.code) {
            case ERROR_CODES.UNAUTHORIZED:
                return "Please sign in to continue";
            case ERROR_CODES.FORBIDDEN:
            case ERROR_CODES.PERMISSION_DENIED:
            case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
                return "You do not have permission to perform this action";
            case ERROR_CODES.ACCOUNT_PENDING:
                return "Your account is pending approval";
            case ERROR_CODES.ACCOUNT_REJECTED:
                return "Your account has been rejected";
            case ERROR_CODES.ACCOUNT_DEACTIVATED:
                return "Your account has been deactivated";
            case ERROR_CODES.NOT_FOUND:
                return "The requested resource was not found";
            case ERROR_CODES.CONFLICT:
            case ERROR_CODES.DEPENDENCY_CONFLICT:
                return "This action conflicts with existing data";
            case ERROR_CODES.DUPLICATE_RESOURCE:
            case ERROR_CODES.RESOURCE_EXISTS:
                return "A resource with this information already exists";
            case ERROR_CODES.TOO_MANY_REQUESTS:
            case ERROR_CODES.RATE_LIMITED:
                return "Too many requests. Please try again later";
            case ERROR_CODES.VALIDATION_ERROR:
                return this.fieldErrors?.length
                    ? "Please check the form for errors"
                    : "Invalid data provided";
            case ERROR_CODES.FILE_TOO_LARGE:
                return "File is too large to upload";
            case ERROR_CODES.INVALID_FILE_TYPE:
                return "File type is not supported";
            case ERROR_CODES.FILE_UPLOAD_FAILED:
                return "File upload failed. Please try again";
            case ERROR_CODES.VIRUS_DETECTED:
                return "File contains malicious content and cannot be uploaded";
            case ERROR_CODES.OPERATION_NOT_ALLOWED:
                return "This operation is not allowed at this time";
            case ERROR_CODES.DEADLINE_PASSED:
                return "The deadline for this action has passed";
            case ERROR_CODES.CONTRACT_CLOSED:
                return "This contract is no longer accepting applications";
            case ERROR_CODES.NETWORK_ERROR:
            case ERROR_CODES.CONNECTION_REFUSED:
                return "Network connection error. Please check your internet connection";
            case ERROR_CODES.TIMEOUT:
                return "Request timed out. Please try again";
            case ERROR_CODES.DATABASE_ERROR:
            case ERROR_CODES.SERVER_ERROR:
                return "A server error occurred. Please try again later";
            case ERROR_CODES.SERVICE_UNAVAILABLE:
                return "Service is temporarily unavailable. Please try again later";
            default:
                return this.message || "An unexpected error occurred";
        }
    }
}

/**
 * Converts a thrown error to an ApiError
 */
export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (error instanceof Error && "code" in error) {
        return new ApiError(error as StandardError);
    }

    // Fallback for unknown errors
    return new ApiError({
        code: ERROR_CODES.SERVER_ERROR,
        message:
            error instanceof Error
                ? error.message
                : "An unexpected error occurred",
    });
}

/**
 * Helper to handle common API error scenarios
 */
export function handleApiError(error: unknown): never {
    const apiError = toApiError(error);
    throw apiError;
}
