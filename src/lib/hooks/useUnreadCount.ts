import { useNotificationContext } from "@/lib/contexts/notification-context";

interface UseUnreadCountReturn {
    unreadCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useUnreadCount(): UseUnreadCountReturn {
    const context = useNotificationContext();

    return {
        unreadCount: context.unreadCount,
        loading: context.loading,
        error: context.error,
        refetch: context.refetch,
    };
}
