/**
 * Domain-specific error messages for consistent user feedback
 *
 * Usage:
 * ```typescript
 * import { errorMessages } from '@/lib/utils/error-messages';
 *
 * apiToast.error(errorMessages.contracts.create, error);
 * ```
 */

export const errorMessages = {
    // Contracts
    contracts: {
        load: "Failed to load contracts",
        loadSingle: "Failed to load contract",
        create: "Failed to create contract",
        update: "Failed to update contract",
        delete: "Failed to delete contract",
        publish: "Failed to publish contract",
        close: "Failed to close contract",
        reopen: "Failed to reopen contract",
        award: "Failed to award contract",
        notFound: "Contract not found",
        uploadDocuments: "Failed to upload documents",
        deleteDocument: "Failed to delete document",
    },

    // Applications
    applications: {
        load: "Failed to load applications",
        loadSingle: "Failed to load application",
        submit: "Failed to submit application",
        withdraw: "Failed to withdraw application",
        cancel: "Failed to cancel application",
        updateStatus: "Failed to update application status",
        notFound: "Application not found",
    },

    // Vendors
    vendors: {
        load: "Failed to load vendors",
        loadSingle: "Failed to load vendor",
        create: "Failed to create vendor",
        update: "Failed to update vendor",
        delete: "Failed to delete vendor",
        register: "Failed to register vendor account",
        approve: "Failed to approve vendor",
        reject: "Failed to reject vendor",
        deactivate: "Failed to deactivate vendor",
        notFound: "Vendor not found",
    },

    // Employees
    employees: {
        load: "Failed to load employees",
        loadSingle: "Failed to load employee",
        create: "Failed to create employee",
        update: "Failed to update employee",
        delete: "Failed to delete employee",
        notFound: "Employee not found",
    },

    // Users
    users: {
        load: "Failed to load users",
        loadSingle: "Failed to load user",
        create: "Failed to create user",
        update: "Failed to update user",
        delete: "Failed to delete user",
        approve: "Failed to approve user",
        reject: "Failed to reject user",
        unlock: "Failed to unlock user",
        deactivate: "Failed to deactivate user",
        reactivate: "Failed to reactivate user",
        notFound: "User not found",
    },

    // Authentication
    auth: {
        login: "Login failed",
        logout: "Logout failed",
        register: "Registration failed",
        verifyEmail: "Email verification failed",
        resendVerification: "Failed to resend verification email",
        forgotPassword: "Failed to send reset email",
        resetPassword: "Failed to reset password",
        changePassword: "Failed to change password",
        updateProfile: "Failed to update profile",
        refreshToken: "Session refresh failed",
        invalidCredentials: "Invalid email or password",
        accountLocked: "Account is locked. Please try again later.",
        accountPending: "Account is pending approval",
        accountRejected: "Account registration was rejected",
    },

    // RBAC
    rbac: {
        loadRoles: "Failed to load roles",
        loadPermissions: "Failed to load permissions",
        createRole: "Failed to create role",
        updateRole: "Failed to update role",
        deleteRole: "Failed to delete role",
        assignRole: "Failed to assign role",
        removeRole: "Failed to remove role",
    },

    // Files
    files: {
        upload: "Failed to upload file",
        download: "Failed to download file",
        delete: "Failed to delete file",
        tooLarge: "File is too large",
        invalidType: "Invalid file type",
        scanFailed: "File scan failed",
        virusDetected: "File contains malware",
    },

    // Notifications
    notifications: {
        load: "Failed to load notifications",
        markAsRead: "Failed to mark notification as read",
        markAllAsRead: "Failed to mark all as read",
        delete: "Failed to delete notification",
        loadPreferences: "Failed to load notification preferences",
        updatePreferences: "Failed to update notification preferences",
    },

    // HR Documents
    hrDocuments: {
        load: "Failed to load documents",
        upload: "Failed to upload document",
        delete: "Failed to delete document",
        download: "Failed to download document",
    },

    // Generic
    generic: {
        networkError: "Network error. Please check your connection.",
        timeout: "Request timed out. Please try again.",
        serverError: "Server error. Please try again later.",
        unauthorized: "You are not authorized to perform this action.",
        forbidden: "Access denied. You don't have permission.",
        notFound: "The requested resource was not found.",
        conflict: "This action conflicts with existing data.",
        validationError: "Please check your input and try again.",
        unknown: "An unexpected error occurred. Please try again.",
        rateLimited: "Too many requests. Please try again later.",
    },
};

