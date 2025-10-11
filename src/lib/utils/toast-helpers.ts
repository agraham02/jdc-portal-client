/**
 * Standardized toast notification helpers for consistent user feedback
 * Wraps Sonner's toast library with API-aware error extraction
 */

import { toast as sonnerToast } from "sonner";
import type { StandardError } from "../types/errors";

/**
 * Extract user-friendly error message from various error types
 * Handles StandardError from API, native Error objects, and strings
 *
 * @param error - Error object, StandardError, or string
 * @returns User-friendly error message
 */
function extractErrorMessage(error: unknown): string {
    if (!error) return "An unknown error occurred";

    // Handle StandardError from API client
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        const standardError = error as StandardError;

        // If there are field errors, show the first one
        if (standardError.fieldErrors && standardError.fieldErrors.length > 0) {
            const firstFieldError = standardError.fieldErrors[0];
            return `${firstFieldError.field}: ${firstFieldError.message}`;
        }

        return standardError.message;
    }

    // Handle native Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === "string") {
        return error;
    }

    // Fallback for unknown error types
    return "An unexpected error occurred";
}

/**
 * Standardized API toast helpers
 * Provides consistent patterns for success, error, loading, and promise-based toasts
 */
export const apiToast = {
    /**
     * Show success toast
     *
     * @param message - Success message
     * @param description - Optional description for more details
     *
     * @example
     * ```typescript
     * apiToast.success("User created successfully");
     * apiToast.success("User created", "Check your email for verification link");
     * ```
     */
    success: (message: string, description?: string) => {
        return sonnerToast.success(message, {
            description,
            duration: 4000,
        });
    },

    /**
     * Show error toast with automatic error message extraction
     *
     * @param titleOrError - Error title or error object
     * @param errorOrDescription - Error object or description string
     *
     * @example
     * ```typescript
     * // With error object (extracts message automatically)
     * try {
     *   await UserService.create(data);
     * } catch (error) {
     *   apiToast.error("Failed to create user", error);
     * }
     *
     * // With custom message
     * apiToast.error("Failed to create user", "Please try again later");
     *
     * // Error-only (uses extracted message as title)
     * apiToast.error(error);
     * ```
     */
    error: (titleOrError: string | unknown, errorOrDescription?: unknown) => {
        let title: string;
        let description: string | undefined;

        // Single argument: treat as error and extract message
        if (errorOrDescription === undefined) {
            if (typeof titleOrError === "string") {
                title = titleOrError;
            } else {
                title = extractErrorMessage(titleOrError);
            }
        } else {
            // Two arguments: first is title, second is error or description
            title = typeof titleOrError === "string" ? titleOrError : "Error";

            if (typeof errorOrDescription === "string") {
                description = errorOrDescription;
            } else {
                description = extractErrorMessage(errorOrDescription);
            }
        }

        return sonnerToast.error(title, {
            description,
            duration: 6000,
        });
    },

    /**
     * Show loading toast
     * Returns toast ID that can be used to update or dismiss the toast
     *
     * @param message - Loading message
     * @param description - Optional description
     *
     * @example
     * ```typescript
     * const toastId = apiToast.loading("Creating user...");
     * try {
     *   await UserService.create(data);
     *   apiToast.success("User created successfully");
     * } catch (error) {
     *   apiToast.error("Failed to create user", error);
     * } finally {
     *   sonnerToast.dismiss(toastId);
     * }
     * ```
     */
    loading: (message: string, description?: string) => {
        return sonnerToast.loading(message, {
            description,
        });
    },

    /**
     * Show promise-based toast with automatic state management
     * Automatically shows loading, success, or error based on promise resolution
     *
     * @param promise - Promise to track
     * @param messages - Messages for loading, success, and error states
     *
     * @example
     * ```typescript
     * await apiToast.promise(
     *   UserService.create(data),
     *   {
     *     loading: "Creating user...",
     *     success: "User created successfully",
     *     error: "Failed to create user"
     *   }
     * );
     * ```
     */
    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: (error: unknown) => {
                const errorMessage = extractErrorMessage(error);
                return `${messages.error}: ${errorMessage}`;
            },
        });
    },

    /**
     * Show info toast
     *
     * @param message - Info message
     * @param description - Optional description
     *
     * @example
     * ```typescript
     * apiToast.info("New feature available", "Check out our new dashboard");
     * ```
     */
    info: (message: string, description?: string) => {
        return sonnerToast.info(message, {
            description,
            duration: 5000,
        });
    },

    /**
     * Show warning toast
     *
     * @param message - Warning message
     * @param description - Optional description
     *
     * @example
     * ```typescript
     * apiToast.warning("Session expiring soon", "Please save your work");
     * ```
     */
    warning: (message: string, description?: string) => {
        return sonnerToast.warning(message, {
            description,
            duration: 5000,
        });
    },
};
