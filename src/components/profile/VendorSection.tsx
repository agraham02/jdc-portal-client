"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Info, Edit2, X, Building2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthz } from "@/lib/authz/useAuthz";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type { VendorWithUser } from "@/lib/services/vendor";
import { ServicesInput } from "../common";

// Fields that vendors can edit themselves
const vendorSelfEditSchema = z.object({
    companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    contactName: z.string().max(50).optional(),
    servicesOffered: z.array(z.string()).optional(), // Array of strings
});

type VendorSelfEditData = z.infer<typeof vendorSelfEditSchema>;

interface VendorSectionProps {
    vendor: VendorWithUser;
    onUpdate: (data: Partial<VendorWithUser>) => Promise<void>;
}

export function VendorSection({ vendor, onUpdate }: VendorSectionProps) {
    const { hasAny } = useAuthz();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user has admin permissions (for viewing notes)
    const canViewAdminFields = hasAny([P.VENDOR_UPDATE_ALL]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<VendorSelfEditData>({
        resolver: zodResolver(vendorSelfEditSchema),
        defaultValues: {
            companyName: vendor.companyName || "",
            website: vendor.website || "",
            contactName: vendor.contactName || "",
            servicesOffered: vendor.servicesOffered || [],
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: VendorSelfEditData) => {
        setIsSubmitting(true);
        try {
            await onUpdate({
                companyName: data.companyName,
                website: data.website || undefined,
                contactName: data.contactName || undefined,
                servicesOffered: data.servicesOffered || [],
            });
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
                            <Building2 className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">
                                Vendor Information
                            </h2>
                        </div>
                        {!isEditing && (
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
                        Your company profile information
                    </p>
                    <Separator className="mb-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">
                            Company Name{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        {isEditing ? (
                            <>
                                <Input
                                    id="companyName"
                                    {...register("companyName")}
                                    placeholder="Your Company Inc."
                                />
                                {errors.companyName && (
                                    <p className="text-sm text-destructive">
                                        {errors.companyName.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input value={vendor.companyName} disabled />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        {isEditing ? (
                            <>
                                <Input
                                    id="website"
                                    {...register("website")}
                                    placeholder="https://yourcompany.com"
                                    type="url"
                                />
                                {errors.website && (
                                    <p className="text-sm text-destructive">
                                        {errors.website.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                value={vendor.website || "Not provided"}
                                disabled
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactName">
                            Primary Contact Name
                        </Label>
                        {isEditing ? (
                            <>
                                <Input
                                    id="contactName"
                                    {...register("contactName")}
                                    placeholder="John Smith"
                                />
                                {errors.contactName && (
                                    <p className="text-sm text-destructive">
                                        {errors.contactName.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <Input
                                value={vendor.contactName || "Not provided"}
                                disabled
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                            value={vendor.contactEmail || "Not provided"}
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">
                            Update in General Information section
                        </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Controller
                            name="servicesOffered"
                            control={control}
                            render={({ field }) => (
                                <ServicesInput
                                    id="servicesOffered"
                                    label="Services Offered"
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    disabled={!isEditing}
                                    placeholder="Type and press Enter to add"
                                    error={errors.servicesOffered?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Admin-only notes field (read-only for vendors) */}
                    {canViewAdminFields && vendor.notes && (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Admin Notes</Label>
                            <Textarea
                                value={vendor.notes}
                                disabled
                                className="min-h-[100px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Internal notes (admin only)
                            </p>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                        <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            You can update your company information, services,
                            and contact details. Contact support if you need
                            help.
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
