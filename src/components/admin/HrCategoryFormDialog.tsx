"use client";

import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { HrDocumentsService } from "@/lib/services/file";
import { HrCategory } from "@/lib/types/file";
import { apiToast } from "@/lib/utils/toast-helpers";
import { errorMessages, successMessages } from "@/lib/utils/error-messages";

// Validation schema for HR Category form
const categoryFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or less"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(50, "Slug must be 50 characters or less")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens"
        ),
    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
    sortOrder: z.coerce.number().min(0).max(999),
    isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface HrCategoryFormDialogProps {
    /** Dialog mode: create new or edit existing */
    mode: "create" | "edit";
    /** Whether the dialog is open */
    open: boolean;
    /** Category to edit (required when mode='edit') */
    category?: HrCategory;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when form submission succeeds */
    onSuccess: () => void;
}

/**
 * Generate a URL-friendly slug from text
 */
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/^-+/g, "")
        .replaceAll(/-+$/g, "");
}

/**
 * Unified dialog for creating and editing HR categories
 * Uses React Hook Form with Zod validation for consistent form handling
 */
export const HrCategoryFormDialog = memo(function HrCategoryFormDialog({
    mode,
    open,
    category,
    onOpenChange,
    onSuccess,
}: Readonly<HrCategoryFormDialogProps>) {
    const isEditMode = mode === "edit";
    const dialogTitle = isEditMode ? "Edit HR Category" : "Create HR Category";
    const dialogDescription = isEditMode
        ? "Update the category details"
        : "Add a new category to organize HR links and documents";
    const submitLabel = isEditMode ? "Save Changes" : "Create Category";
    const submittingLabel = isEditMode ? "Saving..." : "Creating...";

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            sortOrder: 0,
            isActive: true,
        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
        reset,
        watch,
        setValue,
    } = form;

    // Watch name to auto-generate slug
    const watchedName = watch("name");
    const watchedSlug = watch("slug");

    // Auto-generate slug from name (only if slug hasn't been manually edited)
    useEffect(() => {
        if (!isEditMode && watchedName) {
            const generatedSlug = generateSlug(watchedName);
            // Only update if the current slug matches what would be generated from previous name
            // or if slug is empty (initial state)
            if (
                !watchedSlug ||
                watchedSlug === generateSlug(watchedName.slice(0, -1))
            ) {
                setValue("slug", generatedSlug, { shouldValidate: false });
            }
        }
    }, [watchedName, watchedSlug, setValue, isEditMode]);

    // Reset form when dialog opens or category changes
    useEffect(() => {
        if (open) {
            if (isEditMode && category) {
                reset({
                    name: category.name,
                    slug: category.slug,
                    description: category.description || "",
                    sortOrder: category.sortOrder ?? 0,
                    isActive: category.isActive,
                });
            } else {
                reset({
                    name: "",
                    slug: "",
                    description: "",
                    sortOrder: 0,
                    isActive: true,
                });
            }
        }
    }, [open, isEditMode, category, reset]);

    const onSubmit = async (data: CategoryFormData) => {
        try {
            if (isEditMode && category) {
                await HrDocumentsService.updateCategory(category._id, {
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    sortOrder: data.sortOrder,
                    isActive: data.isActive,
                });
                apiToast.success(successMessages.hrCategories.updated);
            } else {
                await HrDocumentsService.createCategory({
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    sortOrder: data.sortOrder,
                    isActive: data.isActive,
                });
                apiToast.success(successMessages.hrCategories.created);
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const errorMsg = isEditMode
                ? errorMessages.hrCategories.update
                : errorMessages.hrCategories.create;
            apiToast.error(errorMsg, error);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Payroll Resources"
                                            maxLength={100}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Slug Field */}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Slug{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., payroll-resources"
                                            maxLength={50}
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value.toLowerCase()
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL-friendly identifier. Lowercase
                                        letters, numbers, and hyphens only.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description Field */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description of this category"
                                            maxLength={500}
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sort Order Field */}
                        <FormField
                            control={form.control}
                            name="sortOrder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sort Order</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={999}
                                            placeholder="0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Lower numbers appear first in lists
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Active Switch */}
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="font-medium">
                                            Active
                                        </FormLabel>
                                        <FormDescription>
                                            Inactive categories are hidden from
                                            selection lists
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? submittingLabel : submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
});
