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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { contractService } from "@/lib/services/contract";
import { CreateContractRequest } from "@/lib/types/contract";
import { Loader2, Upload, X } from "lucide-react";
import { FILE_UPLOAD_CONFIG, ERROR_MESSAGES } from "@/lib/constants/contracts";

const contractSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title too long"),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description too long"),
    budget: z.number().min(0, "Budget must be positive").optional(),
    deadline: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface CreateContractDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateContractDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateContractDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const { toast } = useToast();

    // File validation constants
    const { 
        MAX_FILE_SIZE, 
        MAX_FILES_CONTRACT, 
        ALLOWED_CONTRACT_TYPES, 
        ALLOWED_CONTRACT_EXTENSIONS 
    } = FILE_UPLOAD_CONFIG;

    const form = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            title: "",
            description: "",
            budget: undefined,
            deadline: "",
        },
    });

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return ERROR_MESSAGES.FILE_TOO_LARGE(file.name);
        }

        // Check file type
        if (!ALLOWED_CONTRACT_TYPES.includes(file.type)) {
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!ALLOWED_CONTRACT_EXTENSIONS.includes(extension)) {
                return ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE(file.name, "PDF, DOC, DOCX, TXT");
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
            if (files.length + validFiles.length > MAX_FILES_CONTRACT) {
                toast({
                    title: "Too Many Files",
                    description: ERROR_MESSAGES.TOO_MANY_FILES(MAX_FILES_CONTRACT),
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

    const onSubmit = async (data: ContractFormData) => {
        try {
            setIsSubmitting(true);

            const requestData: CreateContractRequest = {
                title: data.title.trim(),
                description: data.description.trim(),
                budget: data.budget,
                deadline: data.deadline || undefined,
            };

            await contractService.createContract(requestData, files);

            toast({
                title: "Success",
                description: "Contract created successfully",
            });

            form.reset();
            setFiles([]);
            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            let errorMessage = "Failed to create contract";
            
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
                } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
                    errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
                } else if (error.message.includes('file') || error.message.includes('upload')) {
                    errorMessage = ERROR_MESSAGES.FILE_UPLOAD_ERROR;
                } else if (error.message.includes('validation')) {
                    errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
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
                    <DialogTitle>Create New Contract</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div>
                        <Label htmlFor="title">Contract Title *</Label>
                        <Input
                            id="title"
                            {...form.register("title")}
                            placeholder="Enter contract title"
                        />
                        {form.formState.errors.title && (
                            <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Describe the contract requirements and scope"
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-600 mt-1">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="budget">Budget ($)</Label>
                            <Input
                                id="budget"
                                type="number"
                                min="0"
                                step="0.01"
                                {...form.register("budget", {
                                    valueAsNumber: true,
                                })}
                                placeholder="0.00"
                            />
                            {form.formState.errors.budget && (
                                <p className="text-sm text-red-600 mt-1">
                                    {form.formState.errors.budget.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                {...form.register("deadline")}
                            />
                            {form.formState.errors.deadline && (
                                <p className="text-sm text-red-600 mt-1">
                                    {form.formState.errors.deadline.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="files">Contract Documents</Label>
                        <div className="mt-1">
                            <Input
                                id="files"
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Upload contract documents (Max 10 files, 10MB each)
                                <br />
                                Supported formats: PDF, DOC, DOCX, TXT
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
                            Create Contract
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
