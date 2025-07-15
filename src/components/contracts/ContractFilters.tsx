import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { ContractStatus } from "@/lib/types/contract";

interface ContractFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: ContractStatus | "all";
    onStatusChange: (value: ContractStatus | "all") => void;
    showActiveOnly?: boolean;
    onShowActiveOnlyChange?: (value: boolean) => void;
    onClearFilters: () => void;
}

const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: ContractStatus.OPEN, label: "Open" },
    { value: ContractStatus.IN_PROGRESS, label: "In Progress" },
    { value: ContractStatus.AWARDED, label: "Awarded" },
    { value: ContractStatus.CLOSED, label: "Closed" },
];

export function ContractFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    showActiveOnly = false,
    onShowActiveOnlyChange,
    onClearFilters,
}: ContractFiltersProps) {
    const hasActiveFilters =
        searchTerm || statusFilter !== "all" || showActiveOnly;

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </h3>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="text-gray-600"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <Label htmlFor="search">Search Contracts</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                id="search"
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusChange(
                                    e.target.value as ContractStatus | "all"
                                )
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Only Toggle */}
                    {onShowActiveOnlyChange && (
                        <div>
                            <Label htmlFor="activeOnly">Quick Filter</Label>
                            <div className="flex items-center space-x-2 mt-2">
                                <input
                                    id="activeOnly"
                                    type="checkbox"
                                    checked={showActiveOnly}
                                    onChange={(e) =>
                                        onShowActiveOnlyChange(e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label
                                    htmlFor="activeOnly"
                                    className="text-sm font-normal"
                                >
                                    Show open contracts only
                                </Label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                            Active filters:
                        </span>
                        {searchTerm && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                Search: &quot;{searchTerm}&quot;
                            </span>
                        )}
                        {statusFilter !== "all" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Status:{" "}
                                {
                                    statusOptions.find(
                                        (o) => o.value === statusFilter
                                    )?.label
                                }
                            </span>
                        )}
                        {showActiveOnly && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                Open contracts only
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
