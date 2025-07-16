"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Building,
    Calendar,
    DollarSign,
    FileText,
    Users,
    Clock,
    ArrowLeft,
    Download,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Award,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccountTypeGuard } from "@/components/auth/AccountTypeGuard";
import { ApplicationForm, EditContractDialog } from "@/components/contracts";
import { contractService } from "@/lib/services/contract";
import { FileService } from "@/lib/services/file";
import {
    Contract,
    ContractStatus,
    ContractApplicationStatus,
} from "@/lib/types/contract";
import { AccountType, RoleName } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

const statusColors = {
    [ContractStatus.OPEN]: "bg-green-500",
    [ContractStatus.IN_PROGRESS]: "bg-blue-500",
    [ContractStatus.AWARDED]: "bg-purple-500",
    [ContractStatus.CLOSED]: "bg-gray-500",
};

const applicationStatusColors = {
    [ContractApplicationStatus.SUBMITTED]: "bg-blue-100 text-blue-800",
    [ContractApplicationStatus.REVIEWED]: "bg-yellow-100 text-yellow-800",
    [ContractApplicationStatus.ACCEPTED]: "bg-green-100 text-green-800",
    [ContractApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
};

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = params.id as string;

    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const isAdmin = user?.accountType === AccountType.ADMIN;
    const isVendor = user?.accountType === AccountType.VENDOR;
    const isEmployee = user?.accountType === AccountType.EMPLOYEE;

    const loadContract = useCallback(async () => {
        try {
            setLoading(true);
            const contractData = await contractService.getContract(contractId);
            setContract(contractData);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to load contract";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            router.push("/contracts");
        } finally {
            setLoading(false);
        }
    }, [contractId, toast, router]);

    useEffect(() => {
        loadContract();
    }, [contractId, loadContract]);

    const handleEditSuccess = () => {
        loadContract();
        toast({
            title: "Success",
            description: "Contract updated successfully",
        });
    };

    const handleDeleteContract = async () => {
        if (!contract) return;

        if (
            !confirm(
                "Are you sure you want to delete this contract? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setActionLoading("delete");
            await contractService.deleteContract(contract._id);
            toast({
                title: "Success",
                description: "Contract deleted successfully",
            });
            router.push("/contracts");
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to delete contract";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleApplicationSuccess = () => {
        loadContract();
        toast({
            title: "Success",
            description: "Application submitted successfully",
        });
    };

    const handleUpdateApplicationStatus = async (
        applicationId: string,
        status: ContractApplicationStatus
    ) => {
        try {
            setActionLoading(applicationId);
            await contractService.updateApplicationStatus(
                contractId,
                applicationId,
                { status }
            );
            await loadContract();
            toast({
                title: "Success",
                description: `Application ${status.toLowerCase()} successfully`,
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to update application";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleAwardContract = async (applicationId: string) => {
        try {
            setActionLoading(`award-${applicationId}`);
            await contractService.awardContract(contractId, { applicationId });
            await loadContract();
            toast({
                title: "Success",
                description: "Contract awarded successfully",
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to award contract";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadDocument = async (
        documentId: string,
        index: number
    ) => {
        try {
            setActionLoading(`download-${documentId}`);
            await FileService.triggerDownload(
                documentId,
                `contract-document-${index + 1}.pdf`
            );
            toast({
                title: "Success",
                description: "Document downloaded successfully",
            });
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to download document";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const hasApplied = contract?.applications.some(
        (app) => app.userId === user?._id
    );
    const userApplication = contract?.applications.find(
        (app) => app.userId === user?._id
    );
    const isDeadlineApproaching =
        contract?.deadline &&
        new Date(contract.deadline) <
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">
                        Loading contract...
                    </span>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Contract not found
                    </h3>
                    <Button onClick={() => router.push("/contracts")}>
                        Back to Contracts
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute
            requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.VENDOR]}
        >
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {contract.title}
                            </h1>
                            <div className="flex items-center space-x-4 mt-2">
                                <Badge
                                    className={`${
                                        statusColors[contract.status]
                                    } text-white`}
                                >
                                    {contract.status}
                                </Badge>
                                {contract.deadline && (
                                    <div
                                        className={`text-sm flex items-center ${
                                            isDeadlineApproaching
                                                ? "text-red-600 font-medium"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Due{" "}
                                        {formatDistanceToNow(
                                            new Date(contract.deadline),
                                            { addSuffix: true }
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {isVendor &&
                            contract.status === ContractStatus.OPEN &&
                            !hasApplied && (
                                <Button
                                    onClick={() =>
                                        setApplicationDialogOpen(true)
                                    }
                                    disabled={
                                        contract.deadline &&
                                        new Date(contract.deadline) < new Date()
                                    }
                                >
                                    Apply for Contract
                                </Button>
                            )}

                        <AccountTypeGuard
                            requiredAccountTypes={[AccountType.ADMIN]}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditDialogOpen(true)}
                                disabled={actionLoading === "delete"}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteContract}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading === "delete" ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Delete
                            </Button>
                        </AccountTypeGuard>
                    </div>
                </div>

                {/* Vendor Application Status */}
                {isVendor && hasApplied && userApplication && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">
                                        Your Application Status
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Submitted{" "}
                                        {formatDistanceToNow(
                                            new Date(
                                                userApplication.applicationDate
                                            ),
                                            { addSuffix: true }
                                        )}
                                    </p>
                                </div>
                                <Badge
                                    className={
                                        applicationStatusColors[
                                            userApplication.status
                                        ]
                                    }
                                >
                                    {userApplication.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {contract.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        {contract.documents &&
                            contract.documents.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Contract Documents
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {contract.documents.map(
                                                (doc, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-2 border rounded"
                                                    >
                                                        <div className="flex items-center">
                                                            <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                                            <span className="text-sm">
                                                                Document{" "}
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDownloadDocument(
                                                                    doc,
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                `download-${doc}`
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `download-${doc}` ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Download className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Applications (Admin/Employee View) */}
                        {(isAdmin || isEmployee) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Applications (
                                        {contract.applications.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {contract.applications.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            No applications received yet
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {contract.applications.map(
                                                (application) => (
                                                    <div
                                                        key={application._id}
                                                        className="border rounded p-4"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="font-medium">
                                                                    Vendor
                                                                    Application
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    Submitted{" "}
                                                                    {format(
                                                                        new Date(
                                                                            application.applicationDate
                                                                        ),
                                                                        "PPp"
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                className={
                                                                    applicationStatusColors[
                                                                        application
                                                                            .status
                                                                    ]
                                                                }
                                                            >
                                                                {
                                                                    application.status
                                                                }
                                                            </Badge>
                                                        </div>

                                                        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                                                            {
                                                                application.proposalDetails
                                                            }
                                                        </p>

                                                        {application.documents &&
                                                            application
                                                                .documents
                                                                .length > 0 && (
                                                                <p className="text-xs text-gray-500 mb-3">
                                                                    {
                                                                        application
                                                                            .documents
                                                                            .length
                                                                    }{" "}
                                                                    supporting
                                                                    documents
                                                                    attached
                                                                </p>
                                                            )}

                                                        {isAdmin && (
                                                            <>
                                                                {application.status ===
                                                                    ContractApplicationStatus.SUBMITTED && (
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                handleUpdateApplicationStatus(
                                                                                    application._id!,
                                                                                    ContractApplicationStatus.ACCEPTED
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                application._id
                                                                            }
                                                                        >
                                                                            {actionLoading ===
                                                                            application._id ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                            )}
                                                                            Accept
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                handleUpdateApplicationStatus(
                                                                                    application._id!,
                                                                                    ContractApplicationStatus.REJECTED
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                application._id
                                                                            }
                                                                        >
                                                                            {actionLoading ===
                                                                            application._id ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                            )}
                                                                            Reject
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {application.status ===
                                                                    ContractApplicationStatus.ACCEPTED &&
                                                                    contract.status ===
                                                                        ContractStatus.OPEN && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleAwardContract(
                                                                                    application._id!
                                                                                )
                                                                            }
                                                                            disabled={actionLoading?.startsWith(
                                                                                "award-"
                                                                            )}
                                                                        >
                                                                            {actionLoading ===
                                                                            `award-${application._id}` ? (
                                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                            ) : (
                                                                                <Award className="w-4 h-4 mr-1" />
                                                                            )}
                                                                            Award
                                                                            Contract
                                                                        </Button>
                                                                    )}
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contract Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contract Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {contract.budget && (
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Budget
                                            </p>
                                            <p className="font-medium">
                                                $
                                                {contract.budget.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {contract.deadline && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Deadline
                                            </p>
                                            <p className="font-medium">
                                                {format(
                                                    new Date(contract.deadline),
                                                    "PPP"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Applications
                                        </p>
                                        <p className="font-medium">
                                            {contract.applications.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Created
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(contract.createdAt),
                                                "PPP"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Created By
                                        </p>
                                        <p className="font-medium">
                                            {contract.createdBy.firstName}{" "}
                                            {contract.createdBy.lastName}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href="/contracts">
                                        <Building className="w-4 h-4 mr-2" />
                                        View All Contracts
                                    </Link>
                                </Button>

                                {isVendor && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href="/contracts/my-applications">
                                            <FileText className="w-4 h-4 mr-2" />
                                            My Applications
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <ApplicationForm
                contractId={contractId}
                contractTitle={contract.title}
                open={applicationDialogOpen}
                onOpenChange={setApplicationDialogOpen}
                onSuccess={handleApplicationSuccess}
            />

            <EditContractDialog
                contract={contract}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSuccess={handleEditSuccess}
            />
        </ProtectedRoute>
    );
}
