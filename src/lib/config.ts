export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    ENDPOINTS: {
        NOTIFICATIONS: "/notifications",
        UNREAD_COUNT: "/notifications/unread-count",
        MARK_READ: "/notifications/:id/read",
        MARK_ALL_READ: "/notifications/mark-all-read",
        DELETE: "/notifications/:id",
        ADMIN_CREATE: "/notifications",
        ADMIN_ALL: "/notifications/admin/all",
        ADMIN_CLEANUP: "/notifications/admin/cleanup",
    },
} as const;
