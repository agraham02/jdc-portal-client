// Client-side mirror of backend PermissionName enum.
// Keep values exactly in sync with server: src/common/enums/permissions.enum.ts
export const PermissionName = {
    // User management
    USER_CREATE: "user:create",
    USER_READ: "user:read",
    USER_READ_ALL: "user:read:all",
    USER_UPDATE: "user:update",
    USER_UPDATE_ALL: "user:update:all",
    USER_DELETE: "user:delete",
    USER_ACTIVATE: "user:activate",

    // Employee management
    EMPLOYEE_CREATE: "employee:create",
    EMPLOYEE_READ: "employee:read",
    EMPLOYEE_READ_ALL: "employee:read:all",
    EMPLOYEE_UPDATE: "employee:update",
    EMPLOYEE_UPDATE_ALL: "employee:update:all",
    EMPLOYEE_DELETE: "employee:delete",

    // Vendor management
    VENDOR_CREATE: "vendor:create",
    VENDOR_READ: "vendor:read",
    VENDOR_READ_ALL: "vendor:read:all",
    VENDOR_UPDATE: "vendor:update",
    VENDOR_UPDATE_ALL: "vendor:update:all",
    VENDOR_DELETE: "vendor:delete",
    VENDOR_APPROVE: "vendor:approve",

    // Contract management
    CONTRACT_CREATE: "contract:create",
    CONTRACT_READ: "contract:read",
    CONTRACT_READ_ALL: "contract:read:all",
    CONTRACT_UPDATE: "contract:update",
    CONTRACT_DELETE: "contract:delete",
    CONTRACT_PUBLISH: "contract:publish",
    CONTRACT_AWARD: "contract:award",
    CONTRACT_APPLY: "contract:apply",
    CONTRACT_REVIEW_APPLICATIONS: "contract:review_applications",
    CONTRACT_MANAGE_APPLICATIONS: "contract:manage_applications",
    APPLICATION_WITHDRAW: "application:withdraw",

    // File management
    FILE_UPLOAD: "file:upload",
    FILE_READ: "file:read",
    FILE_READ_ALL: "file:read:all",
    FILE_UPDATE: "file:update",
    FILE_UPDATE_ALL: "file:update:all",
    FILE_DELETE: "file:delete",
    FILE_DELETE_ALL: "file:delete:all",
    FILE_APPROVE: "file:approve",
    FILE_DOWNLOAD: "file:download",

    // HR Documents
    HR_DOCUMENT_CREATE: "hr_document:create",
    HR_DOCUMENT_READ: "hr_document:read",
    HR_DOCUMENT_UPDATE: "hr_document:update",
    HR_DOCUMENT_DELETE: "hr_document:delete",

    // Internal Notes (procurement)
    INTERNAL_NOTE_CREATE: "internal_note:create",
    INTERNAL_NOTE_READ: "internal_note:read",
    INTERNAL_NOTE_UPDATE: "internal_note:update",
    INTERNAL_NOTE_DELETE: "internal_note:delete",

    // System administration
    SYSTEM_ADMIN: "system:admin",
    SYSTEM_REPORTS: "system:reports",
    SYSTEM_AUDIT: "system:audit",

    // RBAC management
    RBAC_ROLE_READ: "rbac:role:read",
    RBAC_ROLE_MANAGE: "rbac:role:manage",
    RBAC_USER_ASSIGN_ROLES: "rbac:user:assign_roles",
    RBAC_PERMISSION_READ: "rbac:permission:read",

    // Notification management
    NOTIFICATIONS_READ: "notifications:read",
    NOTIFICATIONS_ACK: "notifications:ack",
    NOTIFICATIONS_MANAGE: "notifications:manage",
    NOTIFICATIONS_BROADCAST: "notifications:broadcast",
} as const;

export type PermissionName =
    (typeof PermissionName)[keyof typeof PermissionName];
