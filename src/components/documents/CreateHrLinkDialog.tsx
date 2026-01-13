"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HrDocumentsService } from "@/lib/services/file";
import { HrCategory } from "@/lib/types/file";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateHrLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateHrLinkDialog({
    open,
    onOpenChange,
    onSuccess,
}: Readonly<CreateHrLinkDialogProps>) {
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>("");
    const [isPublic, setIsPublic] = useState(false);
    const [categories, setCategories] = useState<HrCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Fetch categories when dialog opens
    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setLoadingCategories(true);

        HrDocumentsService.getCategories({ isActive: true })
            .then((res) => {
                if (cancelled) return;
                setCategories(res.categories);
                // Set default category if available (use _id now)
                // Using functional update to avoid stale closure and dependency warning
                if (res.categories.length > 0) {
                    setCategory((prev) => {
                        if (prev) return prev; // Keep existing selection
                        const otherCat = res.categories.find(
                            (c) => c.slug === "other"
                        );
                        return otherCat?._id || res.categories[0]._id;
                    });
                }
            })
            .catch((err) => !cancelled && console.error(err))
            .finally(() => !cancelled && setLoadingCategories(false));

        return () => {
            cancelled = true;
        };
    }, [open]);

    const resetForm = () => {
        setTitle("");
        setUrl("");
        setDescription("");
        setCategory("");
        setIsPublic(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!url.trim()) {
            toast.error("URL is required");
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            toast.error("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        setSubmitting(true);
        try {
            await HrDocumentsService.createLink({
                title: title.trim(),
                url: url.trim(),
                description: description.trim() || undefined,
                category: category,
                isPublic: isPublic,
            });

            toast.success("Link created successfully");
            resetForm();
            onOpenChange(false);
            onSuccess();
        } catch (err: unknown) {
            const msg =
                typeof err === "object" && err && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Failed to create link";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New HR Link</DialogTitle>
                    <DialogDescription>
                        Create a new HR resource link for employees to access
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Employee Payroll Portal"
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">
                            URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
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

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the link"
                            maxLength={500}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isPublic" className="font-medium">
                                Public Access
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Make this link visible to all users. If
                                disabled, only users with HR_DOCUMENT_READ
                                permission can see it.
                            </p>
                        </div>
                        <Switch
                            id="isPublic"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Link"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
