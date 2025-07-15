"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Building,
    Calendar,
    DollarSign,
    Eye,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccountTypeGuard } from "@/components/auth/AccountTypeGuard";
import { contractService } from "@/lib/services/contract";
import { Contract, ContractApplicationStatus } from "@/lib/types/contract";
import { AccountType, RoleName } from "@/lib/types/auth";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

const applicationStatusColors = {
    [ContractApplicationStatus.SUBMITTED]: "bg-blue-100 text-blue-800",
    [ContractApplicationStatus.REVIEWED]: "bg-yellow-100 text-yellow-800",
    [ContractApplicationStatus.ACCEPTED]: "bg-green-100 text-green-800",
    [ContractApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
};

const applicationStatusLabels = {
    [ContractApplicationStatus.SUBMITTED]: "Submitted",
    [ContractApplicationStatus.REVIEWED]: "Under Review",
    [ContractApplicationStatus.ACCEPTED]: "Accepted",
    [ContractApplicationStatus.REJECTED]: "Rejected",
};

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const { toast } = useToast();

    const limit = 12;

    const loadApplications = async () => {
        try {
            setLoading(true);
            const response = await contractService.getMyApplications({
                page,
                limit,
            });
            setApplications(response.data);
            setTotal(response.total);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to load applications";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, [page]); // loadApplications dependency removed as it's stable

    if (loading && page === 1) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">
                        Loading applications...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRoles={[RoleName.VENDOR]}>
            <AccountTypeGuard requiredAccountTypes={[AccountType.VENDOR]}>
                <div className="container mx-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                <FileText className="mr-3 w-8 h-8 text-blue-600" />
                                My Applications
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Track the status of your contract applications
                            </p>
                        </div>

                        <Button asChild variant="outline">
                            <Link href="/contracts">
                                <Building className="w-4 h-4 mr-2" />
                                Browse Contracts
                            </Link>
                        </Button>
                    </div>

                    {/* Empty State */}
                    {!loading && applications.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No applications yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                You haven&apos;t applied to any contracts yet.
                                Browse available contracts to get started.
                            </p>
                            <Button asChild>
                                <Link href="/contracts">
                                    <Building className="w-4 h-4 mr-2" />
                                    Browse Contracts
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Applications List */}
                    {!loading && applications.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {applications.map((contract) => {
                                    // Find user's application for this contract
                                    const userApplication =
                                        contract.applications[0]; // Since this is filtered by user

                                    return (
                                        <Card
                                            key={contract._id}
                                            className="hover:shadow-lg transition-shadow"
                                        >
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg font-semibold mb-2">
                                                            {contract.title}
                                                        </CardTitle>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge
                                                                className={
                                                                    applicationStatusColors[
                                                                        userApplication
                                                                            .status
                                                                    ]
                                                                }
                                                            >
                                                                {
                                                                    applicationStatusLabels[
                                                                        userApplication
                                                                            .status
                                                                    ]
                                                                }
                                                            </Badge>
                                                            <span className="text-sm text-gray-500">
                                                                Applied{" "}
                                                                {formatDistanceToNow(
                                                                    new Date(
                                                                        userApplication.applicationDate
                                                                    ),
                                                                    {
                                                                        addSuffix:
                                                                            true,
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <p className="text-gray-700 text-sm line-clamp-2">
                                                    {contract.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                    {contract.budget && (
                                                        <div className="flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-2" />
                                                            <span>
                                                                $
                                                                {contract.budget.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {contract.deadline && (
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>
                                                                {format(
                                                                    new Date(
                                                                        contract.deadline
                                                                    ),
                                                                    "MMM dd, yyyy"
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Application Details Preview */}
                                                <div className="bg-gray-50 rounded p-3">
                                                    <h4 className="text-sm font-medium mb-2">
                                                        Your Proposal
                                                    </h4>
                                                    <p className="text-xs text-gray-700 line-clamp-3">
                                                        {
                                                            userApplication.proposalDetails
                                                        }
                                                    </p>
                                                    {userApplication.documents &&
                                                        userApplication
                                                            .documents.length >
                                                            0 && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {
                                                                    userApplication
                                                                        .documents
                                                                        .length
                                                                }{" "}
                                                                documents
                                                                attached
                                                            </p>
                                                        )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-between items-center pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/contracts/${contract._id}`}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Contract
                                                        </Link>
                                                    </Button>

                                                    {/* Status-specific information */}
                                                    {userApplication.status ===
                                                        ContractApplicationStatus.SUBMITTED && (
                                                        <span className="text-xs text-blue-600 font-medium">
                                                            Awaiting review
                                                        </span>
                                                    )}
                                                    {userApplication.status ===
                                                        ContractApplicationStatus.REVIEWED && (
                                                        <span className="text-xs text-yellow-600 font-medium">
                                                            Under evaluation
                                                        </span>
                                                    )}
                                                    {userApplication.status ===
                                                        ContractApplicationStatus.ACCEPTED && (
                                                        <span className="text-xs text-green-600 font-medium">
                                                            Application
                                                            approved!
                                                        </span>
                                                    )}
                                                    {userApplication.status ===
                                                        ContractApplicationStatus.REJECTED && (
                                                        <span className="text-xs text-red-600 font-medium">
                                                            Not selected
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {total > limit && (
                                <div className="flex items-center justify-center space-x-2 pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={page === 1 || loading}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {page} of{" "}
                                        {Math.ceil(total / limit)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={
                                            page >= Math.ceil(total / limit) ||
                                            loading
                                        }
                                    >
                                        {loading && (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        )}
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Information Card */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                                Application Status Guide
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center">
                                    <Badge className="bg-blue-100 text-blue-800 mr-2">
                                        Submitted
                                    </Badge>
                                    <span className="text-blue-700">
                                        Application received and pending review
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Badge className="bg-yellow-100 text-yellow-800 mr-2">
                                        Under Review
                                    </Badge>
                                    <span className="text-blue-700">
                                        Application is being evaluated
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Badge className="bg-green-100 text-green-800 mr-2">
                                        Accepted
                                    </Badge>
                                    <span className="text-blue-700">
                                        You&apos;re in consideration for award
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Badge className="bg-red-100 text-red-800 mr-2">
                                        Rejected
                                    </Badge>
                                    <span className="text-blue-700">
                                        Application was not selected
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AccountTypeGuard>
        </ProtectedRoute>
    );
}
