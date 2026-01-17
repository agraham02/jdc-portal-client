/**
 * Broadcast notifications service
 * Provides API for admin broadcast functionality via Novu
 */

import { BaseService } from "./base";

export interface CreateBroadcastDto {
    title: string;
    message: string;
    targetRoles?: string[];
}

export interface BroadcastResponse {
    success: boolean;
    topics?: string[];
}

/**
 * Admin broadcast notifications API service
 */
export class BroadcastService extends BaseService {
    private static readonly BASE_PATH = "/notifications";

    /**
     * Send a broadcast notification to users
     *
     * @param data - Broadcast notification data
     * @returns Response with success status and topics
     */
    static async broadcast(
        data: CreateBroadcastDto
    ): Promise<BroadcastResponse> {
        return this.post<BroadcastResponse>(
            `${this.BASE_PATH}/broadcast`,
            data
        );
    }
}
