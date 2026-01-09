"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    CreateContractDto,
    RequiredDocument,
    FileDocument,
    getDocumentFilename,
} from "@/lib/types/contracts";
import { FileUpload } from "@/components/common/FileUpload";
import { PlusIcon, TrashIcon, FileText, Download } from "lucide-react";
import { useState, useEffect } from "react";

// Common currencies
const CURRENCIES = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "JPY", name: "Japanese Yen" },
];

// Validation schema
const contractSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must not exceed 200 characters"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description must not exceed 5000 characters"),
    budget: z
        .number()
        .positive("Budget must be a positive number")
        .max(1000000000, "Budget must not exceed 1 billion")
        .optional()
        .nullable(),
    currency: z.string().optional(),
    deadline: z
        .string()
        .refine(
            (val) => {
                if (!val) return true;
                const date = new Date(val);
                return date > new Date();
            },
            { message: "Deadline must be in the future" }
        )
        .optional()
        .nullable(),
    requiresResponsiveSupport: z.boolean().optional(),
    requiredDocuments: z
        .array(
            z.object({
                name: z.string().min(1, "Document name is required"),
                description: z
                    .string()
                    .max(500, "Description must not exceed 500 characters")
                    .optional(),
                required: z.boolean().optional(),
            })
        )
        .optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

type RequiredDocumentWithClientId = RequiredDocument & { clientId: string };

