"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Base interface that all entities must implement
export interface BaseEntity {
    _id: string;
    [key: string]: any;
}

// Column configuration for the table
export interface TableColumn<T extends BaseEntity> {
    key: string;
    label: string;
    render?: (item: T) => ReactNode;
    sortable?: boolean;
    className?: string;
}

// Filter configuration
export interface TableFilter {
    key: string;
    label: string;
    type: "select" | "search";
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    className?: string;
}

// Action configuration
export interface TableAction<T extends BaseEntity> {
    key: string;
    label: string;
    variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "ghost"
        | "link";
    size?: "default" | "sm" | "lg" | "icon";
    onClick?: (item: T) => void | Promise<void>;
    disabled?: (item: T) => boolean;
    hidden?: (item: T) => boolean;
    permission?: string[];
    // Optional render function to render custom content for the action (e.g., a dialog trigger)
    render?: (item: T) => ReactNode;
}

// Status badge configuration
export interface StatusConfig {
    [status: string]: {
        variant: "default" | "secondary" | "destructive" | "outline";
        label?: string;
    };
}

// Main table configuration
export interface GenericTableConfig<T extends BaseEntity> {
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    filters?: TableFilter[];
    statusConfig?: StatusConfig;
    searchFields?: (keyof T)[];
    defaultPageSize?: number;
    enablePagination?: boolean;
    onRowClick?: (item: T) => void;
    loadingMessage?: string;
    emptyMessage?: string;
    errorClassName?: string;
    customFilter?: (item: T, filters: Record<string, string>) => boolean;
}

// Props for the GenericTable component
export interface GenericTableProps<T extends BaseEntity> {
    data: T[];
    loading: boolean;
    error: string | null;
    config: GenericTableConfig<T>;
    onRefresh?: () => void;
    className?: string;
}

// Hook for managing table state
export function useTableState(config: GenericTableConfig<any>) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(config.defaultPageSize || 25);
    const [filters, setFilters] = useState<Record<string, string>>(() => {
        const initialFilters: Record<string, string> = {};
        config.filters?.forEach((filter) => {
            initialFilters[filter.key] = filter.type === "select" ? "all" : "";
        });
        return initialFilters;
    });

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filtering
    };

    const resetFilters = () => {
        const resetFilters: Record<string, string> = {};
        config.filters?.forEach((filter) => {
            resetFilters[filter.key] = filter.type === "select" ? "all" : "";
        });
        setFilters(resetFilters);
        setPage(1);
    };

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        filters,
        updateFilter,
        resetFilters,
    };
}

