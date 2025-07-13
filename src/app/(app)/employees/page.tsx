"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Check,
    Edit,
    Trash2,
    Clock,
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeService, EmployeeWithUser } from "@/lib/services/employee";
import { UserStatus } from "@/lib/types/auth";
import {
    CreateEmployeeDialog,
    EditEmployeeDialog,
} from "@/components/employees";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<EmployeeWithUser[]>([]);
    const [pendingEmployees, setPendingEmployees] = useState<
        EmployeeWithUser[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] =
        useState<EmployeeWithUser | null>(null);
    const [activeTab, setActiveTab] = useState<"active" | "pending">("active");

    const { toast } = useToast();
    const limit = 10;

    const loadEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await EmployeeService.getEmployees(
                currentPage,
                limit
            );
            setEmployees(response.data);
            setTotalEmployees(response.total);
        } catch (error) {
            console.error("Failed to load employees:", error);
            toast({
                title: "Error",
                description: "Failed to load employees",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, toast]);

    const loadPendingEmployees = useCallback(async () => {
        try {
            const response = await EmployeeService.getPendingEmployees();
            setPendingEmployees(response.data);
        } catch (error) {
            console.error("Failed to load pending employees:", error);
        }
    }, []);

    useEffect(() => {
        loadEmployees();
        loadPendingEmployees();
    }, [loadEmployees, loadPendingEmployees]);

    const handleApproveEmployee = async (employeeId: string) => {
        try {
            await EmployeeService.approveEmployee(employeeId);
            toast({
                title: "Success",
                description: "Employee approved successfully",
            });
            loadEmployees();
            loadPendingEmployees();
        } catch (error) {
            console.error("Failed to approve employee:", error);
            toast({
                title: "Error",
                description: "Failed to approve employee",
                variant: "destructive",
            });
        }
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        try {
            await EmployeeService.deleteEmployee(employeeId);
            toast({
                title: "Success",
                description: "Employee deactivated successfully",
            });
            loadEmployees();
        } catch (error) {
            console.error("Failed to delete employee:", error);
            toast({
                title: "Error",
                description: "Failed to deactivate employee",
                variant: "destructive",
            });
        }
    };

    const handleCreateEmployee = () => {
        loadEmployees();
        loadPendingEmployees();
        setShowCreateDialog(false);
    };

    const handleEditEmployee = () => {
        loadEmployees();
        setEditingEmployee(null);
    };

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.userId.firstName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.userId.lastName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.userId.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.jobTitle
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.department
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const filteredPendingEmployees = pendingEmployees.filter(
        (employee) =>
            employee.userId.firstName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.userId.lastName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.userId.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.jobTitle
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            employee.department
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE:
                return <Badge variant="default">Active</Badge>;
            case UserStatus.PENDING:
                return <Badge variant="secondary">Pending</Badge>;
            case UserStatus.INACTIVE:
                return <Badge variant="destructive">Inactive</Badge>;
            case UserStatus.ONBOARDING:
                return <Badge variant="outline">Onboarding</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalPages = Math.ceil(totalEmployees / limit);

    return (
        <ProtectedRoute requiredRoles={RoleName.ADMIN}>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Users className="w-8 h-8" />
                            Employee Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage employee accounts and profiles
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Employee
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Employees
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalEmployees}
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
                                {pendingEmployees.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Employees
                            </CardTitle>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    employees.filter(
                                        (emp) =>
                                            emp.userId.status ===
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
                            Active Employees
                        </Button>
                        <Button
                            variant={
                                activeTab === "pending" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("pending")}
                        >
                            Pending Approval ({pendingEmployees.length})
                        </Button>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Employee Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab === "active"
                                ? "Active Employees"
                                : "Pending Employees"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                Loading employees...
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Hire Date</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(activeTab === "active"
                                        ? filteredEmployees
                                        : filteredPendingEmployees
                                    ).map((employee) => (
                                        <TableRow key={employee._id}>
                                            <TableCell className="font-medium">
                                                {employee.userId.fullName ||
                                                    `${
                                                        employee.userId
                                                            .firstName || ""
                                                    } ${
                                                        employee.userId
                                                            .lastName || ""
                                                    }`.trim() ||
                                                    "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {employee.userId.email}
                                            </TableCell>
                                            <TableCell>
                                                {employee.jobTitle || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {employee.department || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    employee.userId.status
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {employee.hireDate
                                                    ? new Date(
                                                          employee.hireDate
                                                      ).toLocaleDateString()
                                                    : "N/A"}
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
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setEditingEmployee(
                                                                    employee
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        {employee.userId
                                                            .status ===
                                                            UserStatus.PENDING && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleApproveEmployee(
                                                                        employee._id
                                                                    )
                                                                }
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteEmployee(
                                                                    employee._id
                                                                )
                                                            }
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {activeTab === "active" && totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Employee Dialog */}
                <CreateEmployeeDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    onSuccess={handleCreateEmployee}
                />

                {/* Edit Employee Dialog */}
                {editingEmployee && (
                    <EditEmployeeDialog
                        employee={editingEmployee}
                        open={!!editingEmployee}
                        onOpenChange={(open: boolean) =>
                            !open && setEditingEmployee(null)
                        }
                        onSuccess={handleEditEmployee}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
