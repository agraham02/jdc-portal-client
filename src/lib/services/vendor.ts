import { apiClient } from "@/lib/api";
import { User } from "@/lib/types/auth";

export interface VendorData {
    userId: string;
    companyName: string;
    contactName?: string;
    website?: string;
    servicesOffered?: string[];
    notes?: string;
}

export interface Vendor extends VendorData {
    _id: string;
    user: User;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVendorRequest {
    // User fields
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    contactEmail?: string;
    contactPhone?: string;

    // Vendor-specific fields
    companyName: string;
    contactName?: string;
    website?: string;
    servicesOffered?: string[];
    notes?: string;
}

export interface UpdateVendorRequest {
    // User fields
    firstName?: string;
    lastName?: string;
    contactEmail?: string;
    contactPhone?: string;

    // Vendor-specific fields
    companyName?: string;
    contactName?: string;
    website?: string;
    servicesOffered?: string[];
    notes?: string;
}

export interface VendorListResponse {
    data: Vendor[];
    total: number;
    page: number;
    limit: number;
}

export interface VendorResponse {
    data: Vendor;
    message?: string;
}

export class VendorService {
    /**
     * Get all vendors with pagination
     */
    static async getVendors(page = 1, limit = 10): Promise<VendorListResponse> {
        return apiClient.get<VendorListResponse>(
            `/vendors?page=${page}&limit=${limit}`
        );
    }

    /**
     * Get pending vendors (awaiting approval)
     */
    static async getPendingVendors(): Promise<VendorListResponse> {
        return apiClient.get<VendorListResponse>(`/vendors/pending`);
    }

    /**
     * Get active vendors only
     */
    static async getActiveVendors(
        page = 1,
        limit = 10
    ): Promise<VendorListResponse> {
        return apiClient.get<VendorListResponse>(
            `/vendors/active?page=${page}&limit=${limit}`
        );
    }

    /**
     * Get a single vendor by ID
     */
    static async getVendor(vendorId: string): Promise<VendorResponse> {
        return apiClient.get<VendorResponse>(`/vendors/${vendorId}`);
    }

    /**
     * Create a new vendor account
     */
    static async createVendor(
        vendorData: CreateVendorRequest
    ): Promise<VendorResponse> {
        return apiClient.post<VendorResponse>(`/vendors`, vendorData);
    }

    /**
     * Update vendor information
     */
    static async updateVendor(
        vendorId: string,
        vendorData: UpdateVendorRequest
    ): Promise<VendorResponse> {
        return apiClient.patch<VendorResponse>(
            `/vendors/${vendorId}`,
            vendorData
        );
    }

    /**
     * Approve a pending vendor
     */
    static async approveVendor(vendorId: string): Promise<VendorResponse> {
        return apiClient.patch<VendorResponse>(
            `/vendors/${vendorId}/approve`,
            {}
        );
    }

    /**
     * Reject a pending vendor
     */
    static async rejectVendor(
        vendorId: string,
        reason?: string
    ): Promise<VendorResponse> {
        return apiClient.patch<VendorResponse>(`/vendors/${vendorId}/reject`, {
            reason,
        });
    }

    /**
     * Deactivate a vendor (soft delete)
     */
    static async deactivateVendor(vendorId: string): Promise<VendorResponse> {
        return apiClient.delete<VendorResponse>(`/vendors/${vendorId}`);
    }

    /**
     * Search vendors by query
     */
    static async searchVendors(
        query: string,
        page = 1,
        limit = 10
    ): Promise<VendorListResponse> {
        return apiClient.get<VendorListResponse>(
            `/vendors/search?q=${encodeURIComponent(
                query
            )}&page=${page}&limit=${limit}`
        );
    }
}
