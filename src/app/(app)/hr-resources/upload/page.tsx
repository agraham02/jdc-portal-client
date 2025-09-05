"use client";

import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
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
import { useState } from "react";
import { motion } from "motion/react";
import { FileService } from "@/lib/services/file";
import { toast } from "sonner";
import {
    Upload,
    AlertCircle,
    CheckCircle,
    X,
    FileIcon,
    ArrowLeft,
    Cloud,
} from "lucide-react";
import Link from "next/link";

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
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
};

export default function HRUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const maxBytes = 10 * 1024 * 1024; // 10MB

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Unsupported file type. Please upload PDF, DOC, DOCX, XLS, XLSX, PNG, or JPEG files.";
        }
        if (file.size > maxBytes) {
            return "File too large. Maximum size is 10MB.";
        }
        return null;
    };

    const handleFile = (selectedFile: File) => {
        const error = validateFile(selectedFile);
        if (error) {
            toast.error(error);
            return;
        }
        setFile(selectedFile);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) {
            setFile(null);
            return;
        }
        handleFile(selectedFile);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);

        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        setSubmitting(true);
        try {
            await FileService.uploadHrDocument(file, {
                description: description || undefined,
                tags: tags
                    ? tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                    : undefined,
            });
            toast.success("HR document uploaded successfully!");

            // Reset form
            setFile(null);
            setDescription("");
            setTags("");

            // Clear file input
            const fileInput = document.getElementById(
                "file"
            ) as HTMLInputElement;
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err: unknown) {
            const msg =
                typeof err === "object" && err && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Upload failed";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
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
                                        <Label htmlFor="file">File *</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                                dragActive
                                                    ? "border-primary bg-primary/5"
                                                    : file
                                                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                                                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                            }`}
                                            onDrop={onDrop}
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                        >
                                            {file ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center">
                                                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-green-700 dark:text-green-400">
                                                            File selected
                                                            successfully
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {file.name} •{" "}
                                                            {(
                                                                file.size /
                                                                (1024 * 1024)
                                                            ).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                        <Badge
                                                            variant="secondary"
                                                            className="mt-2"
                                                        >
                                                            {TYPE_LABELS[
                                                                file.type
                                                            ] || file.type}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={removeFile}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Remove File
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center">
                                                        <div className="p-3 rounded-lg bg-muted">
                                                            <Cloud className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            Drop your file here,
                                                            or{" "}
                                                            <label className="text-primary cursor-pointer hover:underline">
                                                                browse
                                                                <Input
                                                                    id="file"
                                                                    type="file"
                                                                    onChange={
                                                                        onFileChange
                                                                    }
                                                                    className="hidden"
                                                                    accept={ALLOWED_TYPES.join(
                                                                        ","
                                                                    )}
                                                                />
                                                            </label>
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Maximum file size:
                                                            10MB
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={!file || submitting}
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
                                            type="button"
                                            variant="outline"
                                            disabled={submitting}
                                            onClick={() => {
                                                setFile(null);
                                                setDescription("");
                                                setTags("");
                                                const fileInput =
                                                    document.getElementById(
                                                        "file"
                                                    ) as HTMLInputElement;
                                                if (fileInput)
                                                    fileInput.value = "";
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
                                        10MB per file
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
