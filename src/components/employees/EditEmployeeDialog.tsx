"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeService, UpdateEmployeeRequest, EmployeeWithUser } from "@/lib/services/employee";

const updateEmployeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    hireDate: z.string().optional(),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
});

type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

interface EditEmployeeDialogProps {
    employee: EmployeeWithUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditEmployeeDialog({
    employee,
    open,
    onOpenChange,
    onSuccess,
}: EditEmployeeDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateEmployeeFormData>({
        resolver: zodResolver(updateEmployeeSchema),
    });

    // Reset form with employee data when dialog opens or employee changes
    useEffect(() => {
        if (employee && open) {
            reset({
                firstName: employee.userId.firstName || "",
                lastName: employee.userId.lastName || "",
                employeeId: employee.employeeId || "",
                jobTitle: employee.jobTitle || "",
                department: employee.department || "",
                hireDate: employee.hireDate 
                    ? new Date(employee.hireDate).toISOString().split('T')[0] 
                    : "",
                contactEmail: employee.userId.contactEmail || "",
                contactPhone: employee.userId.contactPhone || "",
            });
        }
    }, [employee, open, reset]);

    const onSubmit = async (data: UpdateEmployeeFormData) => {
        setIsLoading(true);
        try {
            const updateData: UpdateEmployeeRequest = {
                ...data,
                contactEmail: data.contactEmail || undefined,
            };

            await EmployeeService.updateEmployee(employee._id, updateData);
            
            toast({
                title: "Success",
                description: "Employee updated successfully",
            });
            
            onSuccess();
        } catch (error) {
            console.error("Failed to update employee:", error);
            toast({
                title: "Error",
                description: "Failed to update employee",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee information. Changes will be reflected immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                {...register("firstName")}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                {...register("lastName")}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={employee.userId.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                            Email address cannot be changed
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                {...register("employeeId")}
                                placeholder="EMP001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                {...register("jobTitle")}
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                {...register("department")}
                                placeholder="Engineering"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hireDate">Hire Date</Label>
                            <Input
                                id="hireDate"
                                type="date"
                                {...register("hireDate")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                {...register("contactEmail")}
                                placeholder="personal@email.com"
                            />
                            {errors.contactEmail && (
                                <p className="text-sm text-destructive">
                                    {errors.contactEmail.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                {...register("contactPhone")}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Employee"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
