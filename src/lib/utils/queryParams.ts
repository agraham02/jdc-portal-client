/**
 * Utility functions for building URL query parameters
 */

/**
 * Builds URL search parameters from an object, filtering out undefined/null values
 */
export type QueryValue =
    | string
    | number
    | boolean
    | Array<string | number | boolean>
    | null
    | undefined;
export type QueryParams = Record<string, QueryValue>;

export function buildQueryParams(params: QueryParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                // Handle arrays by joining them with commas
                searchParams.append(key, value.map((v) => String(v)).join(","));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams;
}

/**
 * Builds a query string from parameters, returning empty string if no params
 */
export function buildQueryString(params: QueryParams): string {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

/**
 * Appends query parameters to a base path
 */
export function buildApiPath(basePath: string, params?: QueryParams): string {
    if (!params) return basePath;
    const queryString = buildQueryString(params);
    return `${basePath}${queryString}`;
}
