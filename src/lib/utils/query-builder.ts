/**
 * Fluent TypeScript QueryBuilder for type-safe query parameter construction
 * Integrates with existing buildApiPath utility
 */

import { QueryParams, buildApiPath } from "./queryParams";

export type SortDirection = "asc" | "desc";
export type FilterOperator =
    | "eq"
    | "ne"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "like"
    | "in";

interface WhereCondition {
    field: string;
    operator?: FilterOperator;
    value: string | number | boolean | Array<string | number>;
}

interface OrderByCondition {
    field: string;
    direction: SortDirection;
}

interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

/**
 * Fluent query builder for constructing API URLs with filters, sorting, and pagination
 *
 * @example
 * ```typescript
 * const url = new QueryBuilder('/users')
 *   .where('status', 'active')
 *   .where('role', 'in', ['admin', 'user'])
 *   .orderBy('createdAt', 'desc')
 *   .paginate({ page: 1, limit: 20 })
 *   .build();
 * // Result: /users?status=active&role=admin,user&sort=createdAt&order=desc&page=1&limit=20
 * ```
 */
export class QueryBuilder {
    private basePath: string;
    private conditions: WhereCondition[] = [];
    private ordering: OrderByCondition[] = [];
    private pagination: PaginationParams = {};
    private additionalParams: QueryParams = {};

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    /**
     * Add a where condition to filter results
     *
     * @param field - Field name to filter on
     * @param operatorOrValue - Operator (eq, ne, gt, lt, etc.) or direct value (defaults to 'eq')
     * @param value - Value to compare (required if operator is provided)
     *
     * @example
     * ```typescript
     * builder.where('status', 'active')  // status=active
     * builder.where('age', 'gte', 18)    // age__gte=18
     * builder.where('role', 'in', ['admin', 'user'])  // role=admin,user
     * ```
     */
    where(
        field: string,
        operatorOrValue:
            | FilterOperator
            | string
            | number
            | boolean
            | Array<string | number>,
        value?: string | number | boolean | Array<string | number>
    ): this {
        if (value !== undefined) {
            // Three-argument form: field, operator, value
            this.conditions.push({
                field,
                operator: operatorOrValue as FilterOperator,
                value,
            });
        } else {
            // Two-argument form: field, value (defaults to 'eq')
            this.conditions.push({
                field,
                operator: "eq",
                value: operatorOrValue as
                    | string
                    | number
                    | boolean
                    | Array<string | number>,
            });
        }
        return this;
    }

    /**
     * Add ordering to results
     *
     * @param field - Field name to sort by
     * @param direction - Sort direction ('asc' or 'desc')
     *
     * @example
     * ```typescript
     * builder.orderBy('createdAt', 'desc')  // sort=createdAt&order=desc
     * builder.orderBy('name', 'asc')        // sort=name&order=asc
     * ```
     */
    orderBy(field: string, direction: SortDirection = "asc"): this {
        this.ordering.push({ field, direction });
        return this;
    }

    /**
     * Add pagination parameters
     *
     * @param params - Pagination params (page/limit or offset/limit)
     *
     * @example
     * ```typescript
     * builder.paginate({ page: 2, limit: 20 })      // page=2&limit=20
     * builder.paginate({ offset: 40, limit: 20 })   // offset=40&limit=20
     * ```
     */
    paginate(params: PaginationParams): this {
        this.pagination = { ...this.pagination, ...params };
        return this;
    }

    /**
     * Add arbitrary additional query parameters
     *
     * @param params - Additional query parameters as key-value pairs
     *
     * @example
     * ```typescript
     * builder.params({ search: 'john', includeInactive: true })
     * ```
     */
    params(params: QueryParams): this {
        this.additionalParams = { ...this.additionalParams, ...params };
        return this;
    }

    /**
     * Build the final URL with all query parameters
     * Uses the existing buildApiPath utility for consistency
     *
     * @returns Complete URL path with query string
     */
    build(): string {
        const queryParams: QueryParams = { ...this.additionalParams };

        // Add where conditions
        // Support Django-style filtering (field__operator=value) or simple equality
        this.conditions.forEach(({ field, operator, value }) => {
            if (operator === "eq" || !operator) {
                // Simple equality: field=value
                queryParams[field] = value;
            } else if (operator === "in") {
                // Array values: field=value1,value2
                queryParams[field] = value;
            } else {
                // Operator-based: field__operator=value
                queryParams[`${field}__${operator}`] = value;
            }
        });

        // Add ordering (common patterns: sort/order or sortBy/sortOrder)
        if (this.ordering.length > 0) {
            // Take first ordering (extend later for multi-field sorting if needed)
            const { field, direction } = this.ordering[0];
            queryParams["sort"] = field;
            queryParams["order"] = direction;
        }

        // Add pagination
        if (this.pagination.page !== undefined) {
            queryParams["page"] = this.pagination.page;
        }
        if (this.pagination.limit !== undefined) {
            queryParams["limit"] = this.pagination.limit;
        }
        if (this.pagination.offset !== undefined) {
            queryParams["offset"] = this.pagination.offset;
        }

        return buildApiPath(this.basePath, queryParams);
    }

    /**
     * Reset the builder to initial state
     */
    reset(): this {
        this.conditions = [];
        this.ordering = [];
        this.pagination = {};
        this.additionalParams = {};
        return this;
    }

    /**
     * Clone the current builder state
     * Useful for creating variations without mutating the original
     */
    clone(): QueryBuilder {
        const cloned = new QueryBuilder(this.basePath);
        cloned.conditions = [...this.conditions];
        cloned.ordering = [...this.ordering];
        cloned.pagination = { ...this.pagination };
        cloned.additionalParams = { ...this.additionalParams };
        return cloned;
    }
}