function createClientId(): string {
    const cryptoObj = globalThis.crypto;
    if (
        cryptoObj &&
        "randomUUID" in cryptoObj &&
        typeof cryptoObj.randomUUID === "function"
    ) {
        return cryptoObj.randomUUID();
    }
    // Fallback: Math.random() is safe for UI component keys (no cryptographic security needed)
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface ContractEditorProps {
    initialData?: Partial<CreateContractDto>;
    onSubmit: (data: CreateContractDto) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    className?: string;
    files?: File[];
    onFilesChange?: (files: File[]) => void;
    /** Existing documents for edit mode */
    existingDocuments?: FileDocument[];
    /** Callback when user removes an existing document */
    onRemoveDocument?: (documentId: string) => Promise<void>;
    /** Callback to download an existing document */
    onDownloadDocument?: (
        documentId: string,
        filename: string
    ) => Promise<void>;
    /** Whether we're in edit mode (affects deadline validation) */
    isEditMode?: boolean;
}

export function ContractEditor({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitLabel = "Create Contract",
    className,
    files = [],
    onFilesChange,
    existingDocuments = [],
    onRemoveDocument,
    onDownloadDocument,
    isEditMode = false,
}: Readonly<ContractEditorProps>) {
    const [requiredDocs, setRequiredDocs] = useState<
        RequiredDocumentWithClientId[]
    >(
        (initialData?.requiredDocuments || []).map((d) => ({
            ...d,
            clientId: createClientId(),
        }))
    );
    const [removingDocId, setRemovingDocId] = useState<string | null>(null);

    // Sync requiredDocs when initialData changes (e.g., from auto-fill)
    useEffect(() => {
        if (initialData?.requiredDocuments) {
            setRequiredDocs(
                initialData.requiredDocuments.map((d) => ({
                    ...d,
                    clientId: createClientId(),
                }))
            );
        }
    }, [initialData?.requiredDocuments]);

    // Create schema dynamically based on edit mode
    const dynamicSchema = isEditMode
        ? contractSchema.extend({
              deadline: z.string().optional().nullable(),
          })
        : contractSchema;

    const form = useForm<ContractFormData>({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            budget: initialData?.budget || undefined,
            currency: initialData?.currency || "USD",
            deadline: initialData?.deadline
                ? new Date(initialData.deadline).toISOString().slice(0, 16)
                : "",
            requiresResponsiveSupport:
                initialData?.requiresResponsiveSupport ?? false,
            requiredDocuments: initialData?.requiredDocuments || [],
        },
    });

    async function handleSubmit(data: ContractFormData) {
        // Convert form data to DTO
        const dto: CreateContractDto = {
            title: data.title,
            description: data.description,
            budget: data.budget || undefined,
            currency: data.currency || "USD",
            deadline: data.deadline
                ? new Date(data.deadline).toISOString()
                : undefined,
            requiresResponsiveSupport: data.requiresResponsiveSupport ?? false,
            requiredDocuments:
                requiredDocs.length > 0
                    ? requiredDocs.map(({ ...doc }) => ({
                          name: doc.name,
                          description: doc.description,
                          required: doc.required,
                      }))
                    : undefined,
        };

        await onSubmit(dto);
    }

    function addRequiredDocument() {
        if (requiredDocs.length >= 10) {
            // Backend enforces max 10 required documents
            return;
        }
        setRequiredDocs([
            ...requiredDocs,
            {
                name: "",
                description: "",
                required: true,
                clientId: createClientId(),
            },
        ]);
    }

    function updateRequiredDocument(
        index: number,
        field: keyof RequiredDocument,
        value: string | boolean
    ) {
        const updated = [...requiredDocs];
        updated[index] = { ...updated[index], [field]: value };
        setRequiredDocs(updated);
    }

    function removeRequiredDocument(index: number) {
        setRequiredDocs(requiredDocs.filter((_, i) => i !== index));
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className={`space-y-6 ${className || ""}`}
            >
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Title{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Office Supplies - Q4 2025"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Description{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide a detailed description of the contract requirements..."
                                            rows={6}
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe what you need, scope of work,
                                        and any specific requirements.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Budget & Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="budget"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Budget (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="50000"
                                                value={
                                                    field.value !== undefined &&
                                                    field.value !== null
                                                        ? String(field.value)
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow empty value (clearing the field)
                                                    if (val === "") {
                                                        field.onChange(null);
                                                        return;
                                                    }
                                                    // Only allow numeric characters
                                                    if (
                                                        !/^\d*\.?\d*$/.test(val)
                                                    ) {
                                                        return;
                                                    }
                                                    // Parse as number for form state
                                                    const num = Number(val);
                                                    if (!Number.isNaN(num)) {
                                                        field.onChange(num);
                                                    }
                                                }}
                                                onBlur={field.onBlur}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CURRENCIES.map((currency) => (
                                                    <SelectItem
                                                        key={currency.code}
                                                        value={currency.code}
                                                    >
                                                        {currency.code} -{" "}
                                                        {currency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Deadline */}
                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Application Deadline (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Vendors must submit applications before
                                        this date.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Responsive Support */}
                        <FormField
                            control={form.control}
                            name="requiresResponsiveSupport"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Requires Responsive Support
                                        </FormLabel>
                                        <FormDescription>
                                            This contract requires vendors to
                                            provide responsive support services.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Required Documents */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Required Documents</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Specify documents vendors must submit with
                                    their application
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRequiredDocument}
                                disabled={
                                    isSubmitting || requiredDocs.length >= 10
                                }
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Document
                                {requiredDocs.length >= 10 && " (Max 10)"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {requiredDocs.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                                No required documents yet. Click &quot;Add
                                Document&quot; to specify what vendors need to
                                submit.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {requiredDocs.map((doc, index) => (
                                    <Card
                                        key={doc.clientId}
                                        className="border-2"
                                    >
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 space-y-4">
                                                        {/* Document Name */}
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-sm font-medium"
                                                                htmlFor={`required-doc-name-${doc.clientId}`}
                                                            >
                                                                Document Name{" "}
                                                                <span className="text-destructive">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <Input
                                                                id={`required-doc-name-${doc.clientId}`}
                                                                placeholder="e.g., Business License"
                                                                value={doc.name}
                                                                onChange={(e) =>
                                                                    updateRequiredDocument(
                                                                        index,
                                                                        "name",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </div>

                                                        {/* Document Description */}
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-sm font-medium"
                                                                htmlFor={`required-doc-description-${doc.clientId}`}
                                                            >
                                                                Description
                                                                (Optional)
                                                            </label>
                                                            <Textarea
                                                                id={`required-doc-description-${doc.clientId}`}
                                                                placeholder="Provide details about this document requirement..."
                                                                rows={2}
                                                                value={
                                                                    doc.description ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateRequiredDocument(
                                                                        index,
                                                                        "description",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </div>

                                                        {/* Required Checkbox */}
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id={`required-doc-required-${doc.clientId}`}
                                                                checked={
                                                                    doc.required
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    updateRequiredDocument(
                                                                        index,
                                                                        "required",
                                                                        checked
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            />
                                                            <label
                                                                className="text-sm font-medium"
                                                                htmlFor={`required-doc-required-${doc.clientId}`}
                                                            >
                                                                Required
                                                                (vendors must
                                                                upload this)
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeRequiredDocument(
                                                                index
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Supporting Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supporting Documents (Optional)</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Upload documents that potential applicants can view
                            and download. Maximum 5 files, 5MB each.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Existing Documents (Edit Mode) */}
                        {existingDocuments.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Existing Documents
                                </p>
                                <div className="space-y-2">
                                    {existingDocuments.map((doc) => (
                                        <div
                                            key={doc._id}
                                            className="flex items-center gap-2 rounded-md border p-3"
                                        >
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1 truncate text-sm">
                                                {getDocumentFilename(doc)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {(doc.size / 1024).toFixed(1)}{" "}
                                                KB
                                            </span>
                                            {onDownloadDocument && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        onDownloadDocument(
                                                            doc._id,
                                                            getDocumentFilename(
                                                                doc
                                                            )
                                                        )
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onRemoveDocument && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={async () => {
                                                        setRemovingDocId(
                                                            doc._id
                                                        );
                                                        try {
                                                            await onRemoveDocument(
                                                                doc._id
                                                            );
                                                        } finally {
                                                            setRemovingDocId(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        isSubmitting ||
                                                        removingDocId ===
                                                            doc._id
                                                    }
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload New Documents */}
                        <div className="space-y-2">
                            {existingDocuments.length > 0 && (
                                <p className="text-sm font-medium">
                                    Add New Documents
                                </p>
                            )}
                            <FileUpload
                                acceptedFileTypes={[
                                    ".pdf",
                                    ".doc",
                                    ".docx",
                                    ".xls",
                                    ".xlsx",
                                    ".png",
                                    ".jpg",
                                    ".jpeg",
                                ]}
                                maxFiles={5}
                                maxFileSizeMB={5}
                                disabled={isSubmitting}
                                uploadingFiles={files.map((file) => ({
                                    file,
                                    progress: 0,
                                }))}
                                onUploadingFilesChange={(uploadingFiles) =>
                                    onFilesChange?.(
                                        uploadingFiles.map((uf) => uf.file)
                                    )
                                }
                                showUploadButton={true}
                                uploadButtonText="Select Files"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
