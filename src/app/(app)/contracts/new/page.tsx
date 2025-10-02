"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractEditor, FilePicker } from "@/components/contracts";
import { ContractsService } from "@/lib/services/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import type { CreateContractDto } from "@/lib/types/contracts";
import {
    showContractActionSuccess,
    showContractActionError,
} from "@/lib/utils/contract-notifications";
import { toast } from "sonner";

const isDevelopment = process.env.NODE_ENV === "development";

export default function ContractCreatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>();
    const [files, setFiles] = useState<File[]>([]);
    const [autoFillData, setAutoFillData] = useState<CreateContractDto | null>(
        null
    );

    async function handleSubmit(data: CreateContractDto) {
        try {
            setIsSubmitting(true);
            setError(undefined);
            const contract = await ContractsService.createContract(data, files);
            showContractActionSuccess(
                "Contract Created",
                `Contract "${data.title}" has been created successfully${
                    files.length > 0 ? ` with ${files.length} document(s)` : ""
                }`
            );
            router.push(`/contracts/${contract._id}`);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to create contract";
            showContractActionError("Create Contract", message);
            setError(message);
            setIsSubmitting(false);
        }
    }

    function handleCancel() {
        router.push("/contracts");
    }

    function handleAutoFill() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const deadline = tomorrow.toISOString().split("T")[0];

        const testData: CreateContractDto = {
            title: "Website Redesign Project",
            description:
                "We are seeking a qualified vendor to redesign our company website. The project includes:\n\n" +
                "- Modern, responsive design\n" +
                "- Improved user experience\n" +
                "- SEO optimization\n" +
                "- Content management system integration\n" +
                "- Performance optimization\n\n" +
                "The successful vendor will work closely with our marketing team to ensure brand consistency.",
            budget: 25000,
            currency: "USD",
            deadline,
            requiresResponsiveSupport: true,
            requiredDocuments: [
                {
                    name: "Company Portfolio",
                    description: "Examples of previous website designs",
                    required: true,
                },
                {
                    name: "Timeline Proposal",
                    description: "Detailed project timeline and milestones",
                    required: true,
                },
                {
                    name: "References",
                    description: "Contact information for previous clients",
                    required: false,
                },
            ],
        };

        setAutoFillData(testData);
        toast.success("Form auto-filled", {
            description: "Test data has been populated",
        });
    }

    return (
        <ProtectedRoute anyOf={[P.CONTRACT_CREATE]}>
            <main className="container mx-auto max-w-4xl space-y-6 py-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                Create Contract
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Fill in the details to create a new contract
                                opportunity
                            </p>
                        </div>
                    </div>
                    {isDevelopment && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAutoFill}
                            disabled={isSubmitting}
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Auto Fill (Dev)
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                        {error}
                    </div>
                )}

                <ContractEditor
                    key={autoFillData ? "filled" : "empty"}
                    initialData={autoFillData || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    submitLabel="Create Contract"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Supporting Documents (Optional)</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Upload documents that potential applicants can view
                            and download. Maximum 5 files, 5MB each.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <FilePicker
                            files={files}
                            onChange={setFiles}
                            maxFiles={5}
                            maxFileSizeMB={5}
                            disabled={isSubmitting}
                        />
                    </CardContent>
                </Card>
            </main>
        </ProtectedRoute>
    );
}
