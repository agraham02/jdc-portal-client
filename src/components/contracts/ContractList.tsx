"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ContractCard } from "./ContractCard";
import { Pagination } from "./Pagination";
import { Contract, ContractStatus } from "@/lib/types/contracts";
import { SearchIcon } from "lucide-react";
import { motion } from "motion/react";
import { staggerContainer } from "@/lib/animations";

interface ContractListProps {
    contracts: Contract[];
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onSearchChange?: (search: string) => void;
    onStatusChange?: (status: ContractStatus | "all") => void;
    showApplicationCount?: boolean;
    currentStatus?: ContractStatus | "all";
    currentSearch?: string;
    loading?: boolean;
    className?: string;
}

export function ContractList({
    contracts,
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onStatusChange,
    showApplicationCount = false,
    currentStatus = "all",
    currentSearch = "",
    loading = false,
    className,
}: ContractListProps) {
    const [searchInput, setSearchInput] = useState(currentSearch);
    const totalPages = Math.ceil(total / pageSize);

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && onSearchChange) {
            onSearchChange(searchInput);
        }
    }

    function handleSearchBlur() {
        if (onSearchChange && searchInput !== currentSearch) {
            onSearchChange(searchInput);
        }
    }

    return (
        <div className={`space-y-6 ${className || ""}`}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                {onSearchChange && (
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contracts..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            onBlur={handleSearchBlur}
                            className="pl-9"
                            disabled={loading}
                        />
                    </div>
                )}

                {/* Status Filter */}
                {onStatusChange && (
                    <Select
                        value={currentStatus}
                        onValueChange={(value) =>
                            onStatusChange(value as ContractStatus | "all")
                        }
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value={ContractStatus.DRAFT}>
                                Draft
                            </SelectItem>
                            <SelectItem value={ContractStatus.OPEN}>
                                Open
                            </SelectItem>
                            <SelectItem value={ContractStatus.CLOSED}>
                                Closed
                            </SelectItem>
                            <SelectItem value={ContractStatus.AWARDED}>
                                Awarded
                            </SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-sm text-muted-foreground">
                        Loading contracts...
                    </p>
                </div>
            )}

            {/* Empty State */}
            {!loading && contracts.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No contracts found</p>
                    {(currentSearch || currentStatus !== "all") && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your filters
                        </p>
                    )}
                </div>
            )}

            {/* Contract Grid */}
            {!loading && contracts.length > 0 && (
                <>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {contracts.map((contract) => (
                            <ContractCard
                                key={contract._id}
                                contract={contract}
                                showApplicationCount={showApplicationCount}
                            />
                        ))}
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={total}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                            onPageSizeChange={onPageSizeChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}
