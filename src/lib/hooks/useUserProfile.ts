import { useAuth } from "@/lib/contexts/auth-context";
import { UserStatus, AccountType, RoleName } from "@/lib/types/auth";

/**
 * Custom hook providing user profile utilities
 */
export function useUserProfile() {
    const { user, getDisplayName, getRoleNames, hasRole, hasAccountType } =
        useAuth();

    // Check if user can perform administrative actions
    const canAdminister = () => {
        return hasRole(RoleName.ADMIN);
    };

    // Check if user is in a management role
    const isManager = () => {
        return (
            user?.employee?.managerId === undefined &&
            hasAccountType(AccountType.EMPLOYEE) &&
            hasRole(RoleName.EMPLOYEE)
        );
    };

    // Check if user needs onboarding
    const needsOnboarding = () => {
        return (
            user?.status === UserStatus.ONBOARDING ||
            user?.status === UserStatus.PENDING
        );
    };

    // Check if user account has any issues
    const hasAccountIssues = () => {
        if (!user) return true;
        return (
            user.status === UserStatus.REJECTED ||
            user.status === UserStatus.TERMINATED ||
            user.status === UserStatus.ARCHIVED ||
            user.status === UserStatus.INACTIVE
        );
    };

    // Get user's primary contact information
    const getContactInfo = () => {
        if (!user) return null;
        return {
            email: user.contactEmail || user.email,
            phone: user.contactPhone,
            fullName: getDisplayName(),
        };
    };

    // Get user's address for display
    const getDisplayAddress = (preferPhysical = true) => {
        if (!user) return null;

        const address = preferPhysical
            ? user.physicalAddress || user.mailingAddress
            : user.mailingAddress || user.physicalAddress;

        if (!address) return null;

        return `${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${
            address.city
        }, ${address.state} ${address.zip}`;
    };

    // Get formatted role display
    const getRoleDisplay = () => {
        const roles = getRoleNames();
        if (roles.length === 0) return "No Role";
        if (roles.length === 1) return roles[0];
        return roles.join(", ");
    };

    return {
        user,
        canAdminister,
        isManager,
        needsOnboarding,
        hasAccountIssues,
        getContactInfo,
        getDisplayAddress,
        getRoleDisplay,
        displayName: getDisplayName(),
        roles: getRoleNames(),
    };
}
