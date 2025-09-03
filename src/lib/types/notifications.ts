export type Notification = {
  _id: string;
  title: string;
  body?: string;
  read?: boolean;
  createdAt?: string;
};

export type NotificationListResponse = {
  data: Notification[];
  total?: number;
};

export type UnreadCountResponse = {
  count: number;
};

export type NotificationQueryParams = {
  page?: number;
  limit?: number;
  read?: boolean;
  search?: string;
};

export type CreateNotificationDto = {
  title: string;
  body?: string;
  userId?: string;
};

export const API_CONFIG = {
  ENDPOINTS: {
    NOTIFICATIONS: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    MARK_READ: "/notifications/:id/read",
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: "/notifications/:id",
    ADMIN_CREATE: "/admin/notifications",
    ADMIN_ALL: "/admin/notifications",
    ADMIN_CLEANUP: "/admin/notifications/cleanup",
  },
};
