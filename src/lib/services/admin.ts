import { BaseService } from "./base";

/**
 * Dashboard statistics response from the API
 */
export interface DashboardStats {
    users: {
        total: number;
        active: number;
        pending: number;
    };
    vendors: {
        total: number;
    };
    contracts: {
        total: number;
        open: number;
        awarded: number;
    };
    pendingApprovals: number;
}

/**
 * Activity trend data point for charts
 */
export interface ActivityTrendPoint {
    date: string;
    newUsers: number;
    newVendors: number;
    newContracts: number;
}

/**
 * Activity trends response from the API
 */
export interface ActivityTrendsResponse {
    data: ActivityTrendPoint[];
    period: {
        start: string;
        end: string;
        days: number;
    };
}

/**
 * Recent activity item from audit logs
 */
export interface RecentActivityItem {
    id: string;
    action: string;
    actor: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    target: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    details: Record<string, unknown> | null;
    createdAt: string;
}

/**
 * Recent activity response from the API
 */
export interface RecentActivityResponse {
    data: RecentActivityItem[];
    total: number;
}

/**
 * Admin service for administrative operations
 * Handles dashboard stats, cache management, and admin-level operations
 */
export class AdminService extends BaseService {
    private static readonly BASE_PATH = "/admin";

    /**
     * Get dashboard statistics for admin overview
     * Returns aggregated counts for users, vendors, contracts, and pending approvals
     *
     * @returns Dashboard statistics
     *
     * @example
     * ```typescript
     * const stats = await AdminService.getDashboardStats();
     * console.log(stats.users.total, stats.pendingApprovals);
     * ```
     */
    static async getDashboardStats(): Promise<DashboardStats> {
        return this.get<DashboardStats>(`${this.BASE_PATH}/stats`);
    }

    /**
     * Get activity trends for dashboard charts
     * Returns daily new user/vendor/contract counts for the specified period
     *
     * @param days Number of days to look back (default: 7)
     * @returns Activity trend data points
     */
    static async getActivityTrends(
        days: number = 7
    ): Promise<ActivityTrendsResponse> {
        return this.get<ActivityTrendsResponse>(
            `${this.BASE_PATH}/activity-trends`,
            { days: days.toString() }
        );
    }

    /**
     * Get recent activity from audit logs
     *
     * @param limit Maximum number of activities to return (default: 10)
     * @returns Recent activity items
     */
    static async getRecentActivity(
        limit: number = 10
    ): Promise<RecentActivityResponse> {
        return this.get<RecentActivityResponse>(
            `${this.BASE_PATH}/recent-activity`,
            { limit: limit.toString() }
        );
    }

    /**
     * Get permission cache statistics (system admin only)
     *
     * @returns Cache performance metrics
     */
    static async getCacheStats(): Promise<{
        size: number;
        hits: number;
        misses: number;
        hitRate: string;
    }> {
        return this.get(`${this.BASE_PATH}/cache/stats`);
    }

    /**
     * Get admin panel info and available features
     *
     * @returns Admin panel information
     */
    static async getAdminInfo(): Promise<{
        version: string;
        environment: string;
        features: Record<string, boolean>;
        timestamp: string;
    }> {
        return this.get(`${this.BASE_PATH}/info`);
    }
}
