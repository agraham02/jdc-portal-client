"use client";

import { useState, useEffect } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { FileService } from "@/lib/services/file";
import { UploadedFile, FileQueryDto } from "@/lib/types/file";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
    Upload,
    Download,
    Eye,
    Search,
    FileText,
    Calendar,
    User,
    Plus,
} from "lucide-react";

export default function HrResourcesPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const itemsPerPage = 10;

    const fetchHrDocuments = async (page: number = 1, search: string = "") => {
        try {
            setLoading(true);
            const query: FileQueryDto = {
                page,
                limit: itemsPerPage,
                search: search.trim() || undefined,
                sortBy: "createdAt",
                sortOrder: "desc",
            };

            const response = await FileService.getHrDocuments(query);
            // console.log("Fetched HR documents:", response);
            setFiles(response.files);
            setTotalPages(response.totalPages);
            setCurrentPage(response.page);
        } catch (error) {
            console.error("Failed to fetch HR documents:", error);
            alert("Failed to load HR documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHrDocuments(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchHrDocuments(1, value);
    };

    const handleDownload = async (file: UploadedFile) => {
        try {
            await FileService.triggerDownload(file._id, file.originalName);
            alert("File downloaded successfully");
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    };

    const handleView = async (file: UploadedFile) => {
        try {
            const { url } = await FileService.getSignedViewUrl(file._id);
            window.open(url, "_blank");
        } catch (error) {
            console.error("View failed:", error);
            alert("Failed to open file");
        }
    };

    const handleUpload = async (file: File, description: string = "") => {
        try {
            setUploading(true);
            await FileService.uploadHrDocument(file, {
                description,
                tags: ["hr-resource", "company-wide"],
            });
            alert("HR document uploaded successfully");
            setShowUploadModal(false);
            fetchHrDocuments(currentPage, searchTerm);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload HR document");
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype.includes("pdf")) return "📄";
        if (mimetype.includes("word")) return "📝";
        if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
            return "📊";
        if (mimetype.includes("image")) return "🖼️";
        return "📎";
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">HR Resources</h1>
                    <p className="text-muted-foreground">
                        Access company-wide HR documents and resources
                    </p>
                </div>

                <PermissionGuard requiredPermissions="hr_document:create">
                    <Button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Upload HR Document
                    </Button>
                </PermissionGuard>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search HR documents..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Files Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                </div>
            ) : files.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No HR documents found
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {searchTerm
                                ? "No documents match your search criteria"
                                : "No HR documents have been uploaded yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map((file) => (
                        <Card
                            key={file._id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-2xl"
                                            role="img"
                                            aria-label={
                                                file.mimetype.includes("pdf")
                                                    ? "PDF file"
                                                    : file.mimetype.includes(
                                                          "word"
                                                      )
                                                    ? "Word document"
                                                    : file.mimetype.includes(
                                                          "excel"
                                                      ) ||
                                                      file.mimetype.includes(
                                                          "spreadsheet"
                                                      )
                                                    ? "Excel spreadsheet"
                                                    : file.mimetype.includes(
                                                          "image"
                                                      )
                                                    ? "Image file"
                                                    : "Attachment"
                                            }
                                        >
                                            {getFileIcon(file.mimetype)}
                                        </span>
                                        <div className="flex-1">
                                            <CardTitle className="text-sm font-medium line-clamp-2">
                                                {file.originalName}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="ml-2">
                                        {file.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Description */}
                                {file.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {file.description}
                                    </p>
                                )}

                                {/* File Info */}
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(
                                                file.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span>
                                            {file.uploadedBy.firstName}{" "}
                                            {file.uploadedBy.lastName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3 h-3" />
                                        <span>{formatFileSize(file.size)}</span>
                                    </div>
                                </div>

                                {/* Tags */}
                                {file.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {file.tags.slice(0, 3).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {file.tags.length > 3 && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                +{file.tags.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleView(file)}
                                        className="flex-1"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        className="flex-1"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    uploading={uploading}
                />
            )}
        </div>
    );
}

// Upload Modal Component
interface UploadModalProps {
    onClose: () => void;
    onUpload: (file: File, description: string) => void;
    uploading: boolean;
}

function UploadModal({ onClose, onUpload, uploading }: UploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onUpload(selectedFile, description);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onClose();
                }
            }}
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-md"
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-modal-title"
            >
                <h2
                    id="upload-modal-title"
                    className="text-xl font-semibold mb-4"
                >
                    Upload HR Document
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select File
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                            onChange={handleFileSelect}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                        {selectedFile && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            rows={3}
                            placeholder="Brief description of the document..."
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
