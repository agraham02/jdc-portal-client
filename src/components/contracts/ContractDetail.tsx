"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusChip } from "./StatusChip";
import { FileList } from "./FileList";
import { ConfirmDialog } from "./ConfirmDialog";
import { Contract, ContractStatus } from "@/lib/types/contracts";
import { Can } from "@/components/authz/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { formatCurrency } from "@/lib/utils/formatters";
import { format } from "date-fns";
import {
    CalendarIcon,
    DollarSignIcon,
    FileTextIcon,
    ClockIcon,
    EditIcon,
    SendIcon,
    XCircleIcon,
    TrophyIcon,
    TrashIcon,
    CheckCircleIcon,
} from "lucide-react";
import Link from "next/link";

interface ContractDetailProps {
    contract: Contract;
    onPublish?: () => Promise<void>;
    onClose?: () => Promise<void>;
    onAward?: (applicationId: string) => Promise<void>;
    onDelete?: () => Promise<void>;
    onDownloadDocument?: (fileId: string, filename: string) => Promise<void>;
    showActions?: boolean;
    className?: string;
}

export function ContractDetail({
    contract,
    onPublish,
    onClose,
    onAward,
    onDelete,
    onDownloadDocument,
    showActions = true,
    className,
}: ContractDetailProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void>;
        variant?: "default" | "destructive";
    }>({
        open: false,
        title: "",
        description: "",
        action: async () => {},
    });
    const [isLoading, setIsLoading] = useState(false);

    const isDraft = contract.status === ContractStatus.DRAFT;
    const isOpen = contract.status === ContractStatus.OPEN;
    const isAwarded = contract.status === ContractStatus.AWARDED;

    async function handleAction(action: () => Promise<void>) {
        setIsLoading(true);
        try {
            await action();
        } finally {
            setIsLoading(false);
        }
    }

    function openConfirmDialog(
        title: string,
        description: string,
        action: () => Promise<void>,
        variant: "default" | "destructive" = "default"
    ) {
        setConfirmDialog({
            open: true,
            title,
            description,
            action,
            variant,
        });
    }

    async function handleDownload(fileId: string, filename: string) {
        if (onDownloadDocument) {
            await onDownloadDocument(fileId, filename);
        }
    }

    return (
        <>
            <div className={`space-y-6 ${className || ""}`}>
                {/* Header */}
                <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {contract.title}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <StatusChip status={contract.status} />
                                {contract.requiresResponsiveSupport && (
                                    <Badge variant="secondary">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        Responsive Support
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {showActions && (
                            <div className="flex items-center gap-2">
                                {/* Edit Draft */}
                                {isDraft && (
                                    <Can anyOf={[P.CONTRACT_UPDATE]}>
                                        <Button asChild variant="outline">
                                            <Link
                                                href={`/contracts/${contract._id}/edit`}
                                            >
                                                <EditIcon className="h-4 w-4 mr-2" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </Can>
                                )}

                                {/* Publish */}
                                {isDraft && onPublish && (
                                    <Can anyOf={[P.CONTRACT_PUBLISH]}>
                                        <Button
                                            onClick={() =>
                                                openConfirmDialog(
                                                    "Publish Contract",
                                                    "This will make the contract visible to vendors and open it for applications. You will not be able to edit it afterwards.",
                                                    () =>
                                                        handleAction(onPublish)
                                                )
                                            }
                                            disabled={isLoading}
                                        >
                                            <SendIcon className="h-4 w-4 mr-2" />
                                            Publish
                                        </Button>
                                    </Can>
                                )}

                                {/* Close */}
                                {isOpen && onClose && (
                                    <Can anyOf={[P.CONTRACT_UPDATE]}>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                openConfirmDialog(
                                                    "Close Contract",
                                                    "This will stop accepting new applications. You can reopen it later if needed.",
                                                    () => handleAction(onClose)
                                                )
                                            }
                                            disabled={isLoading}
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                            Close
                                        </Button>
                                    </Can>
                                )}

                                {/* Award - shown when there are applications */}
                                {isOpen &&
                                    onAward &&
                                    contract.applications &&
                                    contract.applications.length > 0 && (
                                        <Can anyOf={[P.CONTRACT_AWARD]}>
                                            <Button variant="default">
                                                <TrophyIcon className="h-4 w-4 mr-2" />
                                                Award Contract
                                            </Button>
                                        </Can>
                                    )}

                                {/* Delete */}
                                {!isAwarded && onDelete && (
                                    <Can anyOf={[P.CONTRACT_DELETE]}>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                openConfirmDialog(
                                                    "Delete Contract",
                                                    "This action cannot be undone. All associated data will be permanently deleted.",
                                                    () =>
                                                        handleAction(onDelete),
                                                    "destructive"
                                                )
                                            }
                                            disabled={isLoading}
                                        >
                                            <TrashIcon className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </Can>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-muted-foreground text-lg">
                        {contract.description}
                    </p>
                </div>

                <Separator />

                {/* Contract Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Budget */}
                    {contract.budget !== undefined && contract.budget > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                                    Budget
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        contract.budget,
                                        contract.currency || "USD"
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Deadline */}
                    {contract.deadline && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    Deadline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {format(
                                        new Date(contract.deadline),
                                        "MMM d, yyyy"
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {format(
                                        new Date(contract.deadline),
                                        "h:mm a"
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Created By */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Created By
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">
                                {contract.createdBy.fullName ||
                                    contract.createdBy.email}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {format(
                                    new Date(contract.createdAt),
                                    "MMM d, yyyy"
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                {(contract.openedAt ||
                    contract.closedAt ||
                    contract.awardedAt) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {contract.openedAt && (
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">
                                                Opened
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(contract.openedAt),
                                                    "MMM d, yyyy 'at' h:mm a"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {contract.closedAt && (
                                    <div className="flex items-center gap-3">
                                        <XCircleIcon className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">
                                                Closed
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(contract.closedAt),
                                                    "MMM d, yyyy 'at' h:mm a"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {contract.awardedAt && (
                                    <div className="flex items-center gap-3">
                                        <TrophyIcon className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">
                                                Awarded
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(
                                                    new Date(
                                                        contract.awardedAt
                                                    ),
                                                    "MMM d, yyyy 'at' h:mm a"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Required Documents */}
                {contract.requiredDocuments &&
                    contract.requiredDocuments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5" />
                                    Required Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {contract.requiredDocuments.map(
                                        (doc, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {doc.name}
                                                        {doc.required && (
                                                            <span className="text-destructive ml-1">
                                                                *
                                                            </span>
                                                        )}
                                                    </p>
                                                    {doc.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                {/* Uploaded Documents */}
                {contract.documents && contract.documents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FileList
                                files={contract.documents}
                                onDownload={
                                    onDownloadDocument
                                        ? (file) =>
                                              handleDownload(
                                                  file._id,
                                                  file.filename
                                              )
                                        : undefined
                                }
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    setConfirmDialog({ ...confirmDialog, open })
                }
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.action}
                variant={confirmDialog.variant}
                loading={isLoading}
            />
        </>
    );
}
