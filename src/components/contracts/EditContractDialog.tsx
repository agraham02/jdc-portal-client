import { useState, useEffect } from "react";
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
import { Contract, UpdateContractRequest } from "@/lib/types/contract";
import { Loader2 } from "lucide-react";

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

interface EditContractDialogProps {
    contract: Contract | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditContractDialog({
    contract,
    open,
    onOpenChange,
    onSuccess,
}: EditContractDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<ContractFormData>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            title: "",
            description: "",
            budget: undefined,
            deadline: "",
        },
    });

    // Update form when contract changes
    useEffect(() => {
        if (contract) {
            form.reset({
                title: contract.title,
                description: contract.description,
                budget: contract.budget,
                deadline: contract.deadline
                    ? new Date(contract.deadline).toISOString().slice(0, 16)
                    : "",
            });
        }
    }, [contract, form]);

    const onSubmit = async (data: ContractFormData) => {
        if (!contract) return;

        try {
            setIsSubmitting(true);

            const requestData: UpdateContractRequest = {
                title: data.title.trim(),
                description: data.description.trim(),
                budget: data.budget,
                deadline: data.deadline || undefined,
            };

            await contractService.updateContract(contract._id, requestData);

            toast({
                title: "Success",
                description: "Contract updated successfully",
            });

            onSuccess();
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to update contract";
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
                    <DialogTitle>Edit Contract</DialogTitle>
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

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Editing a contract will
                            notify all vendors who have applied. Major changes
                            may require vendors to update their applications.
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
                            Update Contract
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