/**
 * Success messages for consistent user feedback
 */
export const successMessages = {
    contracts: {
        created: "Contract created successfully",
        updated: "Contract updated successfully",
        deleted: "Contract deleted successfully",
        published: "Contract published successfully",
        closed: "Contract closed successfully",
        reopened: "Contract reopened successfully",
        awarded: "Contract awarded successfully",
        documentsUploaded: "Documents uploaded successfully",
        documentDeleted: "Document deleted successfully",
    },

    applications: {
        submitted: "Application submitted successfully",
        withdrawn: "Application withdrawn successfully",
        cancelled: "Application cancelled successfully",
        statusUpdated: "Application status updated successfully",
    },

    vendors: {
        created: "Vendor created successfully",
        updated: "Vendor updated successfully",
        deleted: "Vendor deleted successfully",
        registered: "Vendor registration submitted successfully",
        approved: "Vendor approved successfully",
        rejected: "Vendor rejected successfully",
        deactivated: "Vendor deactivated successfully",
    },

    employees: {
        created: "Employee created successfully",
        updated: "Employee updated successfully",
        deleted: "Employee deleted successfully",
    },

    users: {
        created: "User created successfully",
        updated: "User updated successfully",
        deleted: "User deleted successfully",
        approved: "User approved successfully",
        rejected: "User rejected successfully",
        unlocked: "User unlocked successfully",
        deactivated: "User deactivated successfully",
        reactivated: "User reactivated successfully",
    },

    auth: {
        loggedIn: "Logged in successfully",
        loggedOut: "Logged out successfully",
        registered: "Registration successful",
        emailVerified: "Email verified successfully",
        verificationSent: "Verification email sent",
        resetEmailSent: "Password reset email sent",
        passwordReset: "Password reset successfully",
        passwordChanged: "Password changed successfully",
        profileUpdated: "Profile updated successfully",
    },

    rbac: {
        roleCreated: "Role created successfully",
        roleUpdated: "Role updated successfully",
        roleDeleted: "Role deleted successfully",
        roleAssigned: "Role assigned successfully",
        roleRemoved: "Role removed successfully",
    },

    files: {
        uploaded: "File uploaded successfully",
        downloaded: "File downloaded successfully",
        deleted: "File deleted successfully",
    },

    notifications: {
        markedAsRead: "Notification marked as read",
        markedAllAsRead: "All notifications marked as read",
        deleted: "Notification deleted successfully",
        preferencesUpdated: "Notification preferences updated successfully",
    },

    hrDocuments: {
        uploaded: "Document uploaded successfully",
        deleted: "Document deleted successfully",
    },
};

/**
 * Get user-friendly error message from error object
 * Falls back to provided fallback message
 *
 * @param error - Error object (StandardError, Error, or unknown)
 * @param fallback - Fallback message if error message can't be extracted
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (!error) return fallback;

    // Handle StandardError (from API client)
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }

    // Handle native Error
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === "string") {
        return error;
    }

    return fallback;
}

/**
 * Get error code from error object
 *
 * @param error - Error object
 * @returns Error code or undefined
 */
export function getErrorCode(error: unknown): string | undefined {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
    ) {
        return (error as { code: string }).code;
    }
    return undefined;
}

/**
 * Check if error is a specific type
 *
 * @param error - Error object
 * @param code - Error code to check
 * @returns True if error matches code
 */
export function isErrorCode(error: unknown, code: string): boolean {
    return getErrorCode(error) === code;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    const code = getErrorCode(error);
    return code === "NetworkError" || code === "Timeout";
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
    const code = getErrorCode(error);
    return code === "Unauthorized" || code === "Forbidden";
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
    return getErrorCode(error) === "NotFound";
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    if (typeof error === "object" && error !== null && "fieldErrors" in error) {
        return Array.isArray((error as { fieldErrors: unknown }).fieldErrors);
    }
    return false;
}
