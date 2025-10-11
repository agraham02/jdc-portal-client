"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
import { type VendorWithUser } from "@/lib/services/vendor";
import { type EmployeeWithUser } from "@/lib/services/employee";
import { useConditionalApi } from "@/lib/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { format } from "date-fns";
import { Upload, User as UserIcon, Lock, Info } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressForm, ServicesInput, StatusBadge } from "@/components/common";

// Profile update schema
const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    contactEmail: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),
    contactPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Change password schema - matches backend DTO
const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(12, "Password must be at least 12 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                "Password must contain uppercase, lowercase, number, and special character"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_AVATAR_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

export default function ProfilePage() {
    const { user, refresh } = useAuth();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [submittingProfile, setSubmittingProfile] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    // Fetch vendor data with SWR - only when user is a Vendor
    const {
        data: vendorData,
        isLoading: loadingVendor,
        error: vendorError,
    } = useConditionalApi<VendorWithUser>(
        "/vendors/me",
        user?.accountType === "Vendor"
    );

    // Fetch employee data with SWR - only when user is an Employee
    // TODO: Update endpoint when backend supports /employees/me
    const {
        data: employeeData,
        isLoading: loadingEmployee,
        error: employeeError,
    } = useConditionalApi<EmployeeWithUser>(
        "/employees/me",
        user?.accountType === "Employee"
    );

    const loadingEntity = loadingVendor || loadingEmployee;

    // Log errors for debugging (not shown to user to avoid confusion if entity doesn't exist)
    useEffect(() => {
        if (vendorError) {
            console.error("Failed to load vendor data:", vendorError);
        }
        if (employeeError) {
            console.error("Failed to load employee data:", employeeError);
        }
    }, [vendorError, employeeError]);

    const defaultValues = useMemo<ProfileFormData>(
        () => ({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            contactEmail: user?.contactEmail || "",
            contactPhone: user?.contactPhone || "",
        }),
        [user]
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        control,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onBlur",
    });

    const {
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        control: passwordControl,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const onSelectAvatar = (file?: File | null) => {
        if (!file) {
            setAvatarFile(null);
            setAvatarPreview(null);
            return;
        }
        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            toast.warning("Invalid file type", {
                description: "Use JPEG, PNG, GIF, or WebP.",
            });
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            toast.warning("File too large", { description: "Max 2MB." });
            return;
        }
        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    const onSubmitProfile = async (data: ProfileFormData) => {
        setSubmittingProfile(true);
        try {
            await AuthService.updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
            });

            // TODO: If avatar selected, upload it via FileService
            // if (avatarFile && user?._id) {
            //     await FileService.uploadProfileImage(avatarFile);
            // }

            toast.success("Profile updated successfully");
            await refresh();
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Update failed";
            toast.error(msg);
        } finally {
            setSubmittingProfile(false);
        }
    };

    const onSubmitPassword = async (data: PasswordFormData) => {
        setSubmittingPassword(true);
        try {
            await AuthService.changePassword(data);
            toast.success("Password changed successfully");
            resetPassword();
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : "Password change failed";
            toast.error(msg);
        } finally {
            setSubmittingPassword(false);
        }
    };

    const initials = `${(user?.firstName || "").charAt(0)}${(
        user?.lastName || ""
    ).charAt(0)}`.toUpperCase();

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and account settings
                </p>
            </div>

            {/* Avatar Section */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Profile Picture</h2>
                </div>
                <Separator className="mb-6" />
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        {avatarPreview ? (
                            <AvatarImage
                                src={avatarPreview}
                                alt="Avatar preview"
                            />
                        ) : (
                            <AvatarFallback className="text-2xl">
                                {initials || "U"}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="space-y-3">
                        <Label
                            htmlFor="avatar"
                            className="cursor-pointer inline-block"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                                <Upload className="h-4 w-4" />
                                <span>Upload Photo</span>
                            </div>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                    onSelectAvatar(e.target.files?.[0] || null)
                                }
                            />
                        </Label>
                        {avatarPreview && (
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSelectAvatar(null)}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            JPEG, PNG, GIF, or WebP. Max 2MB.
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                            Note: Avatar upload integration pending backend
                            support.
                        </p>
                    </div>
                </div>
            </Card>

            {/* General Information */}
            <Card className="p-6">
                <form
                    onSubmit={handleSubmit(onSubmitProfile)}
                    className="space-y-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <UserIcon className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">
                                General Information
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Account and contact information
                        </p>
                        <Separator className="mb-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                First Name{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input id="firstName" {...register("firstName")} />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Last Name{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input id="lastName" {...register("lastName")} />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                {...register("contactEmail")}
                                placeholder="personal@example.com"
                            />
                            {errors.contactEmail && (
                                <p className="text-sm text-destructive">
                                    {errors.contactEmail.message}
                                </p>
                            )}
                        </div>
                        <Controller
                            name="contactPhone"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">
                                        Contact Phone
                                    </Label>
                                    <PhoneInput
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        value={field.value as any}
                                        onChange={(val) =>
                                            field.onChange(val || "")
                                        }
                                        placeholder="+1 234-567-8900"
                                    />
                                    {errors.contactPhone && (
                                        <p className="text-sm text-destructive">
                                            {errors.contactPhone.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Addresses - Read Only */}
                    {(user?.physicalAddress || user?.mailingAddress) && (
                        <>
                            <Separator />
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium">
                                    Addresses
                                </h3>
                                {user.physicalAddress && (
                                    <AddressForm
                                        label="Physical Address"
                                        value={user.physicalAddress}
                                        disabled
                                        idPrefix="physical"
                                    />
                                )}
                                {user.mailingAddress && (
                                    <>
                                        <Separator />
                                        <AddressForm
                                            label="Mailing Address"
                                            value={user.mailingAddress}
                                            disabled
                                            idPrefix="mailing"
                                        />
                                    </>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Contact support to update your addresses.
                                </p>
                            </div>
                        </>
                    )}

                    <Separator />

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={
                                submittingProfile || (!isDirty && !avatarFile)
                            }
                        >
                            {submittingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={submittingProfile}
                            onClick={() => {
                                reset(defaultValues);
                                setAvatarFile(null);
                                setAvatarPreview(null);
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Vendor-Specific Information */}
            {user?.accountType === "Vendor" && vendorData && !loadingEntity && (
                <Card className="p-6">
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="h-5 w-5" />
                                <h2 className="text-xl font-semibold">
                                    Vendor Information
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Company and service details (read-only)
                            </p>
                            <Separator className="mb-6" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={vendorData.companyName}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={vendorData.website || ""}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Name</Label>
                                <Input
                                    value={vendorData.contactName || ""}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Email</Label>
                                <Input
                                    value={vendorData.contactEmail}
                                    disabled
                                />
                            </div>
                        </div>

                        {vendorData.servicesOffered &&
                            vendorData.servicesOffered.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Services Offered</Label>
                                        <ServicesInput
                                            value={vendorData.servicesOffered}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}

                        {(vendorData.physicalAddress ||
                            vendorData.mailingAddress) && (
                            <>
                                <Separator />
                                <div className="space-y-6">
                                    {vendorData.physicalAddress && (
                                        <AddressForm
                                            label="Business Physical Address"
                                            value={vendorData.physicalAddress}
                                            disabled
                                            idPrefix="vendor-physical"
                                        />
                                    )}
                                    {vendorData.mailingAddress && (
                                        <>
                                            <Separator />
                                            <AddressForm
                                                label="Business Mailing Address"
                                                value={
                                                    vendorData.mailingAddress
                                                }
                                                disabled
                                                idPrefix="vendor-mailing"
                                            />
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Contact support to update vendor information.
                        </p>
                    </div>
                </Card>
            )}

            {/* Employee-Specific Information */}
            {user?.accountType === "Employee" &&
                employeeData &&
                !loadingEntity && (
                    <Card className="p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="h-5 w-5" />
                                    <h2 className="text-xl font-semibold">
                                        Employee Information
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    HR-specific fields (read-only)
                                </p>
                                <Separator className="mb-6" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Employee ID</Label>
                                    <Input
                                        value={employeeData.employeeId || "N/A"}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input
                                        value={employeeData.jobTitle || "N/A"}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input
                                        value={employeeData.department || "N/A"}
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hire Date</Label>
                                    <Input
                                        value={
                                            employeeData.hireDate
                                                ? format(
                                                      new Date(
                                                          employeeData.hireDate
                                                      ),
                                                      "PPP"
                                                  )
                                                : "N/A"
                                        }
                                        disabled
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Contact HR to update employee information.
                            </p>
                        </div>
                    </Card>
                )}

            {/* Change Password */}
            <Card className="p-6">
                <form
                    onSubmit={handleSubmitPassword(onSubmitPassword)}
                    className="space-y-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">
                                Change Password
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Update your account password
                        </p>
                        <Separator className="mb-6" />
                    </div>

                    <div className="space-y-4 max-w-md">
                        <Controller
                            name="oldPassword"
                            control={passwordControl}
                            render={({ field }) => (
                                <PasswordInput
                                    {...field}
                                    label={
                                        <>
                                            Current Password{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </>
                                    }
                                    placeholder="Enter current password"
                                    id="oldPassword"
                                    error={passwordErrors.oldPassword?.message}
                                />
                            )}
                        />
                        <Controller
                            name="newPassword"
                            control={passwordControl}
                            render={({ field }) => (
                                <PasswordInput
                                    {...field}
                                    label={
                                        <>
                                            New Password{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </>
                                    }
                                    placeholder="Enter new password"
                                    id="newPassword"
                                    showPasswordHint
                                    error={passwordErrors.newPassword?.message}
                                />
                            )}
                        />
                        <Controller
                            name="confirmPassword"
                            control={passwordControl}
                            render={({ field }) => (
                                <PasswordInput
                                    {...field}
                                    label={
                                        <>
                                            Confirm New Password{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </>
                                    }
                                    placeholder="Confirm new password"
                                    id="confirmPassword"
                                    error={
                                        passwordErrors.confirmPassword?.message
                                    }
                                />
                            )}
                        />
                    </div>

                    <Button type="submit" disabled={submittingPassword}>
                        {submittingPassword
                            ? "Changing Password..."
                            : "Change Password"}
                    </Button>
                </form>
            </Card>

            {/* Account Information (Read-only) */}
            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">
                                Account Information
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Account details and status
                        </p>
                        <Separator className="mb-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email (Login)</Label>
                            <Input value={user?.email || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Status</Label>
                            <div className="flex items-center h-10">
                                {user && (
                                    <StatusBadge
                                        type="user"
                                        status={user.status}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Type</Label>
                            <Input value={user?.accountType || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <Input
                                value={
                                    user?.roles
                                        ?.map((r) =>
                                            typeof r === "string" ? r : r.name
                                        )
                                        .join(", ") || ""
                                }
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Created</Label>
                            <Input
                                value={
                                    user?.createdAt
                                        ? format(
                                              new Date(user.createdAt),
                                              "PPP"
                                          )
                                        : "N/A"
                                }
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Updated</Label>
                            <Input
                                value={
                                    user?.updatedAt
                                        ? format(
                                              new Date(user.updatedAt),
                                              "PPP"
                                          )
                                        : "N/A"
                                }
                                disabled
                            />
                        </div>
                        {user?.lastLogin && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>Last Login</Label>
                                <Input
                                    value={format(
                                        new Date(user.lastLogin),
                                        "PPP p"
                                    )}
                                    disabled
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </main>
    );
}
