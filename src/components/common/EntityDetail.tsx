"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    EmployeeService,
    type EmployeeWithUser,
    type UpdateEmployeeDto,
} from "@/lib/services/employee";
import {
    VendorService,
    type VendorWithUser,
    type UpdateVendorDto,
} from "@/lib/services/vendor";
import type { Address } from "@/lib/types/auth";
import { UserStatus } from "@/lib/types/auth";
import { toast } from "sonner";
import { format } from "date-fns";
import { PhoneInput } from "../ui/phone-input";
import { AddressForm, DateInput, EmployeeCombobox, ServicesInput, StatusBadge } from ".";
import { AuthService } from "@/lib/services/auth";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { DEPARTMENT_OPTIONS } from "@/lib/constants/departments";

type EntityType = "user" | "employee" | "vendor";

type Props = Readonly<{
    entityType: EntityType;
    id: string;
    canUpdate?: boolean;
}>;

export function EntityDetail({ entityType, id, canUpdate }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [resending, setResending] = useState(false);
    const [saving, setSaving] = useState(false);
    const { hasAny } = useAuthz();
    const canResendActivation = hasAny([P.EMPLOYEE_CREATE, P.EMPLOYEE_UPDATE]);
    const [data, setData] = useState<EmployeeWithUser | VendorWithUser | null>(
        null
    );
    const [form, setForm] = useState<Record<string, unknown>>({});

    // Status options available for employees (managers/admins can set these)
    const employeeStatusOptions = useMemo(
        () => [
            { value: UserStatus.ACTIVE, label: "Active" },
            { value: UserStatus.INACTIVE, label: "Inactive" },
            { value: UserStatus.ONBOARDING, label: "Onboarding" },
            { value: UserStatus.TERMINATED, label: "Terminated" },
        ],
        []
    );



    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                let resp: EmployeeWithUser | VendorWithUser;
                if (entityType === "user") {
                    // User type not fully supported yet in this component
                    throw new Error("User entity type not implemented");
                } else if (entityType === "employee") {
                    resp = await EmployeeService.getEmployee(id);
                } else {
                    resp = await VendorService.getVendor(id);
                }
                if (cancelled) return;
                setData(resp);

                // Pre-populate form based on entity type
                if (entityType === "employee") {
                    const employee = resp as EmployeeWithUser;
                    setForm({
                        employeeId: employee.employeeId ?? "",
                        jobTitle: employee.jobTitle ?? "",
                        department: employee.department ?? "",
                        hireDate: employee.hireDate
                            ? new Date(employee.hireDate)
                            : null,
                        status: employee.userId?.status ?? UserStatus.ACTIVE,
                        managerId: employee.managerId ?? "",
                    });
                } else if (entityType === "vendor") {
                    const vendor = resp as VendorWithUser;
                    setForm({
                        companyName: vendor.companyName ?? "",
                        website: vendor.website ?? "",
                        contactName: vendor.contactName ?? "",
                        contactEmail: vendor.contactEmail ?? "",
                        contactPhone: vendor.contactPhone ?? "",
                        servicesOffered: vendor.servicesOffered ?? [],
                        notes: vendor.notes ?? "",
                        physicalAddress: vendor.physicalAddress ?? {
                            line1: "",
                            city: "",
                            state: "",
                            zip: "",
                        },
                        mailingAddress: vendor.mailingAddress ?? {
                            line1: "",
                            city: "",
                            state: "",
                            zip: "",
                        },
                    });
                }
            } catch (e) {
                toast.error((e as Error)?.message || "Failed to load");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [entityType, id]);

    const onChange = (key: string, value: unknown) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const onSave = async () => {
        setSaving(true);
        try {
            if (entityType === "employee") {
                const updateData: UpdateEmployeeDto = {
                    employeeId: form.employeeId as string | undefined,
                    jobTitle: form.jobTitle as string | undefined,
                    department: form.department as string | undefined,
                    hireDate: form.hireDate
                        ? (form.hireDate as Date).toISOString()
                        : undefined,
                    status: form.status as UserStatus | undefined,
                    managerId: (form.managerId as string) || undefined,
                };
                await EmployeeService.updateEmployee(id, updateData);
                toast.success("Employee updated successfully");
            } else if (entityType === "vendor") {
                const updateData: UpdateVendorDto = {
                    companyName: form.companyName as string | undefined,
                    website: form.website as string | undefined,
                    contactName: form.contactName as string | undefined,
                    contactEmail: form.contactEmail as string | undefined,
                    contactPhone: form.contactPhone as string | undefined,
                    servicesOffered: form.servicesOffered as
                        | string[]
                        | undefined,
                    notes: form.notes as string | undefined,
                };
                await VendorService.updateVendor(id, updateData);
                toast.success("Vendor updated successfully");
            }
            setEditing(false);
            // Reload data
            const resp =
                entityType === "employee"
                    ? await EmployeeService.getEmployee(id)
                    : await VendorService.getVendor(id);
            setData(resp);
            router.refresh();
        } catch (e) {
            const error = e as Error;
            // Check for specific error messages
            if (error.message?.includes("Employee ID already exists")) {
                toast.error(
                    "Employee ID is already in use. Please choose a different ID."
                );
            } else if (error.message?.includes("cannot be their own manager")) {
                toast.error(
                    "An employee cannot be assigned as their own manager."
                );
            } else if (
                error.message?.includes("only update your contact information")
            ) {
                toast.error(
                    "You can only update your contact information. Contact your manager or HR to update other fields."
                );
            } else {
                toast.error(error?.message || "Failed to save changes");
            }
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => {
        setEditing(false);
        // Reset form to original data
        if (data && entityType === "employee") {
            const employee = data as EmployeeWithUser;
            setForm({
                employeeId: employee.employeeId ?? "",
                jobTitle: employee.jobTitle ?? "",
                department: employee.department ?? "",
                hireDate: employee.hireDate
                    ? new Date(employee.hireDate)
                    : null,
                status: employee.userId?.status ?? UserStatus.ACTIVE,
                managerId: employee.managerId ?? "",
            });
        } else if (data && entityType === "vendor") {
            const vendor = data as VendorWithUser;
            setForm({
                companyName: vendor.companyName ?? "",
                website: vendor.website ?? "",
                contactName: vendor.contactName ?? "",
                contactEmail: vendor.contactEmail ?? "",
                contactPhone: vendor.contactPhone ?? "",
                servicesOffered: vendor.servicesOffered ?? [],
                notes: vendor.notes ?? "",
                physicalAddress: vendor.physicalAddress,
                mailingAddress: vendor.mailingAddress,
            });
        }
    };

    // Handler to resend activation email for pending/onboarding employees
    const onResendActivation = async () => {
        if (!data?.userId?._id) return;
        setResending(true);
        try {
            await AuthService.resendActivation(data.userId._id);
            toast.success("Activation email sent");
        } catch (e) {
            toast.error(
                (e as Error)?.message || "Failed to send activation email"
            );
        } finally {
            setResending(false);
        }
    };

    // Check if resend activation should be shown (pending/onboarding employee)
    const showResendActivation = useMemo(() => {
        if (entityType !== "employee") return false;
        if (!canResendActivation) return false;
        const status = data?.userId?.status;
        return (
            status === UserStatus.PENDING || status === UserStatus.ONBOARDING
        );
    }, [entityType, canResendActivation, data?.userId?.status]);

    if (loading)
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading…</div>
            </div>
        );
    if (!data)
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Not found</div>
            </div>
        );

    const user = data.userId;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">
                        {entityType === "employee"
                            ? `${user?.firstName ?? ""} ${
                                  user?.lastName ?? ""
                              }`.trim() || "Employee Details"
                            : (data as VendorWithUser).companyName ||
                              "Vendor Details"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>ID: {id}</span>
                        {user && (
                            <StatusBadge type="user" status={user.status} />
                        )}
                    </div>
                </div>
                {canUpdate && (
                    <div className="flex gap-2">
                        {showResendActivation && (
                            <Button
                                variant="outline"
                                onClick={onResendActivation}
                                disabled={resending}
                            >
                                {resending ? "Sending..." : "Resend Activation"}
                            </Button>
                        )}
                        {editing ? (
                            <>
                                <Button onClick={onSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setEditing(true)}>
                                Edit
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* User Information (Read-only) */}
            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">User Information</h2>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>First Name</Label>
                        <Input value={user?.firstName ?? ""} disabled />
                    </div>
                    <div>
                        <Label>Last Name</Label>
                        <Input value={user?.lastName ?? ""} disabled />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Email</Label>
                        <Input value={user?.email ?? ""} disabled />
                    </div>
                    <div>
                        <Label>Created At</Label>
                        <Input
                            value={
                                data.createdAt
                                    ? format(new Date(data.createdAt), "PPpp")
                                    : "N/A"
                            }
                            disabled
                        />
                    </div>
                    <div>
                        <Label>Last Updated</Label>
                        <Input
                            value={
                                data.updatedAt
                                    ? format(new Date(data.updatedAt), "PPpp")
                                    : "N/A"
                            }
                            disabled
                        />
                    </div>
                </div>
            </Card>

            {/* Employee-specific fields */}
            {entityType === "employee" && (
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">
                        Employee Information
                    </h2>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={(form.employeeId as string) ?? ""}
                                onChange={(e) =>
                                    onChange("employeeId", e.target.value)
                                }
                                disabled={!editing}
                                placeholder="EMP-12345"
                            />
                            {editing && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Must be unique across all employees
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                value={(form.jobTitle as string) ?? ""}
                                onChange={(e) =>
                                    onChange("jobTitle", e.target.value)
                                }
                                disabled={!editing}
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            {editing ? (
                                <Select
                                    value={(form.department as string) ?? ""}
                                    onValueChange={(value) =>
                                        onChange("department", value)
                                    }
                                >
                                    <SelectTrigger id="department">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEPARTMENT_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="department"
                                    value={(form.department as string) ?? ""}
                                    disabled
                                    placeholder="Not assigned"
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="hireDate">Hire Date</Label>
                            {editing ? (
                                <DateInput
                                    label=""
                                    value={(form.hireDate as Date) || null}
                                    onChange={(date) =>
                                        onChange("hireDate", date)
                                    }
                                    disabled={false}
                                />
                            ) : (
                                <Input
                                    id="hireDate"
                                    value={
                                        form.hireDate
                                            ? format(
                                                  new Date(
                                                      form.hireDate as Date
                                                  ),
                                                  "PP"
                                              )
                                            : "Not set"
                                    }
                                    disabled
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={
                                    (form.status as string) ?? UserStatus.ACTIVE
                                }
                                onValueChange={(value) =>
                                    onChange("status", value)
                                }
                                disabled={!editing}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeeStatusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="managerId">Manager</Label>
                            <EmployeeCombobox
                                value={(form.managerId as string) ?? ""}
                                onChange={(value) => onChange("managerId", value)}
                                disabled={!editing}
                                excludeEmployeeId={id}
                                placeholder={editing ? "Select manager..." : (form.managerId as string) ? "Loading..." : "No Manager"}
                            />
                            {editing && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Search by name, email, ID, department, or job title
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Vendor-specific fields */}
            {entityType === "vendor" && (
                <>
                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">
                            Company Information
                        </h2>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="companyName">
                                    Company Name
                                </Label>
                                <Input
                                    id="companyName"
                                    value={(form.companyName as string) ?? ""}
                                    onChange={(e) =>
                                        onChange("companyName", e.target.value)
                                    }
                                    disabled={!editing}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={(form.website as string) ?? ""}
                                    onChange={(e) =>
                                        onChange("website", e.target.value)
                                    }
                                    disabled={!editing}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">
                            Contact Information
                        </h2>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contactName">
                                    Contact Name
                                </Label>
                                <Input
                                    id="contactName"
                                    value={(form.contactName as string) ?? ""}
                                    onChange={(e) =>
                                        onChange("contactName", e.target.value)
                                    }
                                    disabled={!editing}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactEmail">
                                    Contact Email
                                </Label>
                                <Input
                                    id="contactEmail"
                                    value={(form.contactEmail as string) ?? ""}
                                    disabled
                                    placeholder="contact@example.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <PhoneInput />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Services</h2>
                        <Separator />
                        <ServicesInput
                            value={(form.servicesOffered as string[]) ?? []}
                            onChange={(value) =>
                                onChange("servicesOffered", value)
                            }
                            disabled={!editing}
                        />
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Addresses</h2>
                        <Separator />
                        <div className="space-y-6">
                            <AddressForm
                                label="Physical Address"
                                value={
                                    (form.physicalAddress as Address) ??
                                    undefined
                                }
                                onChange={(value) =>
                                    onChange("physicalAddress", value)
                                }
                                disabled
                                idPrefix="physical"
                            />
                            <Separator />
                            <AddressForm
                                label="Mailing Address"
                                value={
                                    (form.mailingAddress as Address) ??
                                    undefined
                                }
                                onChange={(value) =>
                                    onChange("mailingAddress", value)
                                }
                                disabled
                                idPrefix="mailing"
                            />
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <h2 className="text-xl font-semibold">Notes</h2>
                        <Separator />
                        <div>
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Textarea
                                id="notes"
                                value={(form.notes as string) ?? ""}
                                onChange={(e) =>
                                    onChange("notes", e.target.value)
                                }
                                disabled={!editing}
                                placeholder="Internal admin notes..."
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                These notes are for internal use only and not
                                visible to the vendor.
                            </p>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

export default EntityDetail;
