"use client";

import { format } from "date-fns";
import {
    FileText,
    Calendar,
    DollarSign,
    User,
    Building,
    Mail,
    Phone,
    Trophy,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common";
import { formatCurrency } from "@/lib/utils/formatters";
import type { Application } from "@/lib/types/contracts";

interface ApplicationDetailSheetProps {
    application: Application | null;
    isWinner?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailSheet({
    application,
    isWinner = false,
    open,
    onOpenChange,
}: ApplicationDetailSheetProps) {
    if (!application) return null;

    const vendor = application.vendor;
    const vendorName = vendor
        ? `${vendor.firstName} ${vendor.lastName}`
        : "Unknown Vendor";
    const vendorEmail = vendor?.email || "";
    const vendorCompany = vendor?.companyName || "";
    const vendorPhone = vendor?.phoneNumber || "";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center gap-2">
                        <SheetTitle>Application Details</SheetTitle>
                        {isWinner && (
                            <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                            >
                                <Trophy className="h-3 w-3 mr-1" />
                                Winner
                            </Badge>
                        )}
                    </div>
                    <SheetDescription>
                        Submitted{" "}
                        {format(
                            new Date(
                                application.applicationDate ||
                                    application.createdAt
                            ),
                            "PPP"
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Status:
                        </span>
                        <StatusBadge
                            type="application"
                            status={application.status}
                        />
                    </div>

                    <Separator />

                    {/* Vendor Information */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Vendor Information
                        </h4>

                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{vendorName}</span>
                        </div>

                        {vendorCompany && (
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{vendorCompany}</span>
                            </div>
                        )}

                        {vendorEmail && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`mailto:${vendorEmail}`}
                                    className="text-primary hover:underline"
                                >
                                    {vendorEmail}
                                </a>
                            </div>
                        )}

                        {vendorPhone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`tel:${vendorPhone}`}
                                    className="text-primary hover:underline"
                                >
                                    {vendorPhone}
                                </a>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Bid Value */}
                    {application.bidValue !== undefined &&
                        application.bidValue !== null && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Bid Value
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-lg font-semibold">
                                            {formatCurrency(
                                                application.bidValue
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                    {/* Proposal Details */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Proposal Details
                        </h4>
                        <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                            {application.proposalDetails ||
                                "No proposal details provided."}
                        </div>
                    </div>

                    {/* Documents */}
                    {application.documents &&
                        application.documents.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Documents (
                                        {application.documents.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {application.documents.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className="flex items-center gap-2 rounded-md border p-2"
                                            >
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm truncate flex-1">
                                                    {doc.filename}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(doc.size / 1024).toFixed(
                                                        1
                                                    )}{" "}
                                                    KB
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                    {/* Timeline */}
                    <Separator />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Timeline
                        </h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Submitted:
                                </span>
                                <span>
                                    {format(
                                        new Date(
                                            application.applicationDate ||
                                                application.createdAt
                                        ),
                                        "PPp"
                                    )}
                                </span>
                            </div>
                            {application.reviewedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Reviewed:
                                    </span>
                                    <span>
                                        {format(
                                            new Date(application.reviewedAt),
                                            "PPp"
                                        )}
                                    </span>
                                </div>
                            )}
                            {application.acceptedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Accepted:
                                    </span>
                                    <span>
                                        {format(
                                            new Date(application.acceptedAt),
                                            "PPp"
                                        )}
                                    </span>
                                </div>
                            )}
                            {application.rejectedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Rejected:
                                    </span>
                                    <span>
                                        {format(
                                            new Date(application.rejectedAt),
                                            "PPp"
                                        )}
                                    </span>
                                </div>
                            )}
                            {application.withdrawnAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Withdrawn:
                                    </span>
                                    <span>
                                        {format(
                                            new Date(application.withdrawnAt),
                                            "PPp"
                                        )}
                                    </span>
                                </div>
                            )}
                            {application.cancelledAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Cancelled:
                                    </span>
                                    <span>
                                        {format(
                                            new Date(application.cancelledAt),
                                            "PPp"
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