// Main GenericTable component
export function GenericTable<T extends BaseEntity>({
    data,
    loading,
    error,
    config,
    onRefresh,
    className = "",
}: GenericTableProps<T>) {
    const { page, setPage, pageSize, setPageSize, filters, updateFilter } =
        useTableState(config);

    const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

    // Filter and search data
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Apply search filter
            const searchFilter = filters.search || "";
            if (searchFilter && config.searchFields) {
                const searchMatch = config.searchFields.some((field) => {
                    const value = item[field];
                    return (
                        value &&
                        String(value)
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase())
                    );
                });
                if (!searchMatch) return false;
            }

            // Apply custom filter if provided
            if (config.customFilter) {
                return config.customFilter(item, filters);
            }

            // Apply other filters
            return (
                config.filters?.every((filter) => {
                    if (filter.type === "search") return true; // Already handled above

                    const filterValue = filters[filter.key];
                    if (!filterValue || filterValue === "all") return true;

                    const itemValue = item[filter.key];
                    return itemValue === filterValue;
                }) ?? true
            );
        });
    }, [
        data,
        filters,
        config.searchFields,
        config.filters,
        config.customFilter,
    ]);

    // Pagination
    const total = filteredData.length;
    const totalPages =
        config.enablePagination !== false
            ? Math.max(1, Math.ceil(total / pageSize))
            : 1;
    const currentPage = Math.min(page, totalPages);
    const start =
        config.enablePagination !== false ? (currentPage - 1) * pageSize : 0;
    const end = config.enablePagination !== false ? start + pageSize : total;
    const pageItems =
        config.enablePagination !== false
            ? filteredData.slice(start, end)
            : filteredData;

    // Handle action clicks with loading state
    const handleAction = async (action: TableAction<T>, item: T) => {
        if (!action.onClick) return;
        setBusyIds((prev) => new Set(prev).add(item._id));
        try {
            await action.onClick(item);
        } finally {
            setBusyIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(item._id);
                return newSet;
            });
        }
    };

    const renderCell = (column: TableColumn<T>, item: T) => {
        if (column.render) {
            return column.render(item);
        }

        const value = item[column.key];

        // Special handling for status with badge
        if (column.key === "status" && config.statusConfig) {
            const statusConfig = config.statusConfig[value] || {
                variant: "outline" as const,
            };
            return (
                <Badge variant={statusConfig.variant}>
                    {statusConfig.label || value}
                </Badge>
            );
        }

        return value;
    };

    const getVisibleActions = (item: T) => {
        return config.actions?.filter((action) => !action.hidden?.(item)) || [];
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filters */}
            {config.filters && config.filters.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    {config.filters.map((filter) => (
                        <div key={filter.key}>
                            {filter.type === "search" ? (
                                <Input
                                    placeholder={
                                        filter.placeholder ||
                                        `Search ${filter.label.toLowerCase()}`
                                    }
                                    value={filters[filter.key] || ""}
                                    onChange={(e) =>
                                        updateFilter(filter.key, e.target.value)
                                    }
                                    className={filter.className || "w-64"}
                                    aria-label={filter.label}
                                />
                            ) : (
                                <Select
                                    value={filters[filter.key] || "all"}
                                    onValueChange={(value) =>
                                        updateFilter(filter.key, value)
                                    }
                                >
                                    <SelectTrigger
                                        className={filter.className || "w-40"}
                                    >
                                        <SelectValue
                                            placeholder={filter.label}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All {filter.label.toLowerCase()}
                                        </SelectItem>
                                        {filter.options?.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}

                    {/* Page size selector */}
                    {config.enablePagination !== false && (
                        <Select
                            value={String(pageSize)}
                            onValueChange={(v) => {
                                setPageSize(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-28">
                                <SelectValue placeholder="Page size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            )}

            {/* Error display */}
            {error && (
                <div
                    className={config.errorClassName || "text-sm text-red-600"}
                >
                    {error}
                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            className="ml-2"
                        >
                            Retry
                        </Button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {config.columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={column.className}
                                >
                                    {column.label}
                                </TableHead>
                            ))}
                            {config.actions && config.actions.length > 0 && (
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        config.columns.length +
                                        (config.actions?.length ? 1 : 0)
                                    }
                                    className="text-sm text-muted-foreground text-center py-8"
                                >
                                    {config.loadingMessage || "Loading…"}
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        config.columns.length +
                                        (config.actions?.length ? 1 : 0)
                                    }
                                    className="text-sm text-muted-foreground text-center py-8"
                                >
                                    {config.emptyMessage || "No items found"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            pageItems.map((item) => {
                                const visibleActions = getVisibleActions(item);
                                return (
                                    <TableRow
                                        key={item._id}
                                        className={
                                            config.onRowClick
                                                ? "cursor-pointer hover:bg-muted/50"
                                                : ""
                                        }
                                        onClick={() =>
                                            config.onRowClick?.(item)
                                        }
                                    >
                                        {config.columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={column.className}
                                            >
                                                {renderCell(column, item)}
                                            </TableCell>
                                        ))}
                                        {config.actions &&
                                            config.actions.length > 0 && (
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                aria-label="More actions"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            {visibleActions.map(
                                                                (action) => {
                                                                    const disabled =
                                                                        busyIds.has(
                                                                            item._id
                                                                        ) ||
                                                                        Boolean(
                                                                            action.disabled?.(
                                                                                item
                                                                            )
                                                                        );

                                                                    // If action provides a custom render, render it and don't wire onSelect
                                                                    if (
                                                                        action.render
                                                                    ) {
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    action.key
                                                                                }
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    e.stopPropagation()
                                                                                }
                                                                            >
                                                                                {action.render(
                                                                                    item
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <DropdownMenuItem
                                                                            key={
                                                                                action.key
                                                                            }
                                                                            onSelect={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                if (
                                                                                    disabled
                                                                                )
                                                                                    return;
                                                                                handleAction(
                                                                                    action,
                                                                                    item
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                disabled
                                                                            }
                                                                        >
                                                                            {
                                                                                action.label
                                                                            }
                                                                        </DropdownMenuItem>
                                                                    );
                                                                }
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {config.enablePagination !== false && total > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Showing {Math.min(total, start + 1)}-
                        {Math.min(total, end)} of {total}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <div>
                            Page {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
