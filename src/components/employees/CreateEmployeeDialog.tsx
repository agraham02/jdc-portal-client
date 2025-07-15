"use client";

import { useState } from "react";
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
import {
    EmployeeService,
    CreateEmployeeRequest,
} from "@/lib/services/employee";

const createEmployeeSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    hireDate: z.string().optional(),
    contactEmail: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal("")),
    contactPhone: z.string().optional(),
});

type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

interface CreateEmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateEmployeeDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateEmployeeDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateEmployeeFormData>({
        resolver: zodResolver(createEmployeeSchema),
    });

    const onSubmit = async (data: CreateEmployeeFormData) => {
        setIsLoading(true);
        try {
            const employeeData: CreateEmployeeRequest = {
                ...data,
                contactEmail: data.contactEmail || undefined,
            };

            await EmployeeService.createEmployee(employeeData);

            toast({
                title: "Success",
                description: "Employee created successfully",
            });

            reset();
            onSuccess();
        } catch (error) {
            console.error("Failed to create employee:", error);
            toast({
                title: "Error",
                description: "Failed to create employee",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            reset();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogDescription>
                        Add a new employee to the system. They will be created
                        with an active status.
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
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="john.doe@company.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register("password")}
                            placeholder="Min 8 characters"
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>
                        )}
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
                            onClick={() => handleClose(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Employee"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
