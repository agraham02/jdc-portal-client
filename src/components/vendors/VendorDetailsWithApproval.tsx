"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorService, type VendorWithUser } from "@/lib/services/vendor";
import { UserStatus } from "@/lib/types/auth";
import { useApi } from "@/lib/hooks/useApi";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiToast } from "@/lib/utils/toast-helpers";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Globe,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/contexts/auth-context";
import {
    PermissionRequiredBanner,
    PermissionRequiredIndicator,
} from "@/components/rbac";

interface VendorDetailsWithApprovalProps {
    vendorId: string;
}

export function VendorDetailsWithApproval({
    vendorId,
}: VendorDetailsWithApprovalProps) {
    const router = useRouter();
    const { hasPermission } = useAuth();

    // Fetch vendor details with SWR
    const {
        data: vendor,
        error,
        isLoading: loading,
        mutate: revalidateVendor,
    } = useApi<VendorWithUser>(`/vendors/${vendorId}`);

    const [actionLoading, setActionLoading] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const canApprove = hasPermission("vendor:approve");

    // Show error toast if loading failed
    if (error && !loading) {
        apiToast.error("Failed to load vendor details", error);
    }

    async function handleApprove() {
        if (!vendor) return;

        try {
            setActionLoading(true);

            // Optimistic update: immediately show the vendor as active
            await revalidateVendor(
                {
                    ...vendor,
                    userId: { ...vendor.userId, status: UserStatus.ACTIVE },
                },
                false // Don't revalidate immediately
            );

            // Perform the actual API call
            await VendorService.approveVendor(vendorId);

            // Revalidate to get fresh data from the server
            await revalidateVendor();

            apiToast.success("Vendor account has been activated successfully");
            setShowApproveDialog(false);
            router.push("/vendors");
        } catch (error) {
            // Rollback optimistic update on error
            await revalidateVendor();
            apiToast.error("Failed to approve vendor", error);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject() {
        if (!vendor) return;

        try {
            setActionLoading(true);

            // Optimistic update: immediately show the vendor as rejected
            await revalidateVendor(
                {
                    ...vendor,
                    userId: { ...vendor.userId, status: UserStatus.REJECTED },
                },
                false // Don't revalidate immediately
            );

            // Perform the actual API call
            await VendorService.rejectVendor(vendorId, rejectReason);

            // Revalidate to get fresh data from the server
            await revalidateVendor();

            apiToast.success("Vendor account has been rejected");
            setShowRejectDialog(false);
            router.push("/vendors");
        } catch (error) {
            // Rollback optimistic update on error
            await revalidateVendor();
            apiToast.error("Failed to reject vendor", error);
        } finally {
            setActionLoading(false);
        }
    }

    function getStatusBadgeVariant(
        status: UserStatus
    ): "default" | "secondary" | "destructive" | "outline" {
        switch (status) {
            case UserStatus.ACTIVE:
                return "default";
            case UserStatus.PENDING:
                return "secondary";
            case UserStatus.REJECTED:
            case UserStatus.TERMINATED:
                return "destructive";
            default:
                return "outline";
        }
    }

    if (loading) {
        return (
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/vendors")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Vendors
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-8">
                        <div className="flex items-center justify-center">
                            <div className="text-muted-foreground">
                                Loading vendor details...
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/vendors")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Vendors
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-muted-foreground">
                            Vendor not found
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const user = vendor.userId;
    const isPending = user.status === UserStatus.PENDING;

    return (
        <div className="container py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/vendors")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Vendors
                    </Button>
                </div>
                {isPending && (
                    <div className="flex gap-2">
                        {canApprove ? (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => setShowApproveDialog(true)}
                                    disabled={actionLoading}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowRejectDialog(true)}
                                    disabled={actionLoading}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </>
                        ) : (
                            <>
                                <PermissionRequiredIndicator permission="vendor:approve">
                                    <Button variant="default" disabled>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </PermissionRequiredIndicator>
                                <PermissionRequiredIndicator permission="vendor:approve">
                                    <Button variant="destructive" disabled>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </PermissionRequiredIndicator>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Permission Banner for Pending Vendors */}
            {isPending && !canApprove && (
                <PermissionRequiredBanner
                    permissions="vendor:approve"
                    message="You need the following permission to approve or reject this vendor account:"
                />
            )}

            {/* Vendor Company Information Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Building2 className="h-6 w-6" />
                                {vendor.companyName}
                            </CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">
                                    Contact Email
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {vendor.contactEmail || user.email}
                                </p>
                            </div>
                        </div>
                        {vendor.contactPhone && (
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Contact Phone
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {vendor.contactPhone}
                                    </p>
                                </div>
                            </div>
                        )}
                        {vendor.contactName && (
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Contact Name
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {vendor.contactName}
                                    </p>
                                </div>
                            </div>
                        )}
                        {vendor.website && (
                            <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Website
                                    </p>
                                    <a
                                        href={vendor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {vendor.website}
                                    </a>
                                </div>
                            </div>
                        )}
                        {user.createdAt && (
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Registration Date
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {user.physicalAddress && (
                        <>
                            <Separator />
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Physical Address
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.physicalAddress.line1}
                                        {user.physicalAddress.line2 &&
                                            `, ${user.physicalAddress.line2}`}
                                        <br />
                                        {user.physicalAddress.city},{" "}
                                        {user.physicalAddress.state}{" "}
                                        {user.physicalAddress.zip}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {vendor.servicesOffered &&
                        vendor.servicesOffered.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium mb-2">
                                        Services Offered
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {vendor.servicesOffered.map(
                                            (service, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                >
                                                    {service}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                    {vendor.notes && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    Internal Notes
                                </p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {vendor.notes}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* User Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>User Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                Email Verified
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {"isEmailVerified" in user &&
                                user.isEmailVerified
                                    ? "Yes"
                                    : "No"}
                            </p>
                        </div>
                        {user.lastLogin && (
                            <div>
                                <p className="text-sm font-medium">
                                    Last Login
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(user.lastLogin).toLocaleString()}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium">
                                Account Status
                            </p>
                            <Badge variant={getStatusBadgeVariant(user.status)}>
                                {user.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Approval Confirmation Dialog */}
            <Dialog
                open={showApproveDialog}
                onOpenChange={setShowApproveDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Vendor Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve{" "}
                            <strong>{vendor.companyName}</strong>? This will
                            activate their account and grant them access to the
                            vendor portal.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowApproveDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Approving..." : "Approve"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Vendor Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject{" "}
                            <strong>{vendor.companyName}</strong>? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reject-reason">
                            Reason (optional but recommended)
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="Enter the reason for rejecting this vendor application..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            maxLength={500}
                            className="mt-2"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {rejectReason.length}/500 characters
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Rejecting..." : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
