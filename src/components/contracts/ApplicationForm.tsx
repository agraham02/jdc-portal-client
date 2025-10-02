"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { DocumentsUploader } from "./DocumentsUploader";
import { cn } from "@/lib/utils";
import type {
    Contract,
    RequiredDocument,
    ApplyToContractDto,
} from "@/lib/types/contracts";

// Validation schema
const applicationSchema = z.object({
    proposalDetails: z
        .string()
        .min(50, "Proposal must be at least 50 characters")
        .max(10000, "Proposal must not exceed 10,000 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
    contract: Contract;
    onSubmit: (data: ApplyToContractDto) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    className?: string;
}

export function ApplicationForm({
    contract,
    onSubmit,
    onCancel,
    isSubmitting = false,
    className,
}: ApplicationFormProps) {
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string>();

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            proposalDetails: "",
        },
    });

    async function handleSubmit(data: ApplicationFormData) {
        // Validate required documents are uploaded
        if (
            contract.requiredDocuments &&
            contract.requiredDocuments.length > 0
        ) {
            const requiredDocs = contract.requiredDocuments.filter(
                (doc) => doc.required
            );
            if (requiredDocs.length > 0 && uploadedFileIds.length === 0) {
                setUploadError(
                    "Please upload all required documents before submitting"
                );
                return;
            }
        }

        const dto: ApplyToContractDto = {
            proposalDetails: data.proposalDetails,
        };

        await onSubmit(dto);
    }

    const handleUploadComplete = (fileIds: string[]) => {
        setUploadedFileIds((prev) => [...prev, ...fileIds]);
        setUploadError(undefined);
    };

    const handleUploadError = (error: Error) => {
        setUploadError(error.message);
    };

    const hasRequiredDocuments =
        contract.requiredDocuments &&
        contract.requiredDocuments.some((doc) => doc.required);

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle>Submit Application</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        {/* Contract Info */}
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h3 className="mb-2 font-semibold">
                                {contract.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {contract.description}
                            </p>
                            {contract.budget && (
                                <p className="mt-2 text-sm font-medium">
                                    Budget: ${contract.budget.toLocaleString()}{" "}
                                    {contract.currency || "USD"}
                                </p>
                            )}
                        </div>

                        {/* Proposal Details */}
                        <FormField
                            control={form.control}
                            name="proposalDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Proposal{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe your approach, experience, and why you're the best fit for this contract..."
                                            className="min-h-[200px] resize-y"
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a detailed proposal explaining
                                        how you will fulfill the contract
                                        requirements (50-10,000 characters)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Required Documents */}
                        {hasRequiredDocuments && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="mb-2 font-semibold">
                                        Required Documents{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </h3>
                                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                        {contract.requiredDocuments
                                            ?.filter((doc) => doc.required)
                                            .map(
                                                (
                                                    doc: RequiredDocument,
                                                    index: number
                                                ) => (
                                                    <li key={index}>
                                                        <strong>
                                                            {doc.name}
                                                        </strong>
                                                        {doc.description && (
                                                            <span className="ml-1">
                                                                -{" "}
                                                                {
                                                                    doc.description
                                                                }
                                                            </span>
                                                        )}
                                                    </li>
                                                )
                                            )}
                                    </ul>
                                </div>

                                <DocumentsUploader
                                    contractId={contract._id}
                                    onUploadComplete={handleUploadComplete}
                                    onUploadError={handleUploadError}
                                />

                                {uploadError && (
                                    <p className="text-sm text-destructive">
                                        {uploadError}
                                    </p>
                                )}

                                {uploadedFileIds.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        ✓ {uploadedFileIds.length} document(s)
                                        uploaded
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
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
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
