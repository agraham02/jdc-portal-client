import { UserStatus } from "@/lib/types/auth";

/**
 * UserStatusHelper - Frontend utility for user status checks
 *
 * This helper provides consistent user status logic for the frontend,
 * matching the backend implementation to ensure UI behaves correctly
 * based on user status.
 *
 * ## Status Definitions:
 * - **PENDING**: Awaiting approval or onboarding (can login but limited access)
 * - **ACTIVE**: Fully approved and active (full access)
 * - **INACTIVE**: Temporarily disabled (leave, suspended, etc.) - cannot login
 * - **ONBOARDING**: In the process of being set up (can login but limited access)
 * - **REJECTED**: Registration/application denied - cannot login
 * - **TERMINATED**: Explicitly ended (employment/contract ended) - cannot login
 * - **ARCHIVED**: Soft-deleted or historical - cannot login
 */
export class UserStatusHelper {
    /**
     * Check if a user is in an active state that allows full system access
     * @param status - The user's current status
     * @returns true if user has full access (ACTIVE only)
     */
    static isActive(status: UserStatus): boolean {
        return status === UserStatus.ACTIVE;
    }

    /**
     * Check if a user can authenticate (login)
     * Users can login if they are ACTIVE, PENDING, or ONBOARDING
     * @param status - The user's current status
     * @returns true if user can login
     */
    static canLogin(status: UserStatus): boolean {
        return [
            UserStatus.ACTIVE,
            UserStatus.PENDING,
            UserStatus.ONBOARDING,
        ].includes(status);
    }

    /**
     * Check if a user can perform actions (create, update, delete operations)
     * Only fully active users can perform actions
     * @param status - The user's current status
     * @returns true if user can perform actions
     */
    static canPerformActions(status: UserStatus): boolean {
        return status === UserStatus.ACTIVE;
    }

    /**
     * Check if a user account is in a negative/restricted state
     * @param status - The user's current status
     * @returns true if status is INACTIVE, REJECTED, TERMINATED, or ARCHIVED
     */
    static isRestricted(status: UserStatus): boolean {
        return [
            UserStatus.INACTIVE,
            UserStatus.REJECTED,
            UserStatus.TERMINATED,
            UserStatus.ARCHIVED,
        ].includes(status);
    }

    /**
     * Check if a user is in an onboarding state (limited access)
     * @param status - The user's current status
     * @returns true if status is PENDING or ONBOARDING
     */
    static isOnboarding(status: UserStatus): boolean {
        return [UserStatus.PENDING, UserStatus.ONBOARDING].includes(status);
    }

    /**
     * Check if a user can be reactivated by an admin
     * Only INACTIVE users can be reactivated
     * REJECTED, TERMINATED, and ARCHIVED require new account creation
     * @param status - The user's current status
     * @returns true if user can be reactivated
     */
    static canBeReactivated(status: UserStatus): boolean {
        return status === UserStatus.INACTIVE;
    }

    /**
     * Check if a user is permanently blocked from the system
     * These statuses require admin intervention to create a new account
     * @param status - The user's current status
     * @returns true if status is REJECTED, TERMINATED, or ARCHIVED
     */
    static isPermanentlyBlocked(status: UserStatus): boolean {
        return [
            UserStatus.REJECTED,
            UserStatus.TERMINATED,
            UserStatus.ARCHIVED,
        ].includes(status);
    }

    /**
     * Check if a user can access read-only resources
     * Users in PENDING and ONBOARDING can view but not modify
     * @param status - The user's current status
     * @returns true if user has read access
     */
    static canReadResources(status: UserStatus): boolean {
        return [
            UserStatus.ACTIVE,
            UserStatus.PENDING,
            UserStatus.ONBOARDING,
        ].includes(status);
    }

    /**
     * Check if the user status indicates they are pending approval
     * @param status - The user's current status
     * @returns true if status is PENDING
     */
    static isPending(status: UserStatus): boolean {
        return status === UserStatus.PENDING;
    }

    /**
     * Check if the user status indicates they are rejected
     * @param status - The user's current status
     * @returns true if status is REJECTED
     */
    static isRejected(status: UserStatus): boolean {
        return status === UserStatus.REJECTED;
    }

    /**
     * Get a badge variant based on status
     * @param status - The user status
     * @returns Badge variant string for UI components
     */
    static getBadgeVariant(status: UserStatus): string {
        const variants: Record<UserStatus, string> = {
            [UserStatus.PENDING]: "warning",
            [UserStatus.ACTIVE]: "success",
            [UserStatus.INACTIVE]: "secondary",
            [UserStatus.ONBOARDING]: "info",
            [UserStatus.REJECTED]: "destructive",
            [UserStatus.TERMINATED]: "destructive",
            [UserStatus.ARCHIVED]: "secondary",
        };
        return variants[status] ?? "default";
    }

    /**
     * Get a human-readable description of a status
     * @param status - The user status
     * @returns Description string
     */
    static getStatusDescription(status: UserStatus): string {
        const descriptions: Record<UserStatus, string> = {
            [UserStatus.PENDING]:
                "Account awaiting approval or additional onboarding steps",
            [UserStatus.ACTIVE]: "Account is fully active with all permissions",
            [UserStatus.INACTIVE]:
                "Account temporarily disabled (can be reactivated by admin)",
            [UserStatus.ONBOARDING]:
                "Account in setup process (limited access until complete)",
            [UserStatus.REJECTED]:
                "Registration denied (requires new account creation)",
            [UserStatus.TERMINATED]:
                "Account permanently ended (requires new account creation)",
            [UserStatus.ARCHIVED]:
                "Account soft-deleted or historical (requires new account creation)",
        };

        return descriptions[status] ?? "Unknown status";
    }

    /**
     * Get a human-readable reason for why a user cannot login
     * @param status - The user's current status
     * @returns Reason string or null if user can login
     */
    static getLoginBlockReason(status: UserStatus): string | null {
        if (this.canLogin(status)) return null;

        const reasons: Partial<Record<UserStatus, string>> = {
            [UserStatus.INACTIVE]:
                "Your account has been temporarily deactivated. Please contact support for assistance.",
            [UserStatus.REJECTED]:
                "Your account registration was not approved. Please contact support if you believe this is an error.",
            [UserStatus.TERMINATED]:
                "Your account has been terminated. Please contact support for more information.",
            [UserStatus.ARCHIVED]:
                "This account is no longer active. Please create a new account if you wish to continue.",
        };

        return reasons[status] ?? "Your account status does not allow login.";
    }
}
