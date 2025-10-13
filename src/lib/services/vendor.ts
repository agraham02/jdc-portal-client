import { apiClient } from "@/lib/api";
import type { Vendor as VendorType, User, UserStatus } from "@/lib/types/auth";
import { PaginatedResponse } from "@/lib/types/api";
import { VendorRegistrationFormData } from "../validations";
import { buildApiPath } from "@/lib/utils/queryParams";

export type Vendor = VendorType;

export type VendorWithUser = Omit<Vendor, "userId"> & {
    userId: User & { status: UserStatus };
};

export type VendorListResponse = PaginatedResponse<VendorWithUser>;

export interface CreateVendorDto {
    companyName: string;
    website?: string;
    contactName?: string;
    servicesOffered?: string[];
    notes?: string;
}

export interface UpdateVendorDto {
    companyName?: string;
    website?: string;
    contactName?: string;
    servicesOffered?: string[];
    notes?: string;
}

export class VendorService {
    /**
     * Get all vendors with pagination and filtering
     */
    static async getVendors(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: UserStatus;
    }): Promise<VendorListResponse> {
        const path = buildApiPath("/vendors", {
            page: params?.page,
            limit: params?.limit,
            search: params?.search,
            status: params?.status,
        });
        return apiClient.get<VendorListResponse>(path);
    }

    /**
     * Get pending vendors (awaiting approval)
     */
    static async getPendingVendors(): Promise<VendorListResponse> {
        return apiClient.get<VendorListResponse>(`/vendors/pending`);
    }

    /**
     * Approve vendor account
     * Uses standardized /vendors/:id/approve endpoint
     */
    static async approveVendor(vendorId: string): Promise<void> {
        return apiClient.patch(`/vendors/${vendorId}/approve`);
    }

    /**
     * Reject vendor account
     * Uses standardized /vendors/:id/reject endpoint
     */
    static async rejectVendor(vendorId: string, reason: string): Promise<void> {
        return apiClient.patch(`/vendors/${vendorId}/reject`, { reason });
    }

    /**
     * Deactivate vendor account
     * Uses standardized /vendors/:id/deactivate endpoint
     */
    static async deactivateVendor(vendorId: string): Promise<void> {
        return apiClient.patch(`/vendors/${vendorId}/deactivate`);
    }

    // Backward compatibility aliases (deprecated)
    /** @deprecated Use approveVendor instead */
    static async approveUser(vendorId: string): Promise<void> {
        return this.approveVendor(vendorId);
    }

    /** @deprecated Use rejectVendor instead */
    static async rejectUser(vendorId: string, reason: string): Promise<void> {
        return this.rejectVendor(vendorId, reason);
    }

    /** @deprecated Use deactivateVendor instead */
    static async deactivateUser(vendorId: string): Promise<void> {
        return this.deactivateVendor(vendorId);
    }

    /**
     * Get current vendor profile (for vendors to view their own profile)
     */
    static async getMyProfile(): Promise<VendorWithUser> {
        return apiClient.get<VendorWithUser>(`/vendors/me`);
    }

    /**
     * Get a single vendor by ID
     */
    static async getVendor(vendorId: string): Promise<VendorWithUser> {
        return apiClient.get<VendorWithUser>(`/vendors/${vendorId}`);
    }

    /**
     * Create a new vendor profile
     */
    static async createVendor(
        vendorData: VendorRegistrationFormData
    ): Promise<{ message: string; vendor: VendorWithUser }> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Exclude confirmPassword before sending to backend
        const { confirmPassword, ...dataWithoutConfirm } = vendorData;
        return apiClient.post<{ message: string; vendor: VendorWithUser }>(
            `/vendors`,
            dataWithoutConfirm
        );
    }

    /**
     * Update vendor information
     */
    static async updateVendor(
        vendorId: string,
        vendorData: UpdateVendorDto
    ): Promise<{ message: string; vendor: VendorWithUser }> {
        return apiClient.patch<{ message: string; vendor: VendorWithUser }>(
            `/vendors/${vendorId}`,
            vendorData
        );
    }

    /**
     * Delete vendor profile
     */
    static async deleteVendor(vendorId: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/vendors/${vendorId}`);
    }
}
