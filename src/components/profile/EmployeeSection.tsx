"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Info, Edit2, X, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type { EmployeeWithUser } from "@/lib/services/employee";

// Fields that require admin permissions to edit
const employeeAdminEditSchema = z.object({
    employeeId: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
});

type EmployeeAdminEditData = z.infer<typeof employeeAdminEditSchema>;

interface EmployeeSectionProps {
    employee: EmployeeWithUser;
    onUpdate: (data: Partial<EmployeeWithUser>) => Promise<void>;
}

export function EmployeeSection({ employee, onUpdate }: EmployeeSectionProps) {
    const { hasAny } = useAuthz();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user has admin edit permissions
    const canEditAdmin = hasAny([P.EMPLOYEE_UPDATE_ALL]);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<EmployeeAdminEditData>({
        resolver: zodResolver(employeeAdminEditSchema),
        defaultValues: {
            employeeId: employee.employeeId || "",
            jobTitle: employee.jobTitle || "",
            department: employee.department || "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: EmployeeAdminEditData) => {
        setIsSubmitting(true);
        try {
            await onUpdate(data);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">
                                Employment Information
                            </h2>
                        </div>
                        {canEditAdmin && !isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {isEditing && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        {canEditAdmin
                            ? "HR-managed employment details (admin can edit)"
                            : "HR-managed employment details (read-only)"}
                    </p>
                    <Separator className="mb-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        {isEditing && canEditAdmin ? (
                            <>
                                <Input
                                    id="employeeId"
                                    {...register("employeeId")}
                                    placeholder="EMP-001"
                                />
                                {errors.employeeId && (
                                    <p className="text-sm text-destructive">
                                        {errors.employeeId.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                value={employee.employeeId || "Not assigned"}
                                disabled
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        {isEditing && canEditAdmin ? (
                            <>
                                <Input
                                    id="jobTitle"
                                    {...register("jobTitle")}
                                    placeholder="Software Engineer"
                                />
                                {errors.jobTitle && (
                                    <p className="text-sm text-destructive">
                                        {errors.jobTitle.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                value={employee.jobTitle || "Not assigned"}
                                disabled
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        {isEditing && canEditAdmin ? (
                            <>
                                <Input
                                    id="department"
                                    {...register("department")}
                                    placeholder="Engineering"
                                />
                                {errors.department && (
                                    <p className="text-sm text-destructive">
                                        {errors.department.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                value={employee.department || "Not assigned"}
                                disabled
                            />
                        )}
                    </div>

                    {/* Read-only fields */}
                    <div className="space-y-2">
                        <Label>Hire Date</Label>
                        <Input
                            value={
                                employee.hireDate
                                    ? format(new Date(employee.hireDate), "PPP")
                                    : "Not set"
                            }
                            disabled
                        />
                        {canEditAdmin && (
                            <p className="text-xs text-muted-foreground">
                                Contact system admin to modify hire date
                            </p>
                        )}
                    </div>

                    {employee.managerId && (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Manager ID</Label>
                            <Input value={employee.managerId} disabled />
                            {canEditAdmin && (
                                <p className="text-xs text-muted-foreground">
                                    Use employee management page to reassign
                                    manager
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {!canEditAdmin && (
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                        <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            These fields are managed by HR. Contact your HR
                            department if any information needs to be updated.
                        </p>
                    </div>
                )}

                {isEditing && (
                    <>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !isDirty}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Card>
    );
}
