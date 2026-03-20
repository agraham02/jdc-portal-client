"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HrDocumentsService } from "@/lib/services/file";
import type { HrCategory } from "@/lib/types/file";
import {
    FileUpload,
    type UploadingFileMetadata,
} from "@/components/common/FileUpload";
import {
    FileUploadCategory,
    getAllowedFileTypes,
    getFileSizeLimitMB,
} from "@/lib/constants/file-upload";
import { toast } from "sonner";
import { Upload, AlertCircle, FileIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HRUploadPage() {
    const [uploadingFiles, setUploadingFiles] = useState<
        UploadingFileMetadata[]
    >([]);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>("");
    const [isPublic, setIsPublic] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<HrCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories on mount
    useEffect(() => {
        HrDocumentsService.getCategories({ limit: 100, isActive: true })
            .then((res) => {
                setCategories(res.categories);
                // Set default to "other" if available
                const otherCat = res.categories.find((c) => c.slug === "other");
                if (otherCat) {
                    setCategory(otherCat._id);
                } else if (res.categories.length > 0) {
                    setCategory(res.categories[0]._id);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingCategories(false));
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadingFiles.length === 0) {
            toast.error("Please select a file to upload");
            return;
        }

        const file = uploadingFiles[0].file;

        setSubmitting(true);

        try {
            await HrDocumentsService.uploadFile(
                file,
                {
                    description: description.trim() || undefined,
                    category: "hr_document", // Fixed category for HR documents
                    hrCategory: category || undefined, // HR category selection
                    isPublic: isPublic,
                },
                // Real progress callback
                (percent) => {
                    setUploadingFiles((prev) =>
                        prev.map((uf) =>
                            uf.file === file
                                ? { ...uf, progress: percent }
                                : uf,
                        ),
                    );
                },
            );

            // Mark upload as complete
            setUploadingFiles((prev) =>
                prev.map((uf) =>
                    uf.file === file
                        ? { ...uf, progress: 100, uploadComplete: true }
                        : uf,
                ),
            );

            toast.success("HR document uploaded successfully!");

            // Reset form after a short delay to show completion
            setTimeout(() => {
                setUploadingFiles([]);
                setDescription("");
                setCategory(
                    categories.find((c) => c.slug === "other")?._id ||
                        categories[0]?._id ||
                        "",
                );
                setIsPublic(false);
            }, 1000);
        } catch (err: unknown) {
            // Set error state
            setUploadingFiles((prev) =>
                prev.map((uf) =>
                    uf.file === file
                        ? {
                              ...uf,
                              error:
                                  typeof err === "object" &&
                                  err &&
                                  "message" in err
                                      ? String(
                                            (err as { message?: string })
                                                .message,
                                        )
                                      : "Upload failed",
                          }
                        : uf,
                ),
            );

            const msg =
                typeof err === "object" && err && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Upload failed";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_CREATE]}>
            <main className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href="/hr-resources"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to HR Resources
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            Upload HR Document
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Add new documents to the HR resources library
                        </motion.p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upload Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card data-tour="hr-upload-form">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Document Upload
                                </CardTitle>
                                <CardDescription>
                                    Upload HR documents, policies, and resources
                                    for your organization
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onSubmit} className="space-y-6">
                                    {/* File Upload Area */}
                                    <div
                                        className="space-y-2"
                                        data-tour="hr-upload-file-area"
                                    >
                                        <Label>File *</Label>
                                        <FileUpload
                                            category={
                                                FileUploadCategory.HR_DOCUMENT
                                            }
                                            uploadingFiles={uploadingFiles}
                                            onUploadingFilesChange={
                                                setUploadingFiles
                                            }
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="Brief description of the document (optional)"
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div
                                        className="space-y-2"
                                        data-tour="hr-upload-category"
                                    >
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        {loadingCategories ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
                                            <Select
                                                value={category}
                                                onValueChange={setCategory}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat._id}
                                                            value={cat._id}
                                                        >
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {/* Public Access Toggle */}
                                    <div
                                        className="flex items-center justify-between rounded-lg border p-4"
                                        data-tour="hr-upload-visibility"
                                    >
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="isPublic"
                                                className="font-medium"
                                            >
                                                Public Access
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Make this document visible to
                                                all users. If disabled, only
                                                users with FILE_READ permission
                                                can see it.
                                            </p>
                                        </div>
                                        <Switch
                                            id="isPublic"
                                            checked={isPublic}
                                            onCheckedChange={setIsPublic}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={
                                                uploadingFiles.length === 0 ||
                                                submitting
                                            }
                                            className="flex items-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    Upload Document
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={submitting}
                                            onClick={() => {
                                                setUploadingFiles([]);
                                                setDescription("");
                                                setCategory(
                                                    categories.find(
                                                        (c) =>
                                                            c.slug === "other",
                                                    )?._id ||
                                                        categories[0]?._id ||
                                                        "",
                                                );
                                                setIsPublic(false);
                                            }}
                                        >
                                            Clear Form
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Upload Guidelines */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* File Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileIcon className="w-5 h-5" />
                                    File Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium text-sm mb-2">
                                        Supported formats:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {getAllowedFileTypes(
                                            FileUploadCategory.HR_DOCUMENT,
                                        ).extensions.map((ext) => (
                                            <Badge
                                                key={ext}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {ext
                                                    .toUpperCase()
                                                    .replace(".", "")}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium text-sm mb-1">
                                        Maximum size:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {getFileSizeLimitMB(
                                            FileUploadCategory.HR_DOCUMENT,
                                        )}
                                        MB per file
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-sm mb-1">
                                        Security:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Files are automatically scanned and
                                        encrypted
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600" />
                                    Upload Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <p>
                                        Use descriptive filenames for better
                                        organization
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <p>
                                        Select the appropriate category for
                                        easier discovery
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <p>
                                        Include a brief description for context
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                    <p>
                                        Large files may take longer to process
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
