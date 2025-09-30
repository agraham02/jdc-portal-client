"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { userService } from "@/lib/services/user";
import { EmployeeService } from "@/lib/services/employee";
import { VendorService } from "@/lib/services/vendor";
import { toast } from "sonner";

type EntityType = "user" | "employee" | "vendor";

type Props = {
    entityType: EntityType;
    id: string;
    // permission check: whether current user can update this entity
    canUpdate?: boolean;
};

export function EntityDetail({ entityType, id, canUpdate }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [form, setForm] = useState<Record<string, any>>({});

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                let resp: any;
                if (entityType === "user")
                    resp = await userService.getUserById(id);
                else if (entityType === "employee")
                    resp = await EmployeeService.getEmployee(id);
                else resp = await VendorService.getVendor(id);
                if (cancelled) return;
                setData(resp);
                // Pre-populate a minimal form
                setForm({
                    firstName: resp.firstName ?? resp.userId?.firstName ?? "",
                    lastName: resp.lastName ?? resp.userId?.lastName ?? "",
                    email: resp.email ?? resp.userId?.email ?? "",
                    companyName: resp.companyName ?? "",
                    jobTitle: resp.jobTitle ?? "",
                });
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

    const onChange = (key: string, value: any) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const onSave = async () => {
        try {
            if (entityType === "user") {
                await userService.updateUser(id, {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    contactPhone: form.contactPhone,
                });
            } else if (entityType === "employee") {
                await EmployeeService.updateEmployee(id, {
                    jobTitle: form.jobTitle,
                    department: form.department,
                });
            } else {
                await VendorService.updateVendor(id, {
                    companyName: form.companyName,
                    website: form.website,
                });
            }
            toast.success("Saved");
            setEditing(false);
            // Refresh by reloading the route
            router.refresh();
        } catch (e) {
            toast.error((e as Error)?.message || "Failed to save");
        }
    };

    if (loading) return <div className="py-6">Loading…</div>;
    if (!data)
        return <div className="py-6 text-muted-foreground">Not found</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        {entityType === "user"
                            ? `${data.firstName ?? data.fullName ?? "User"} ${
                                  data.lastName ?? ""
                              }`
                            : entityType === "employee"
                            ? `${data.userId?.firstName ?? ""} ${
                                  data.userId?.lastName ?? ""
                              }`
                            : data.companyName}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                        ID: {id}
                    </div>
                </div>
                {canUpdate && (
                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <Button onClick={onSave}>Save</Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setEditing(false)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name & Email */}
                <div>
                    <label className="text-sm font-medium">First name</label>
                    <Input
                        value={form.firstName || ""}
                        onChange={(e) => onChange("firstName", e.target.value)}
                        disabled={!editing}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Last name</label>
                    <Input
                        value={form.lastName || ""}
                        onChange={(e) => onChange("lastName", e.target.value)}
                        disabled={!editing}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={form.email || ""} disabled />
                </div>

                {/* Entity-specific */}
                {entityType === "employee" && (
                    <>
                        <div>
                            <label className="text-sm font-medium">
                                Job Title
                            </label>
                            <Input
                                value={form.jobTitle || ""}
                                onChange={(e) =>
                                    onChange("jobTitle", e.target.value)
                                }
                                disabled={!editing}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Department
                            </label>
                            <Input
                                value={form.department || ""}
                                onChange={(e) =>
                                    onChange("department", e.target.value)
                                }
                                disabled={!editing}
                            />
                        </div>
                    </>
                )}

                {entityType === "vendor" && (
                    <>
                        <div>
                            <label className="text-sm font-medium">
                                Company Name
                            </label>
                            <Input
                                value={form.companyName || ""}
                                onChange={(e) =>
                                    onChange("companyName", e.target.value)
                                }
                                disabled={!editing}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Website
                            </label>
                            <Input
                                value={form.website || ""}
                                onChange={(e) =>
                                    onChange("website", e.target.value)
                                }
                                disabled={!editing}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default EntityDetail;
