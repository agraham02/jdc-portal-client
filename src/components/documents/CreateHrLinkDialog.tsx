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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HrDocumentsService } from "@/lib/services/file";
import { HRLinkCategory } from "@/lib/types/file";
import { Switch } from "@/components/ui/switch";

interface CreateHrLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateHrLinkDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateHrLinkDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>(HRLinkCategory.OTHER);
    const [sortOrder, setSortOrder] = useState("0");
    const [tags, setTags] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const resetForm = () => {
        setTitle("");
        setUrl("");
        setDescription("");
        setCategory(HRLinkCategory.OTHER);
        setSortOrder("0");
        setTags("");
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
                sortOrder: parseInt(sortOrder, 10) || 0,
                tags: tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
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
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={HRLinkCategory.PAYROLL}>
                                    Payroll
                                </SelectItem>
                                <SelectItem value={HRLinkCategory.BENEFITS}>
                                    Benefits
                                </SelectItem>
                                <SelectItem value={HRLinkCategory.TRAINING}>
                                    Training
                                </SelectItem>
                                <SelectItem value={HRLinkCategory.POLICY}>
                                    Policy
                                </SelectItem>
                                <SelectItem value={HRLinkCategory.DIRECTORY}>
                                    Directory
                                </SelectItem>
                                <SelectItem value={HRLinkCategory.OTHER}>
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
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

                    <div className="space-y-2">
                        <Label htmlFor="sortOrder">Sort Order (0-999)</Label>
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
                            Lower numbers appear first
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="payroll, monthly, important"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isPublic" className="font-medium">
                                Public Access
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Make this link visible to all users. If disabled,
                                only users with FILE_READ permission can see it.
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
