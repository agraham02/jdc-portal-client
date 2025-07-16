import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { contractService } from "@/lib/services/contract";
import { ApplyToContractRequest } from "@/lib/types/contract";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { FILE_UPLOAD_CONFIG, ERROR_MESSAGES } from "@/lib/constants/contracts";

const applicationSchema = z.object({
    proposalDetails: z
        .string()
        .min(50, "Proposal must be at least 50 characters")
        .max(2000, "Proposal too long"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
    contractId: string;
    contractTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ApplicationForm({
    contractId,
    contractTitle,
    open,
    onOpenChange,
    onSuccess,
}: ApplicationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const { toast } = useToast();

    // File validation constants
    const { 
        MAX_FILE_SIZE, 
        MAX_FILES_APPLICATION, 
        ALLOWED_APPLICATION_TYPES, 
        ALLOWED_APPLICATION_EXTENSIONS 
    } = FILE_UPLOAD_CONFIG;

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            proposalDetails: "",
        },
    });

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return ERROR_MESSAGES.FILE_TOO_LARGE(file.name);
        }

        // Check file type
        if (!ALLOWED_APPLICATION_TYPES.includes(file.type)) {
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!ALLOWED_APPLICATION_EXTENSIONS.includes(extension)) {
                return ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE(file.name, "PDF, DOC, DOCX, TXT, JPG, PNG");
            }
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            
            for (const file of newFiles) {
                const error = validateFile(file);
                if (error) {
                    toast({
                        title: "File Validation Error",
                        description: error,
                        variant: "destructive"
                    });
                } else {
                    validFiles.push(file);
                }
            }
            
            // Check total number of files
            if (files.length + validFiles.length > MAX_FILES_APPLICATION) {
                toast({
                    title: "Too Many Files",
                    description: ERROR_MESSAGES.TOO_MANY_FILES(MAX_FILES_APPLICATION),
                    variant: "destructive"
                });
                return;
            }
            
            setFiles([...files, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ApplicationFormData) => {
        try {
            setIsSubmitting(true);

            const requestData: ApplyToContractRequest = {
                proposalDetails: data.proposalDetails.trim(),
            };

            await contractService.applyToContract(
                contractId,
                requestData,
                files
            );

            toast({
                title: "Success",
                description: "Application submitted successfully",
            });

            form.reset();
            setFiles([]);
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            let errorMessage = "Failed to submit application";
            
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
                } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
                    errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
                } else if (error.message.includes('file') || error.message.includes('upload')) {
                    errorMessage = ERROR_MESSAGES.FILE_UPLOAD_ERROR;
                } else {
                    errorMessage = error.message;
                }
            }
            
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Apply for Contract: {contractTitle}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div>
                        <Label htmlFor="proposalDetails">
                            Proposal Details *
                        </Label>
                        <textarea
                            id="proposalDetails"
                            {...form.register("proposalDetails")}
                            placeholder="Describe your company's qualifications, approach, and why you're the best fit for this contract..."
                            rows={8}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {form.formState.errors.proposalDetails && (
                            <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.proposalDetails.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            {form.watch("proposalDetails")?.length || 0}/2000
                            characters
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="files">Supporting Documents</Label>
                        <div className="mt-1">
                            <input
                                id="files"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Upload portfolio, certifications, or other relevant documents (Max 5 files, 10MB each)
                                <br />
                                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                            </p>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-2 space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                    >
                                        <div className="flex items-center">
                                            <Upload className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                (
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB)
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Once submitted, your
                            application cannot be modified. Please review all
                            information carefully before submitting.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Submit Application
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
