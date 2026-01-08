"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ContractErrorBoundary } from "@/components/common/RouteErrorBoundary";
import { Button } from "@/components/ui/button";
import {
    ContractDetail,
    ApplicationList,
    InternalNotes,
    ApplicationDetailSheet,
} from "@/components/contracts";
import {
    ContractsService,
    ApplicationsService,
    ContractNotesService,
} from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type {
    Contract,
    Application,
    ApplicationListResponse,
    InternalNoteListResponse,
} from "@/lib/types/contracts";
import { ApplicationStatus } from "@/lib/types/contracts";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import { useAuthz } from "@/lib/authz/useAuthz";
import {
    handleContractNotification,
    isContractNotification,
} from "@/lib/utils/contract-notifications";
import { useApi, useConditionalApi } from "@/lib/hooks/useApi";
import { useErrorState } from "@/lib/hooks/useErrorState";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";

export default function ContractDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { notifications } = useNotificationsCtx();
    const { hasAny } = useAuthz();
    const canReadNotes = hasAny([P.INTERNAL_NOTE_READ]);

    // Application detail sheet state
    const [selectedApplication, setSelectedApplication] =
        useState<Application | null>(null);
    const [applicationSheetOpen, setApplicationSheetOpen] = useState(false);

    // Fetch contract details with SWR
    const {
        data: contract,
        error: contractError,
        isLoading: loadingContract,
        mutate: revalidateContract,
    } = useApi<Contract>(`/contracts/${params.id}`);

    // Fetch applications for this contract
    const {
        data: applicationsResponse,
        isLoading: loadingApplications,
        mutate: revalidateApplications,
    } = useApi<ApplicationListResponse>(`/contracts/${params.id}/applications`);

    // Fetch internal notes (only if user has permission)
    const {
        data: notesResponse,
        isLoading: loadingNotes,
        mutate: revalidateNotes,
    } = useConditionalApi<InternalNoteListResponse>(
        `/contracts/${params.id}/notes`,
        canReadNotes
    );

    const applications = applicationsResponse?.data || [];
    const notes = notesResponse?.data || [];
    const isLoading = loadingContract || loadingApplications || loadingNotes;

    // Use new error handling for action errors
    const { error: actionError, setError: setActionError } = useErrorState();

    // Helper to revalidate all data
    const loadContractData = useCallback(async () => {
        await Promise.all([
            revalidateContract(),
            revalidateApplications(),
            revalidateNotes(),
        ]);
    }, [revalidateContract, revalidateApplications, revalidateNotes]);

    useEffect(() => {
        loadContractData();
    }, [loadContractData]);

    // Listen for contract-related notifications
    useEffect(() => {
        const latestNotification = notifications[0];
        if (
            !latestNotification ||
            !isContractNotification(latestNotification.type)
        ) {
            return;
        }

        // Handle notification with callbacks to refresh data
        handleContractNotification(latestNotification, {
            onContractUpdate: (contractId) => {
                if (contractId === params.id) {
                    loadContractData();
                }
            },
            onApplicationUpdate: () => {
                loadContractData();
            },
            onApplicationListUpdate: () => {
                loadContractData();
            },
        });
    }, [notifications, params.id, loadContractData]);

    async function handlePublish() {
        if (!contract) return;
        try {
            await ContractsService.openContract(contract._id);
            apiToast.success(successMessages.contracts.published);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.contracts.publish, error);
            setActionError(error);
        }
    }

    async function handleClose() {
        if (!contract) return;
        try {
            await ContractsService.closeContract(contract._id);
            apiToast.success(successMessages.contracts.closed);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.contracts.close, error);
            setActionError(error);
        }
    }

    async function handleAward(applicationId: string) {
        if (!contract) return;
        try {
            // Find the application to get vendorId
            const application = applications.find(app => app._id === applicationId);
            if (!application) {
                throw new Error('Application not found');
            }
            await ContractsService.awardContract(contract._id, {
                vendorId: application.vendorId,
                applicationId,
            });
            apiToast.success(successMessages.contracts.awarded);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.contracts.award, error);
            setActionError(error);
        }
    }

    async function handleDelete() {
        if (!contract) return;
        try {
            await ContractsService.deleteContract(contract._id);
            apiToast.success(successMessages.contracts.deleted);
            router.push("/contracts");
        } catch (error) {
            apiToast.error(errorMessages.contracts.delete, error);
            setActionError(error);
        }
    }

    async function handleApply(
        proposalDetails: string,
        documents: Map<string, File[]>,
        bidValue?: number
    ) {
        if (!contract) return;
        try {
            // Flatten the Map<string, File[]> to File[]
            const files: File[] = [];
            documents.forEach((fileList) => {
                files.push(...fileList);
            });
            await ApplicationsService.submitApplication(
                contract._id,
                { proposalDetails, bidValue },
                files
            );
            apiToast.success(successMessages.applications.submitted);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.applications.submit, error);
            setActionError(error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    async function handleAcceptApplication(applicationId: string) {
        try {
            await ApplicationsService.updateApplicationStatus(
                applicationId,
                { status: ApplicationStatus.ACCEPTED }
            );
            apiToast.success(successMessages.applications.statusUpdated);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.applications.updateStatus, error);
            setActionError(error);
        }
    }

    async function handleRejectApplication(applicationId: string) {
        try {
            await ApplicationsService.updateApplicationStatus(
                applicationId,
                { status: ApplicationStatus.REJECTED }
            );
            apiToast.success(successMessages.applications.statusUpdated);
            await loadContractData();
        } catch (error) {
            apiToast.error(errorMessages.applications.updateStatus, error);
            setActionError(error);
        }
    }

    function handleViewApplication(applicationId: string) {
        const application = applications.find(
            (app) => app._id === applicationId
        );
        if (application) {
            setSelectedApplication(application);
            setApplicationSheetOpen(true);
        }
    }

    async function handleCreateNote(content: string, applicationId?: string) {
        try {
            await ContractNotesService.createNote({
                contractId: params.id,
                content,
                applicationId,
            });
            apiToast.success("Note created successfully");
            await loadContractData();
        } catch (error) {
            apiToast.error("Failed to create note", error);
            setActionError(error);
        }
    }

    async function handleDeleteNote(noteId: string) {
        try {
            await ContractNotesService.deleteNote(noteId);
            apiToast.success("Note deleted successfully");
            await loadContractData();
        } catch (error) {
            apiToast.error("Failed to delete note", error);
            setActionError(error);
        }
    }

    if (isLoading) {
        return (
            <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                <main className="container mx-auto space-y-6 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 rounded bg-muted" />
                        <div className="h-64 rounded-lg bg-muted" />
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    if (contractError || !contract) {
        return (
            <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                <main className="container mx-auto space-y-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/contracts")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Contracts
                    </Button>
                    <div className="space-y-4 rounded-lg border border-destructive bg-destructive/10 p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className="mb-2 font-semibold text-destructive">
                                    Unable to Load Contract
                                </h3>
                                <p className="text-sm text-destructive/90">
                                    {contractError instanceof Error
                                        ? contractError.message
                                        : "Contract not found"}
                                </p>
                                {params.id && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Contract ID: {params.id}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => loadContractData()}
                            >
                                Try Again
                            </Button>
                            <Button onClick={() => router.push("/contracts")}>
                                Back to Contracts List
                            </Button>
                        </div>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
            <ContractErrorBoundary>
                <main className="container mx-auto space-y-6 py-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/contracts")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Contracts
                    </Button>

                    {actionError && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                            {actionError.message}
                        </div>
                    )}

                    <ContractDetail
                        contract={contract}
                        onPublish={handlePublish}
                        onClose={handleClose}
                        onDelete={handleDelete}
                        onApply={handleApply}
                    />

                    <ApplicationList
                        contract={contract}
                        applications={applications}
                        onAccept={handleAcceptApplication}
                        onReject={handleRejectApplication}
                        onAward={handleAward}
                        onViewDetails={handleViewApplication}
                    />

                    {canReadNotes && (
                        <InternalNotes
                            contractId={params.id}
                            notes={notes}
                            onCreate={handleCreateNote}
                            onDelete={handleDeleteNote}
                        />
                    )}

                    {/* Application Detail Sheet */}
                    <ApplicationDetailSheet
                        application={selectedApplication}
                        isWinner={
                            contract.awardedApplication ===
                            selectedApplication?._id
                        }
                        open={applicationSheetOpen}
                        onOpenChange={setApplicationSheetOpen}
                    />
                </main>
            </ContractErrorBoundary>
        </ProtectedRoute>
    );
}
