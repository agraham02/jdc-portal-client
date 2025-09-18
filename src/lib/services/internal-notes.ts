import { apiClient } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types/api";

export interface InternalNote {
    _id: string;
    content: string;
    contractId: string;
    authorId: string;
    author: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateInternalNoteDto {
    content: string;
    contractId: string;
}

export type InternalNotesResponse = PaginatedResponse<InternalNote>;

export class InternalNotesService {
    /**
     * List internal notes with pagination and filtering
     */
    static async list(params?: {
        page?: number;
        pageSize?: number;
        contractId?: string;
        authorId?: string;
    }): Promise<InternalNotesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());
        if (params?.contractId)
            queryParams.append("contractId", params.contractId);
        if (params?.authorId) queryParams.append("authorId", params.authorId);

        const query = queryParams.toString();
        return apiClient.get<InternalNotesResponse>(
            `/internal-notes${query ? `?${query}` : ""}`
        );
    }

    /**
     * Create an internal note
     */
    static async create(data: CreateInternalNoteDto): Promise<{
        message: string;
        note: InternalNote;
    }> {
        return apiClient.post<{ message: string; note: InternalNote }>(
            "/internal-notes",
            data
        );
    }

    /**
     * Delete an internal note
     */
    static async delete(id: string): Promise<{ message: string }> {
        return apiClient.delete<{ message: string }>(`/internal-notes/${id}`);
    }

    /**
     * Get notes count for a contract
     */
    static async getContractNotesCount(
        contractId: string
    ): Promise<{ count: number }> {
        return apiClient.get<{ count: number }>(
            `/internal-notes/count/${contractId}`
        );
    }

    /**
     * Get notes by author
     */
    static async getByAuthor(
        authorId: string,
        params?: { page?: number; pageSize?: number }
    ): Promise<InternalNotesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.pageSize)
            queryParams.append("pageSize", params.pageSize.toString());

        const query = queryParams.toString();
        return apiClient.get<InternalNotesResponse>(
            `/internal-notes/by-author/${authorId}${query ? `?${query}` : ""}`
        );
    }
}
