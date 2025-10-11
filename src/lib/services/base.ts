/**
 * Abstract base service class for all API services
 * Provides common HTTP methods and patterns for service consistency
 */

import { apiClient } from "../api";
import { QueryBuilder } from "../utils/query-builder";
import { buildApiPath, type QueryParams } from "../utils/queryParams";

/**
 * Base class for all API service classes
 * All services should extend this class and use static methods
 *
 * @example
 * ```typescript
 * export class UserService extends BaseService {
 *   private static readonly BASE_PATH = '/users';
 *
 *   static async getAll(params?: QueryParams) {
 *     return this.get<User[]>(this.BASE_PATH, params);
 *   }
 *
 *   static async getById(id: string) {
 *     return this.get<User>(`${this.BASE_PATH}/${id}`);
 *   }
 *
 *   static async create(data: CreateUserDto) {
 *     return this.post<User>(this.BASE_PATH, data);
 *   }
 * }
 * ```
 */
export abstract class BaseService {
    /**
     * Perform GET request
     *
     * @param path - API endpoint path
     * @param params - Optional query parameters
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Response data
     */
    protected static async get<T>(
        path: string,
        params?: QueryParams,
        signal?: AbortSignal
    ): Promise<T> {
        const url = params ? buildApiPath(path, params) : path;
        return apiClient.get<T>(url, { signal });
    }

    /**
     * Perform POST request
     *
     * @param path - API endpoint path
     * @param data - Request body data
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Response data
     */
    protected static async post<T>(
        path: string,
        data?: unknown,
        signal?: AbortSignal
    ): Promise<T> {
        return apiClient.post<T>(path, data, { signal });
    }

    /**
     * Perform PATCH request
     *
     * @param path - API endpoint path
     * @param data - Partial update data
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Response data
     */
    protected static async patch<T>(
        path: string,
        data: unknown,
        signal?: AbortSignal
    ): Promise<T> {
        return apiClient.patch<T>(path, data, { signal });
    }

    /**
     * Perform PUT request
     *
     * @param path - API endpoint path
     * @param data - Complete resource data
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Response data
     */
    protected static async put<T>(
        path: string,
        data: unknown,
        signal?: AbortSignal
    ): Promise<T> {
        return apiClient.put<T>(path, data, { signal });
    }

    /**
     * Perform DELETE request
     *
     * @param path - API endpoint path
     * @param signal - Optional AbortSignal for request cancellation
     * @returns Response data (typically void or confirmation message)
     */
    protected static async delete<T = void>(
        path: string,
        signal?: AbortSignal
    ): Promise<T> {
        return apiClient.delete<T>(path, { signal });
    }

    /**
     * Create a QueryBuilder for fluent query construction
     *
     * @param basePath - Base API path for the query
     * @returns QueryBuilder instance
     *
     * @example
     * ```typescript
     * const url = UserService.query('/users')
     *   .where('status', 'active')
     *   .orderBy('createdAt', 'desc')
     *   .paginate({ page: 1, limit: 20 })
     *   .build();
     * ```
     */
    protected static query(basePath: string): QueryBuilder {
        return new QueryBuilder(basePath);
    }

    /**
     * Build API path with query parameters
     * Convenience wrapper around buildApiPath utility
     *
     * @param path - Base path
     * @param params - Query parameters
     * @returns Complete path with query string
     */
    protected static buildPath(path: string, params?: QueryParams): string {
        return buildApiPath(path, params);
    }
}
