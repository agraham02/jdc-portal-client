"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    profileUpdateSchema,
    type ProfileUpdateFormData,
} from "@/lib/validations/profile";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
// import { FileService } from "@/lib/services/files";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB per backend policy
const ALLOWED_AVATAR_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

export default function Page() {
    const { user, refresh } = useAuth();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const defaultValues = useMemo<ProfileUpdateFormData>(
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
    } = useForm<ProfileUpdateFormData>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues,
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

    const onSubmit = async (data: ProfileUpdateFormData) => {
        setSubmitting(true);
        try {
            // 1) Update textual fields
            await AuthService.updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
            });

            // 2) If avatar selected, upload it to Files service as profile_image
            if (avatarFile && user?._id) {
                // await FileService.uploadProfileImage(avatarFile, {
                //     description: "Profile image",
                //     isPublic: false,
                //     relatedEntityId: user._id,
                //     relatedEntityType: "User",
                // });
                // Note: backend does not yet tie file to user profile; this prepares the file and enforces policy.
            }

            toast.success("Profile updated");
            await refresh();
            setAvatarFile(null);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Update failed";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const initials = `${(user?.firstName || "").charAt(0)}${(
        user?.lastName || ""
    ).charAt(0)}`.toUpperCase();

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <p className="text-gray-600">
                View and edit your personal information.
            </p>

            <Card className="p-6 space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            {avatarPreview ? (
                                <AvatarImage
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                />
                            ) : (
                                // Fallback: no actual stored avatar wired yet; show initials
                                <AvatarFallback>
                                    {initials || "U"}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar</Label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    onSelectAvatar(e.target.files?.[0] || null)
                                }
                            />
                            {avatarPreview && (
                                <Button
                                    variant="secondary"
                                    onClick={() => onSelectAvatar(null)}
                                >
                                    Remove
                                </Button>
                            )}
                            <p className="text-xs text-gray-500">
                                JPEG/PNG/GIF/WebP, up to 2MB.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First name</Label>
                            <Input id="firstName" {...register("firstName")} />
                            {errors.firstName && (
                                <p className="text-sm text-red-600">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" {...register("lastName")} />
                            {errors.lastName && (
                                <p className="text-sm text-red-600">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="contactEmail">Contact email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                {...register("contactEmail")}
                            />
                            {errors.contactEmail && (
                                <p className="text-sm text-red-600">
                                    {errors.contactEmail.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="contactPhone">Contact phone</Label>
                            <Input
                                id="contactPhone"
                                {...register("contactPhone")}
                            />
                            {errors.contactPhone && (
                                <p className="text-sm text-red-600">
                                    {errors.contactPhone.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={submitting || (!isDirty && !avatarFile)}
                        >
                            {submitting ? "Saving..." : "Save changes"}
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={submitting}
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
        </main>
    );
}
