"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Building, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
    ContractCard,
    CreateContractDialog,
    ApplicationForm,
    ContractFilters,
} from "@/components/contracts";
import { contractService } from "@/lib/services/contract";
import { Contract, ContractStatus } from "@/lib/types/contract";
import { AccountType, RoleName } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<string>("");
    const [selectedContractTitle, setSelectedContractTitle] =
        useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">(
        "all"
    );
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const { toast } = useToast();
    const { user } = useAuth();

    const limit = 12;
    const isAdmin = user?.accountType === AccountType.ADMIN;
    const isVendor = user?.accountType === AccountType.VENDOR;
    const isEmployee = user?.accountType === AccountType.EMPLOYEE;

    const loadContracts = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (showActiveOnly) {
                response = await contractService.getActiveContracts();
            } else {
                response = await contractService.getContracts({
                    page,
                    limit,
                    status: statusFilter !== "all" ? statusFilter : undefined,
                });
            }

            setContracts(response.data);
            setTotal(response.total);
        } catch (error: unknown) {
            let errorMessage = "Failed to load contracts";
            
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = "Network error. Please check your connection and try again.";
                } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
                    errorMessage = "You don't have permission to view contracts.";
                } else if (error.message.includes('timeout')) {
                    errorMessage = "Request timed out. Please try again.";
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, showActiveOnly, toast]);

    useEffect(() => {
        loadContracts();
    }, [page, statusFilter, showActiveOnly, loadContracts]);

    const handleCreateSuccess = () => {
        loadContracts();
        toast({
            title: "Success",
            description: "Contract created successfully",
        });
    };

    const handleApplicationSuccess = () => {
        loadContracts();
        toast({
            title: "Success",
            description: "Application submitted successfully",
        });
    };

    const handleApply = (contractId: string) => {
        const contract = contracts.find((c) => c._id === contractId);
        if (contract) {
            setSelectedContractId(contractId);
            setSelectedContractTitle(contract.title);
            setApplicationDialogOpen(true);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setShowActiveOnly(false);
        setPage(1);
    };

    // Filter contracts based on search term
    const filteredContracts = contracts.filter((contract) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            contract.title.toLowerCase().includes(searchLower) ||
            contract.description.toLowerCase().includes(searchLower)
        );
    });

    // Check if vendor has applied to a contract
    const hasApplied = (contract: Contract) => {
        if (!isVendor || !user) return false;
        return contract.applications.some((app) => app.userId === user._id);
    };

    return (
        <ProtectedRoute
            requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR]}
        >
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <Building className="mr-3 w-8 h-8 text-blue-600" />
                            Contracts
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {isAdmin &&
                                "Manage procurement contracts and review applications"}
                            {isEmployee &&
                                "View active contracts and procurement opportunities"}
                            {isVendor &&
                                "Find and apply for contract opportunities"}
                        </p>
                    </div>

                    <PermissionGuard requiredPermissions={["contract:create"]}>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Contract
                        </Button>
                    </PermissionGuard>
                </div>

                {/* Filters */}
                <ContractFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    showActiveOnly={showActiveOnly}
                    onShowActiveOnlyChange={setShowActiveOnly}
                    onClearFilters={handleClearFilters}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">
                            Loading contracts...
                        </span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredContracts.length === 0 && (
                    <div className="text-center py-12">
                        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            showActiveOnly
                                ? "No contracts found"
                                : "No contracts available"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            showActiveOnly
                                ? "Try adjusting your filters to see more results."
                                : isAdmin
                                ? "Create your first contract to get started."
                                : "Check back later for new opportunities."}
                        </p>
                        {!searchTerm &&
                            statusFilter === "all" &&
                            !showActiveOnly &&
                            isAdmin && (
                                <Button
                                    onClick={() => setCreateDialogOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Contract
                                </Button>
                            )}
                    </div>
                )}

                {/* Contracts Grid */}
                {!loading && filteredContracts.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredContracts.map((contract) => (
                                <ContractCard
                                    key={contract._id}
                                    contract={contract}
                                    isVendor={isVendor}
                                    hasApplied={hasApplied(contract)}
                                    onApply={handleApply}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {!showActiveOnly && total > limit && (
                            <div className="flex items-center justify-center space-x-2 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {page} of {Math.ceil(total / limit)}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= Math.ceil(total / limit)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Vendor Notice */}
                {isVendor && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">
                                    Application Guidelines
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Review contract requirements carefully
                                    before applying. Applications cannot be
                                    modified once submitted. Make sure to
                                    include all relevant documents and a
                                    detailed proposal.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateContractDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />

            <ApplicationForm
                contractId={selectedContractId}
                contractTitle={selectedContractTitle}
                open={applicationDialogOpen}
                onOpenChange={setApplicationDialogOpen}
                onSuccess={handleApplicationSuccess}
            />
        </ProtectedRoute>
    );
}
