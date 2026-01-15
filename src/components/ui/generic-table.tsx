"use client";

import {
    useEffect,
    useCallback,
    useMemo,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import type { StandardError } from "@/lib/types/errors";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Index signature allows flexible entity properties
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
export type SearchField<T extends BaseEntity> =
    | keyof T
    | ((item: T) => unknown);

export interface GenericTableConfig<T extends BaseEntity> {
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    filters?: TableFilter[];
    statusConfig?: StatusConfig;
    searchFields?: SearchField<T>[];
    defaultPageSize?: number;
    enablePagination?: boolean;
    onRowClick?: (item: T) => void;
    loadingMessage?: string;
    emptyMessage?: string;
    errorClassName?: string;
    customFilter?: (item: T, filters: Record<string, string>) => boolean;
    manualFiltering?: boolean;
    manualPagination?: boolean;
}

// Props for the GenericTable component
export interface GenericTableProps<T extends BaseEntity> {
    data: T[];
    loading: boolean;
    error: StandardError | string | null;
    config: GenericTableConfig<T>;
    onRefresh?: () => void;
    className?: string;
    state?: TableStateControls;
    totalItems?: number;
}

// Hook for managing table state
export interface TableStateSnapshot {
    page: number;
    pageSize: number;
    filters: Record<string, string>;
}

export interface TableStateControls extends TableStateSnapshot {
    setPage: Dispatch<SetStateAction<number>>;
    setPageSize: Dispatch<SetStateAction<number>>;
    updateFilter: (key: string, value: string) => void;
    resetFilters: () => void;
}

interface UseTableStateOptions {
    onChange?: (state: TableStateSnapshot) => void;
}

interface UseTableStateConfig {
    filters?: TableFilter[];
    defaultPageSize?: number;
}

export function useTableState(
    config: UseTableStateConfig,
    options: UseTableStateOptions = {}
): TableStateControls {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(config.defaultPageSize || 25);
    const [filters, setFilters] = useState<Record<string, string>>(() => {
        const initialFilters: Record<string, string> = {};
        config.filters?.forEach((filter) => {
            initialFilters[filter.key] = filter.type === "select" ? "all" : "";
        });
        return initialFilters;
    });

    const updateFilter = useCallback((key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filtering
    }, []);

    const resetFilters = useCallback(() => {
        const resetFilters: Record<string, string> = {};
        config.filters?.forEach((filter) => {
            resetFilters[filter.key] = filter.type === "select" ? "all" : "";
        });
        setFilters(resetFilters);
        setPage(1);
    }, [config.filters]);

    const snapshot: TableStateSnapshot = useMemo(
        () => ({ page, pageSize, filters }),
        [page, pageSize, filters]
    );

    const { onChange } = options;

    useEffect(() => {
        onChange?.(snapshot);
    }, [onChange, snapshot]);

    return {
        ...snapshot,
        setPage,
        setPageSize,
        updateFilter,
        resetFilters,
    };
}

// Main GenericTable component
function getSearchableValue(rawValue: unknown): string | null {
    if (rawValue === undefined || rawValue === null) return null;
    if (
        typeof rawValue === "string" ||
        typeof rawValue === "number" ||
        typeof rawValue === "boolean"
    ) {
        return String(rawValue);
    }
    if (Array.isArray(rawValue)) {
        return rawValue
            .map((value) => getSearchableValue(value))
            .filter(Boolean)
            .join(" ");
    }
    return null;
}

function filterTableData<T extends BaseEntity>(
    data: T[],
    filters: Record<string, string>,
    searchFields: SearchField<T>[],
    tableFilters: TableFilter[],
    customFilter?: (item: T, filters: Record<string, string>) => boolean
): T[] {
    const searchFilter = filters.search?.trim() ?? "";
    const loweredQuery = searchFilter.toLowerCase();

    return data.filter((item) => {
        if (searchFilter && searchFields.length > 0) {
            const searchMatch = searchFields.some((field) => {
                const rawValue =
                    typeof field === "function" ? field(item) : item[field];
                const searchValue = getSearchableValue(rawValue);
                if (!searchValue) return false;
                return searchValue.toLowerCase().includes(loweredQuery);
            });
            if (!searchMatch) return false;
        }

        if (customFilter && !customFilter(item, filters)) {
            return false;
        }

        return (
            tableFilters.every((filter) => {
                if (filter.type === "search") return true;

                const filterValue = filters[filter.key];
                if (!filterValue || filterValue === "all") return true;

                const itemValue = item[filter.key];
                return itemValue === filterValue;
            }) ?? true
        );
    });
}

interface TableBodyArgs<T extends BaseEntity> {
    loading: boolean;
    config: GenericTableConfig<T>;
    filteredData: T[];
    pageItems: T[];
    renderCell: (column: TableColumn<T>, item: T) => ReactNode;
    getVisibleActions: (item: T) => TableAction<T>[];
    handleAction: (action: TableAction<T>, item: T) => Promise<void> | void;
    busyIds: Set<string>;
}

function buildTableBody<T extends BaseEntity>({
    loading,
    config,
    filteredData,
    pageItems,
    renderCell,
    getVisibleActions,
    handleAction,
    busyIds,
}: TableBodyArgs<T>): ReactNode {
    if (loading) {
        return (
            <TableRow>
                <TableCell
                    colSpan={
                        config.columns.length + (config.actions?.length ? 1 : 0)
                    }
                    className="text-sm text-muted-foreground text-center py-8"
                >
                    {config.loadingMessage || "Loading…"}
                </TableCell>
            </TableRow>
        );
    }

    if (filteredData.length === 0) {
        return (
            <TableRow>
                <TableCell
                    colSpan={
                        config.columns.length + (config.actions?.length ? 1 : 0)
                    }
                    className="text-sm text-muted-foreground text-center py-8"
                >
                    {config.emptyMessage || "No items found"}
                </TableCell>
            </TableRow>
        );
    }

    return pageItems.map((item) => {
        const visibleActions = getVisibleActions(item);
        return (
            <TableRow
                key={item._id}
                className={
                    config.onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                }
                onClick={() => config.onRowClick?.(item)}
            >
                {config.columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                        {renderCell(column, item)}
                    </TableCell>
                ))}
                {config.actions && config.actions.length > 0 && (
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
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
                                {visibleActions.map((action) => {
                                    const disabled =
                                        busyIds.has(item._id) ||
                                        Boolean(action.disabled?.(item));

                                    if (action.render) {
                                        return (
                                            <DropdownMenuItem
                                                key={action.key}
                                                onSelect={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                {action.render(item)}
                                            </DropdownMenuItem>
                                        );
                                    }

                                    return (
                                        <DropdownMenuItem
                                            key={action.key}
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (disabled) return;
                                                handleAction(action, item);
                                            }}
                                            disabled={disabled}
                                        >
                                            {action.label}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                )}
            </TableRow>
        );
    });
}

export function GenericTable<T extends BaseEntity>({
    data,
    loading,
    error,
    config,
    onRefresh,
    className = "",
    state,
    totalItems,
}: Readonly<GenericTableProps<T>>) {
    const internalState = useTableState(config);
    const { page, setPage, pageSize, setPageSize, filters, updateFilter } =
        state ?? internalState;

    const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

    const searchFields = useMemo(
        () => config.searchFields ?? [],
        [config.searchFields]
    );
    const tableFilters = useMemo(() => config.filters ?? [], [config.filters]);
    const manualFiltering = config.manualFiltering ?? false;
    const manualPagination = config.manualPagination ?? false;
    const enablePagination = config.enablePagination !== false;
    const customFilter = config.customFilter;

    // Filter and search data
    const filteredData = useMemo(() => {
        if (manualFiltering) {
            return data;
        }

        return filterTableData(
            data,
            filters,
            searchFields,
            tableFilters,
            customFilter
        );
    }, [
        data,
        filters,
        manualFiltering,
        searchFields,
        tableFilters,
        customFilter,
    ]);

    // Pagination
    const total = manualPagination
        ? totalItems ?? filteredData.length
        : filteredData.length;
    const totalPages = enablePagination
        ? Math.max(1, Math.ceil(total / pageSize))
        : 1;
    const currentPage = Math.min(page, totalPages);
    const start = enablePagination ? (currentPage - 1) * pageSize : 0;

    let pageItems = filteredData;
    if (enablePagination) {
        pageItems = manualPagination
            ? data
            : filteredData.slice(start, start + pageSize);
    }

    let startDisplay = 0;
    let endDisplay = 0;
    if (total > 0) {
        if (enablePagination) {
            startDisplay = Math.min(total, start + 1);
            endDisplay = Math.min(total, start + pageItems.length);
        } else {
            startDisplay = 1;
            endDisplay = pageItems.length;
        }
    }

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

    const tableBody = buildTableBody({
        loading,
        config,
        filteredData,
        pageItems,
        renderCell,
        getVisibleActions,
        handleAction,
        busyIds,
    });

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filters */}
            {tableFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    {tableFilters.map((filter) => (
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
                    {enablePagination && (
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
                    {typeof error === "string"
                        ? error
                        : error.message || "An error occurred"}
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
                    <TableBody>{tableBody}</TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {enablePagination && total > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Showing {startDisplay}-{endDisplay} of {total}
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
