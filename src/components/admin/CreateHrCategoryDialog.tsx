"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { HrDocumentsService } from "@/lib/services/file";

interface CreateHrCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateHrCategoryDialog({
    open,
    onOpenChange,
    onSuccess,
}: Readonly<CreateHrCategoryDialogProps>) {
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [sortOrder, setSortOrder] = useState("0");
    const [isActive, setIsActive] = useState(true);

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setSortOrder("0");
        setIsActive(true);
    };

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setName(value);
        // Only auto-generate slug if user hasn't manually edited it
        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(value));
        }
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replaceAll(/[^a-z0-9]+/g, "-")
            .replaceAll(/(?:^-+|-+$)/g, "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (!slug.trim()) {
            toast.error("Slug is required");
            return;
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            toast.error(
                "Slug must contain only lowercase letters, numbers, and hyphens"
            );
            return;
        }

        setSubmitting(true);
        try {
            await HrDocumentsService.createCategory({
                name: name.trim(),
                slug: slug.trim(),
                description: description.trim() || undefined,
                sortOrder: Number.parseInt(sortOrder, 10) || 0,
                isActive,
            });

            toast.success("Category created successfully");
            resetForm();
            onOpenChange(false);
            onSuccess();
        } catch (err: unknown) {
            const msg =
                typeof err === "object" && err && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Failed to create category";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create HR Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to organize HR links and documents
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g., Payroll Resources"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">
                            Slug <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) =>
                                setSlug(e.target.value.toLowerCase())
                            }
                            placeholder="e.g., payroll-resources"
                            maxLength={50}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            URL-friendly identifier. Lowercase letters, numbers,
                            and hyphens only.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this category"
                            maxLength={500}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sortOrder">Sort Order</Label>
                        <Input
                            id="sortOrder"
                            type="number"
                            min="0"
                            max="999"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">
                            Lower numbers appear first in lists
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isActive" className="font-medium">
                                Active
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Inactive categories are hidden from selection
                                lists
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
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
                            {submitting ? "Creating..." : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
