"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { PhoneInput } from "../ui/phone-input";
import { AddressForm, DateInput, ServicesInput, StatusBadge } from ".";

type EntityType = "user" | "employee" | "vendor";

type Props = {
    entityType: EntityType;
    id: string;
    canUpdate?: boolean;
};

export function EntityDetail({ entityType, id, canUpdate }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [data, setData] = useState<EmployeeWithUser | VendorWithUser | null>(
        null
    );
    const [form, setForm] = useState<Record<string, unknown>>({});

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
        try {
            if (entityType === "employee") {
                const updateData: UpdateEmployeeDto = {
                    employeeId: form.employeeId as string | undefined,
                    jobTitle: form.jobTitle as string | undefined,
                    department: form.department as string | undefined,
                    hireDate: form.hireDate
                        ? (form.hireDate as Date).toISOString()
                        : undefined,
                };
                await EmployeeService.updateEmployee(id, updateData);
            } else if (entityType === "vendor") {
                const updateData: UpdateVendorDto = {
                    companyName: form.companyName as string | undefined,
                    website: form.website as string | undefined,
                    contactName: form.contactName as string | undefined,
                    servicesOffered: form.servicesOffered as
                        | string[]
                        | undefined,
                    notes: form.notes as string | undefined,
                };
                await VendorService.updateVendor(id, updateData);
            }
            toast.success("Saved successfully");
            setEditing(false);
            // Reload data
            const resp =
                entityType === "employee"
                    ? await EmployeeService.getEmployee(id)
                    : await VendorService.getVendor(id);
            setData(resp);
            router.refresh();
        } catch (e) {
            toast.error((e as Error)?.message || "Failed to save");
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
                        {user && <StatusBadge type="user" status={user.status} />}
                    </div>
                </div>
                {canUpdate && (
                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <Button onClick={onSave}>Save Changes</Button>
                                <Button variant="outline" onClick={onCancel}>
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
                                    ? format(new Date(data.createdAt), "PPP")
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
                                    ? format(new Date(data.updatedAt), "PPP")
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
                            <Input
                                id="department"
                                value={(form.department as string) ?? ""}
                                onChange={(e) =>
                                    onChange("department", e.target.value)
                                }
                                disabled={!editing}
                                placeholder="Engineering"
                            />
                        </div>
                        <DateInput
                        // label="Hire Date"
                        // value={(form.hireDate as Date) || null}
                        // onChange={(date) => onChange("hireDate", date)}
                        // disabled={!editing}
                        />
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
