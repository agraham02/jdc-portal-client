import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/lib/services/notificationService";

interface UseUnreadCountReturn {
    unreadCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useUnreadCount(): UseUnreadCountReturn {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUnreadCount = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.count);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch unread count"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    return {
        unreadCount,
        loading,
        error,
        refetch: fetchUnreadCount,
    };
}
