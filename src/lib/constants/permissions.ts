// RBAC permission constants based on backend implementation

// RBAC Management Permissions
export const RBAC_PERMISSIONS = {
    ROLE_MANAGE: "rbac:role:manage",
    USER_ASSIGN_ROLES: "rbac:user:assign_roles",
    PERMISSION_READ: "rbac:permission:read",
} as const;

// All permission categories for organization
export const PERMISSION_CATEGORIES = {
    USER: "user",
    EMPLOYEE: "employee",
    VENDOR: "vendor",
    CONTRACT: "contract",
    FILE: "file",
    RBAC: "rbac",
    SYSTEM: "system",
} as const;

// Permission category display names
export const PERMISSION_CATEGORY_LABELS: Record<string, string> = {
    [PERMISSION_CATEGORIES.USER]: "User Management",
    [PERMISSION_CATEGORIES.EMPLOYEE]: "Employee Operations",
    [PERMISSION_CATEGORIES.VENDOR]: "Vendor Management",
    [PERMISSION_CATEGORIES.CONTRACT]: "Contract Handling",
    [PERMISSION_CATEGORIES.FILE]: "File Operations",
    [PERMISSION_CATEGORIES.RBAC]: "RBAC Management",
    [PERMISSION_CATEGORIES.SYSTEM]: "System Administration",
};

// Helper function to get permission category from permission name
export function getPermissionCategory(permissionName: string): string {
    const category = permissionName.split(":")[0];
    return (
        PERMISSION_CATEGORIES[
            category.toUpperCase() as keyof typeof PERMISSION_CATEGORIES
        ] || "other"
    );
}

// Helper function to format permission name for display
export function formatPermissionName(permissionName: string): string {
    return permissionName
        .split(":")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

// System role names that cannot be deleted
export const SYSTEM_ROLES = ["Admin", "Employee", "Vendor"] as const;

// Validation constants
export const VALIDATION_RULES = {
    ROLE_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
    },
    ROLE_DESCRIPTION: {
        MAX_LENGTH: 255,
    },
} as const;
