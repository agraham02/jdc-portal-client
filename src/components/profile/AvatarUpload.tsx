"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Camera, Trash2, Loader2, Upload } from "lucide-react";
import { AuthService } from "@/lib/services/auth";
import { apiToast } from "@/lib/utils/toast-helpers";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
    profilePhotoUrl?: string;
    firstName?: string;
    lastName?: string;
    onAvatarChange?: () => void;
}

export function AvatarUpload({
    profilePhotoUrl,
    firstName,
    lastName,
    onAvatarChange,
}: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initials =
        `${firstName?.charAt(0) || ""}${
            lastName?.charAt(0) || ""
        }`.toUpperCase() || "?";

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            apiToast.error(
                "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            );
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            apiToast.error("File size exceeds 5MB limit.");
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        uploadAvatar(file);
    };

    const uploadAvatar = async (file: File) => {
        setIsUploading(true);
        try {
            await AuthService.uploadAvatar(file);
            apiToast.success("Avatar uploaded successfully");
            onAvatarChange?.();
        } catch (error) {
            apiToast.error("Failed to upload avatar", error);
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteAvatar = async () => {
        setIsDeleting(true);
        try {
            await AuthService.deleteAvatar();
            apiToast.success("Avatar deleted successfully");
            setPreviewUrl(null);
            onAvatarChange?.();
        } catch (error) {
            apiToast.error("Failed to delete avatar", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const displayUrl = previewUrl || profilePhotoUrl;
    const hasAvatar = !!displayUrl;

    return (
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Display */}
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-muted">
                        <AvatarImage src={displayUrl} alt="Profile photo" />
                        <AvatarFallback className="text-2xl font-semibold bg-primary/10">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* Upload overlay */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                            "absolute inset-0 flex items-center justify-center",
                            "bg-black/50 rounded-full opacity-0 group-hover:opacity-100",
                            "transition-opacity cursor-pointer",
                            isUploading && "opacity-100"
                        )}
                        aria-label="Upload photo"
                    >
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                            <Camera className="h-8 w-8 text-white" />
                        )}
                    </button>
                </div>

                {/* Upload Info and Actions */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                        <h3 className="text-lg font-medium">Profile Photo</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload a photo to personalize your profile.
                            <br />
                            Accepted formats: JPEG, PNG, GIF, WebP (max 5MB)
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {hasAvatar
                                        ? "Change Photo"
                                        : "Upload Photo"}
                                </>
                            )}
                        </Button>

                        {hasAvatar && !isUploading && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Remove Profile Photo
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to remove your
                                            profile photo? This action cannot be
                                            undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAvatar}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Remove
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Select profile photo"
                />
            </div>
        </Card>
    );
}
