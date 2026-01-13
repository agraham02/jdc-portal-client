"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Input } from "@/components/ui/input";
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
import { useState } from "react";
import { motion } from "motion/react";
import { HrDocumentsService } from "@/lib/services/file";
import {
    FileUpload,
    type UploadingFileMetadata,
} from "@/components/common/FileUpload";
import { toast } from "sonner";
import { Upload, AlertCircle, FileIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "text/plain",
];

const TYPE_LABELS: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "text/plain": "TXT",
};

export default function HRUploadPage() {
    const [uploadingFiles, setUploadingFiles] = useState<
        UploadingFileMetadata[]
    >([]);
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
                    tags: tags
                        ? tags
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                        : undefined,
                    isPublic: isPublic,
                },
                // Real progress callback
                (percent) => {
                    setUploadingFiles((prev) =>
                        prev.map((uf) =>
                            uf.file === file ? { ...uf, progress: percent } : uf
                        )
                    );
                }
            );

            toast.success("HR document uploaded successfully!");

            // Reset form after a short delay to show completion
            setTimeout(() => {
                setUploadingFiles([]);
                setDescription("");
                setTags("");
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
                                                .message
                                        )
                                      : "Upload failed",
                          }
                        : uf
                )
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
                        <Card>
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
                                    <div className="space-y-2">
                                        <Label>File *</Label>
                                        <FileUpload
                                            uploadingFiles={uploadingFiles}
                                            onUploadingFilesChange={
                                                setUploadingFiles
                                            }
                                            acceptedFileTypes={ALLOWED_TYPES}
                                            maxFiles={1}
                                            maxFileSizeMB={100}
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

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input
                                            id="tags"
                                            placeholder="e.g. policy, benefits, handbook (comma separated)"
                                            value={tags}
                                            onChange={(e) =>
                                                setTags(e.target.value)
                                            }
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Add tags to help categorize and find
                                            documents later
                                        </p>
                                    </div>

                                    {/* Public Access Toggle */}
                                    <div className="flex items-center justify-between rounded-lg border p-4">
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
                                                setTags("");
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
                                        {Object.values(TYPE_LABELS).map(
                                            (label) => (
                                                <Badge
                                                    key={label}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {label}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="font-medium text-sm mb-1">
                                        Maximum size:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        100MB per file
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
                                        Add relevant tags to improve
                                        searchability
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
