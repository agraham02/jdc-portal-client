"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { pageTransition } from "@/lib/animations";
import { EmployeeCombobox } from "@/components/common";
import { DateInput } from "@/components/common/DateInput";
import {
    EmployeeService,
    type CreateEmployeeDto,
} from "@/lib/services/employee";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

/**
 * Admin invitation form. Uses a real employee combobox for manager assignment
 * and a toggle for the "shared / role inbox" classification that controls how
 * anonymization handles the email on future account deletion.
 */
export default function EmployeeInvitePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = React.useState(false);

    const [email, setEmail] = React.useState("");
    const [employeeId, setEmployeeId] = React.useState("");
    const [jobTitle, setJobTitle] = React.useState("");
    const [department, setDepartment] = React.useState("");
    const [hireDate, setHireDate] = React.useState<Date | null>(null);
    const [managerId, setManagerId] = React.useState("");
    const [isTransferableEmail, setIsTransferableEmail] = React.useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Work email is required");
            return;
        }
        setSubmitting(true);
        try {
            const payload: CreateEmployeeDto = {
                email: email.trim(),
                employeeId: employeeId.trim() || undefined,
                jobTitle: jobTitle.trim() || undefined,
                department: department.trim() || undefined,
                hireDate: hireDate
                    ? `${hireDate.getFullYear()}-${String(hireDate.getMonth() + 1).padStart(2, "0")}-${String(hireDate.getDate()).padStart(2, "0")}`
                    : undefined,
                managerId: managerId || undefined,
                isTransferableEmail: isTransferableEmail || undefined,
            };
            await EmployeeService.createEmployee(payload);
            toast.success("Invitation sent");
            router.push("/employees");
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Failed to send invitation";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_CREATE]}>
            <motion.main
                className="space-y-4 max-w-3xl mx-auto p-6"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                <div data-tour="invite-employee-header">
                    <h1 className="text-2xl font-semibold">
                        Invite New Employee
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Send an activation email. The employee will complete
                        their profile and set their password.
                    </p>
                </div>

                <form
                    onSubmit={onSubmit}
                    data-tour="invite-employee-form"
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                The activation link is sent to this email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="email">
                                    Work Email{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="employee@company.com"
                                    required
                                />
                            </div>

                            <div className="rounded-md border p-3 flex items-start gap-3">
                                <Switch
                                    id="isTransferableEmail"
                                    checked={isTransferableEmail}
                                    onCheckedChange={setIsTransferableEmail}
                                />
                                <div className="space-y-1">
                                    <Label
                                        htmlFor="isTransferableEmail"
                                        className="cursor-pointer"
                                    >
                                        Shared / role inbox
                                    </Label>
                                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                        Enable for role-based or shared
                                        mailboxes (e.g. hr@company.com). When
                                        this account is deleted, the email is
                                        released so it can be assigned to the
                                        next occupant. Leave off for personal
                                        emails.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>HR Information</CardTitle>
                            <CardDescription>
                                Optional — can be edited later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="employeeId">Employee ID</Label>
                                <Input
                                    id="employeeId"
                                    value={employeeId}
                                    onChange={(e) =>
                                        setEmployeeId(e.target.value)
                                    }
                                    placeholder="E12345"
                                />
                            </div>
                            <div>
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) =>
                                        setJobTitle(e.target.value)
                                    }
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={department}
                                    onChange={(e) =>
                                        setDepartment(e.target.value)
                                    }
                                    placeholder="Engineering"
                                />
                            </div>
                            <div>
                                <DateInput
                                    label="Hire Date"
                                    value={hireDate}
                                    onChange={(d) => setHireDate(d ?? null)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="managerId">Manager</Label>
                                <EmployeeCombobox
                                    value={managerId}
                                    onChange={setManagerId}
                                    placeholder="Select manager…"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Search by name, email, ID, department, or
                                    job title.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/employees")}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </div>
                </form>
            </motion.main>
        </ProtectedRoute>
    );
}
