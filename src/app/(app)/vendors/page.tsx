"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName, UserStatus } from "@/lib/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Building,
    Search,
    MoreHorizontal,
    Check,
    Edit,
    Trash2,
    Clock,
    X,
    ExternalLink,
    Phone,
    Mail,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreateVendorDialog, EditVendorDialog } from "@/components/vendors";
import { VendorService, Vendor } from "@/lib/services/vendor";
import { useToast } from "@/components/ui/use-toast";

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const { toast } = useToast();

    const limit = 10;

    const loadVendors = useCallback(async () => {
        try {
            setLoading(true);
            const response = await VendorService.getVendors(currentPage, limit);
            console.log(response);
            setVendors(response.data ?? []);
            setTotalVendors(response.total ?? 0);
        } catch (error) {
            console.error("Failed to load vendors:", error);
            toast({
                title: "Error",
                description: "Failed to load vendors",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, toast]);

    const loadPendingVendors = useCallback(async () => {
        try {
            const response = await VendorService.getPendingVendors();
            setPendingVendors(response.data ?? []);
        } catch (error) {
            console.error("Failed to load pending vendors:", error);
        }
    }, []);

    useEffect(() => {
        loadVendors();
        loadPendingVendors();
    }, [loadVendors, loadPendingVendors]);

    const handleApproveVendor = async (vendorId: string) => {
        try {
            await VendorService.approveVendor(vendorId);
            toast({
                title: "Success",
                description: "Vendor approved successfully",
            });
            loadVendors();
            loadPendingVendors();
        } catch (error) {
            console.error("Failed to approve vendor:", error);
            toast({
                title: "Error",
                description: "Failed to approve vendor",
                variant: "destructive",
            });
        }
    };

    const handleRejectVendor = async (vendorId: string) => {
        try {
            await VendorService.rejectVendor(vendorId, "Rejected by admin");
            toast({
                title: "Success",
                description: "Vendor rejected successfully",
            });
            loadVendors();
            loadPendingVendors();
        } catch (error) {
            console.error("Failed to reject vendor:", error);
            toast({
                title: "Error",
                description: "Failed to reject vendor",
                variant: "destructive",
            });
        }
    };

    const handleDeactivateVendor = async (vendorId: string) => {
        try {
            await VendorService.deactivateVendor(vendorId);
            toast({
                title: "Success",
                description: "Vendor deactivated successfully",
            });
            loadVendors();
            loadPendingVendors();
        } catch (error) {
            console.error("Failed to deactivate vendor:", error);
            toast({
                title: "Error",
                description: "Failed to deactivate vendor",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: UserStatus) => {
        const statusConfig = {
            [UserStatus.ACTIVE]: {
                variant: "default" as const,
                label: "Active",
            },
            [UserStatus.PENDING]: {
                variant: "secondary" as const,
                label: "Pending",
            },
            [UserStatus.INACTIVE]: {
                variant: "outline" as const,
                label: "Inactive",
            },
            [UserStatus.ONBOARDING]: {
                variant: "secondary" as const,
                label: "Onboarding",
            },
            [UserStatus.REJECTED]: {
                variant: "destructive" as const,
                label: "Rejected",
            },
            [UserStatus.TERMINATED]: {
                variant: "destructive" as const,
                label: "Terminated",
            },
            [UserStatus.ARCHIVED]: {
                variant: "outline" as const,
                label: "Archived",
            },
        };

        const config = statusConfig[status] || {
            variant: "outline" as const,
            label: status,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredVendors = vendors.filter(
        (vendor) =>
            vendor.companyName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.firstName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.lastName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.email
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.servicesOffered?.some((service) =>
                service.toLowerCase().includes(searchQuery.toLowerCase())
            )
    );

    const filteredPendingVendors = pendingVendors.filter(
        (vendor) =>
            vendor.companyName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.firstName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.lastName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            vendor.userId.email
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(totalVendors / limit);

    return (
        <ProtectedRoute requiredRoles={[RoleName.ADMIN, RoleName.EMPLOYEE]}>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Building className="w-8 h-8" />
                            Vendor Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage vendor accounts and partnerships
                        </p>
                    </div>
                    <CreateVendorDialog
                        onVendorCreated={() => {
                            loadVendors();
                            loadPendingVendors();
                        }}
                    />
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Vendors
                            </CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalVendors}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Approval
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pendingVendors.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Vendors
                            </CardTitle>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    vendors.filter(
                                        (v) =>
                                            v.userId.status ===
                                            UserStatus.ACTIVE
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Tabs */}
                <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                        <Button
                            variant={
                                activeTab === "active" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("active")}
                        >
                            Active Vendors ({vendors.length})
                        </Button>
                        <Button
                            variant={
                                activeTab === "pending" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("pending")}
                        >
                            Pending Approval ({pendingVendors.length})
                        </Button>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Vendor Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab === "active"
                                ? "Active Vendors"
                                : "Pending Approval"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner className="w-8 h-8" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Services</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Website</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(activeTab === "active"
                                            ? filteredVendors
                                            : filteredPendingVendors
                                        ).map((vendor) => (
                                            <TableRow key={vendor._id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {vendor.companyName}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {vendor.contactName &&
                                                                `Contact: ${vendor.contactName}`}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">
                                                            {
                                                                vendor.userId
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                vendor.userId
                                                                    .lastName
                                                            }
                                                        </div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {
                                                                vendor.userId
                                                                    .email
                                                            }
                                                        </div>
                                                        {vendor.userId
                                                            .contactPhone && (
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {
                                                                    vendor
                                                                        .userId
                                                                        .contactPhone
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {vendor.servicesOffered
                                                            ?.slice(0, 2)
                                                            .map(
                                                                (
                                                                    service,
                                                                    index
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            index
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {
                                                                            service
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        {vendor.servicesOffered &&
                                                            vendor
                                                                .servicesOffered
                                                                .length > 2 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {vendor
                                                                        .servicesOffered
                                                                        .length -
                                                                        2}{" "}
                                                                    more
                                                                </Badge>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        vendor.userId.status
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {vendor.website ? (
                                                        <a
                                                            href={
                                                                vendor.website
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Visit
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {activeTab ===
                                                            "pending" ? (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleApproveVendor(
                                                                                vendor._id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleRejectVendor(
                                                                                vendor._id
                                                                            )
                                                                        }
                                                                        className="text-red-600"
                                                                    >
                                                                        <X className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setEditingVendor(
                                                                                vendor
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDeactivateVendor(
                                                                                vendor._id
                                                                            )
                                                                        }
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Deactivate
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {activeTab === "active" && totalPages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing{" "}
                                            {(currentPage - 1) * limit + 1} to{" "}
                                            {Math.min(
                                                currentPage * limit,
                                                totalVendors
                                            )}{" "}
                                            of {totalVendors} vendors
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage - 1
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage + 1
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Vendor Dialog */}
                {editingVendor && (
                    <EditVendorDialog
                        vendor={editingVendor}
                        open={!!editingVendor}
                        onOpenChange={(open) => !open && setEditingVendor(null)}
                        onVendorUpdated={() => {
                            loadVendors();
                            loadPendingVendors();
                        }}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
