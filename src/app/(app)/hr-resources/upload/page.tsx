"use client";

import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileService } from "@/lib/services/file";
import { toast } from "sonner";

export default function HRUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (!f) {
            setFile(null);
            return;
        }
        // Client-side validation: 10MB limit (matches backend HR limit) and allowed types common docs/images
        const allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/png",
            "image/jpeg",
        ];
        const maxBytes = 10 * 1024 * 1024;
        if (!allowed.includes(f.type)) {
            toast.error("Unsupported file type");
            e.currentTarget.value = "";
            return;
        }
        if (f.size > maxBytes) {
            toast.error("File too large (max 10MB)");
            e.currentTarget.value = "";
            return;
        }
        setFile(f);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error("Select a file");
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
            toast.success("Uploaded HR document");
            setFile(null);
            setDescription("");
            setTags("");
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

    return (
        <ProtectedRoute anyOf={[P.HR_DOCUMENT_CREATE]}>
            <main className="space-y-4 max-w-2xl">
                <h1 className="text-2xl font-semibold">Upload HR Document</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={onFileChange}
                            required
                        />
                        {file && (
                            <div className="text-sm text-muted-foreground">
                                {file.name} •{" "}
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            placeholder="policy, benefits"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Uploading…" : "Upload"}
                        </Button>
                    </div>
                </form>
            </main>
        </ProtectedRoute>
    );
}
