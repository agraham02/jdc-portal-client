/**
 * Backend Error Mapping Utility
 *
 * Maps NestJS validation errors to react-hook-form compatible format
 * for displaying field-specific error messages.
 */

import { UseFormSetError, FieldValues, Path } from "react-hook-form";

export interface BackendValidationError {
    field: string;
    message: string;
    type?: string;
}

/**
 * Parse NestJS validation error response
 *
 * NestJS returns errors in format:
 * {
 *   statusCode: 400,
 *   message: ["field1 must not be empty", "field2.nested must be valid"],
 *   error: "Bad Request"
 * }
 */
export function parseBackendValidationErrors(
    error: unknown
): BackendValidationError[] {
    const errors: BackendValidationError[] = [];

    // Check if error has the expected structure
    if (!error || typeof error !== "object") {
        return errors;
    }

    const err = error as {
        response?: { data?: unknown; status?: number };
        status?: number;
        data?: unknown;
    };

    // Handle Axios error format
    const responseData = err.response?.data || err.data;
    const statusCode = err.response?.status || err.status;

    // Only process 400 Bad Request errors (validation errors)
    if (
        statusCode !== 400 ||
        !responseData ||
        typeof responseData !== "object"
    ) {
        return errors;
    }

    const data = responseData as { message?: unknown };

    // NestJS validation errors are in the 'message' field (array or string)
    if (!data.message) {
        return errors;
    }

    // Handle array of error messages
    if (Array.isArray(data.message)) {
        for (const msg of data.message) {
            if (typeof msg === "string") {
                const parsed = parseErrorMessage(msg);
                if (parsed) {
                    errors.push(parsed);
                }
            }
        }
    } else if (typeof data.message === "string") {
        // Handle single error message
        const parsed = parseErrorMessage(data.message);
        if (parsed) {
            errors.push(parsed);
        }
    }

    return errors;
}

/**
 * Parse individual error message to extract field path
 *
 * Examples:
 * - "email must be a valid email" -> { field: "email", message: "must be a valid email" }
 * - "physicalAddress.line1 must not be empty" -> { field: "physicalAddress.line1", message: "must not be empty" }
 * - "contactPhone must match /^\\+[1-9]\\d{1,14}$/ regular expression" -> { field: "contactPhone", message: "..." }
 */
function parseErrorMessage(message: string): BackendValidationError | null {
    // Pattern: "fieldPath constraint message"
    // Examples:
    // - "email must be a valid email"
    // - "physicalAddress.line1 must not be empty"
    // - "contactPhone must match /regex/ regular expression"

    // More specific pattern for field paths (letters, numbers, dots, underscores only)
    const pattern = /^([a-zA-Z0-9_.]+)\s+(.+)$/;

    // Use exec() instead of match() as per linter recommendation
    const match = pattern.exec(message);

    if (match) {
        const [, fieldPath, constraintMessage] = match;
        return {
            field: fieldPath,
            message:
                constraintMessage.charAt(0).toUpperCase() +
                constraintMessage.slice(1),
            type: "backend",
        };
    }

    // If no pattern matches, return generic error
    return {
        field: "root",
        message,
        type: "backend",
    };
}

/**
 * Map backend validation errors to react-hook-form fields
 *
 * Usage:
 * ```ts
 * try {
 *   await submitForm(data);
 * } catch (error) {
 *   mapBackendErrorsToForm(error, setError);
 * }
 * ```
 */
export function mapBackendErrorsToForm<TFieldValues extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<TFieldValues>
): boolean {
    const errors = parseBackendValidationErrors(error);

    if (errors.length === 0) {
        return false;
    }

    for (const err of errors) {
        // Skip root errors (will be handled as general errors)
        if (err.field === "root") {
            continue;
        }

        // Set field error
        setError(err.field as Path<TFieldValues>, {
            type: err.type || "backend",
            message: err.message,
        });
    }

    return true;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    if (!error || typeof error !== "object") {
        return false;
    }

    const err = error as { response?: { status?: number }; status?: number };
    const statusCode = err.response?.status || err.status;

    return statusCode === 400;
}

/**
 * Get generic error message for non-validation errors
 */
export function getGenericErrorMessage(error: unknown): string {
    if (!error || typeof error !== "object") {
        return "An unexpected error occurred";
    }

    const err = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
    };

    // Try to extract error message
    const responseMessage = err.response?.data?.message;

    if (typeof responseMessage === "string") {
        return responseMessage;
    }

    if (Array.isArray(responseMessage) && responseMessage.length > 0) {
        return responseMessage[0];
    }

    if (err.message) {
        return err.message;
    }

    return "An unexpected error occurred";
}
