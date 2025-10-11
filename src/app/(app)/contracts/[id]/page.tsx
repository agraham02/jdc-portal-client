"use client";

import { useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
    ContractDetail,
    ApplicationList,
    InternalNotes,
} from "@/components/contracts";
import {
    ContractsService,
    ApplicationsService,
    InternalNotesService,
} from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type {
    Contract,
    ApplicationListResponse,
    InternalNoteListResponse,
} from "@/lib/types/contracts";
import { ApplicationStatus } from "@/lib/types/contracts";
import { useNotificationsCtx } from "@/lib/contexts/notifications-context";
import { useAuthz } from "@/lib/authz/useAuthz";
import {
    handleContractNotification,
    isContractNotification,
    showContractActionSuccess,
    showContractActionError,
} from "@/lib/utils/contract-notifications";
import { useApi, useConditionalApi } from "@/lib/hooks/useApi";

export default function ContractDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { notifications } = useNotificationsCtx();
    const { hasAny } = useAuthz();
    const canReadNotes = hasAny([P.INTERNAL_NOTE_READ]);

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

    // Helper to revalidate all data
    const loadContractData = useCallback(async () => {
        await Promise.all([
            revalidateContract(),
            revalidateApplications(),
            revalidateNotes(),
        ]);
    }, [revalidateContract, revalidateApplications, revalidateNotes]);

    // Determine error message with user-friendly descriptions
    const error = contractError
        ? (() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const errorObj = contractError as any;
              const status = errorObj?.status;
              const message =
                  errorObj?.message ||
                  (contractError instanceof Error
                      ? contractError.message
                      : String(contractError));

              if (status === 404) {
                  return "Contract not found. It may have been deleted.";
              } else if (status === 403) {
                  return "You don't have permission to view this contract.";
              } else if (status === 500 || (status >= 500 && status < 600)) {
                  return "Server error while loading contract. The backend may be having issues. Please try again later or contact support.";
              } else if (status === 401) {
                  return "Authentication required. Please log in again.";
              } else if (message && typeof message === "string") {
                  return message;
              } else {
                  return "Failed to load contract. Please try again.";
              }
          })()
        : undefined;

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
            showContractActionSuccess(
                "Contract Published",
                "Contract is now open for applications"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to publish contract";
            showContractActionError("Publish Contract", message);
        }
    }

    async function handleClose() {
        if (!contract) return;
        try {
            await ContractsService.closeContract(contract._id);
            showContractActionSuccess(
                "Contract Closed",
                "Contract is no longer accepting applications"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to close contract";
            showContractActionError("Close Contract", message);
        }
    }

    async function handleAward(applicationId: string) {
        if (!contract) return;
        try {
            await ContractsService.awardContract(contract._id, {
                applicationId,
            });
            showContractActionSuccess(
                "Contract Awarded",
                "The contract has been awarded successfully"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to award contract";
            showContractActionError("Award Contract", message);
        }
    }

    async function handleDelete() {
        if (!contract) return;
        try {
            await ContractsService.deleteContract(contract._id);
            showContractActionSuccess(
                "Contract Deleted",
                "The contract has been deleted"
            );
            router.push("/contracts");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to delete contract";
            showContractActionError("Delete Contract", message);
        }
    }

    async function handleApply(
        proposalDetails: string,
        documents: Map<string, File[]>,
        bidValue?: number
    ) {
        if (!contract) return;
        try {
            await ApplicationsService.submitApplication(
                contract._id,
                { proposalDetails, bidValue },
                documents
            );
            showContractActionSuccess(
                "Application Submitted",
                "Your application has been submitted successfully"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to submit application";
            showContractActionError("Submit Application", message);
            throw err; // Re-throw so dialog can handle it
        }
    }

    async function handleAcceptApplication(applicationId: string) {
        try {
            await ApplicationsService.updateApplicationStatus(
                params.id,
                applicationId,
                { status: ApplicationStatus.ACCEPTED }
            );
            showContractActionSuccess(
                "Application Accepted",
                "The application has been accepted"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to accept application";
            showContractActionError("Accept Application", message);
        }
    }

    async function handleRejectApplication(applicationId: string) {
        try {
            await ApplicationsService.updateApplicationStatus(
                params.id,
                applicationId,
                { status: ApplicationStatus.REJECTED }
            );
            showContractActionSuccess(
                "Application Rejected",
                "The application has been rejected"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to reject application";
            showContractActionError("Reject Application", message);
        }
    }

    async function handleCreateNote(content: string, applicationId?: string) {
        try {
            await InternalNotesService.createNote(params.id, {
                content,
                applicationId,
            });
            showContractActionSuccess(
                "Note Created",
                "Internal note has been added"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to create note";
            showContractActionError("Create Note", message);
        }
    }

    async function handleUpdateNote(noteId: string, content: string) {
        try {
            await InternalNotesService.updateNote(params.id, noteId, {
                content,
            });
            showContractActionSuccess(
                "Note Updated",
                "Internal note has been updated"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to update note";
            showContractActionError("Update Note", message);
        }
    }

    async function handleDeleteNote(noteId: string) {
        try {
            await InternalNotesService.deleteNote(params.id, noteId);
            showContractActionSuccess(
                "Note Deleted",
                "Internal note has been removed"
            );
            await loadContractData();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete note";
            showContractActionError("Delete Note", message);
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

    if (error || !contract) {
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
                                    {error || "Contract not found"}
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
            <main className="container mx-auto space-y-6 py-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/contracts")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Contracts
                </Button>

                {error && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {error}
                    </div>
                )}

                <ContractDetail
                    contract={contract}
                    onPublish={handlePublish}
                    onClose={handleClose}
                    onAward={handleAward}
                    onDelete={handleDelete}
                    onApply={handleApply}
                />

                <ApplicationList
                    contract={contract}
                    applications={applications}
                    onAccept={handleAcceptApplication}
                    onReject={handleRejectApplication}
                    onViewDetails={(id) => {
                        // TODO: Implement application detail modal or page
                        console.log("View application:", id);
                    }}
                />

                {canReadNotes && (
                    <InternalNotes
                        contractId={params.id}
                        notes={notes}
                        onCreate={handleCreateNote}
                        onUpdate={handleUpdateNote}
                        onDelete={handleDeleteNote}
                    />
                )}
            </main>
        </ProtectedRoute>
    );
}
