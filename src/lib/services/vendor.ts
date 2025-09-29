import { apiClient } from "@/lib/api";
import type {
    Vendor as VendorType,
    User,
    UserStatus,
    RegisterVendorDto,
} from "@/lib/types/auth";
import { PaginatedResponse } from "@/lib/types/api";
import { VendorRegistrationFormData } from "../validations";

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
        pageSize?: number;
        search?: string;
        status?: UserStatus;
    }): Promise<VendorListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status) queryParams.append("status", params.status);

        const query = queryParams.toString();
        return apiClient.get<VendorListResponse>(
            `/vendors${query ? `?${query}` : ""}`
        );
    }

    /**
     * Get pending vendors (awaiting approval)
     */
        static async getPendingVendors(): Promise<VendorListResponse> {
            return apiClient.get<VendorListResponse>(`/vendors/pending`);
        }

    /** 
     * Approve vendor account
     */
    static async approveUser(vendorId: string): Promise<void> {
        return apiClient.patch(`/vendors/approve/${vendorId}`);
    }

    /**
     * Reject vendor account
     */
    static async rejectUser(vendorId: string, reason: string): Promise<void> {
        return apiClient.patch(`/vendors/reject/${vendorId}`, { reason });
    }

    /**
     * Deactivate vendor account
     */
    static async deactivateUser(vendorId: string): Promise<void> {
        return apiClient.patch(`/vendors/deactivate/${vendorId}`);
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
        const { confirmPassword, ...formData } = vendorData;

        return apiClient.post<{ message: string; vendor: VendorWithUser }>(
            `/vendors`,
            formData
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
     * Delete vendor profile (Admin only)
     */
    static async deleteVendor(vendorId: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/vendors/${vendorId}`);
    }
}
