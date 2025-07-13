"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VendorService, CreateVendorRequest } from "@/lib/services/vendor";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

const createVendorSchema = z.object({
    // User information
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
    contactPhone: z.string().optional(),

    // Vendor information
    companyName: z.string().min(1, "Company name is required"),
    contactName: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    servicesOffered: z.string().optional(),
    notes: z.string().optional(),
});

type CreateVendorFormData = z.infer<typeof createVendorSchema>;

interface CreateVendorDialogProps {
    onVendorCreated?: () => void;
}

export function CreateVendorDialog({ onVendorCreated }: CreateVendorDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateVendorFormData>({
        resolver: zodResolver(createVendorSchema),
    });

    const onSubmit = async (data: CreateVendorFormData) => {
        try {
            setIsLoading(true);

            // Transform the form data
            const vendorData: CreateVendorRequest = {
                ...data,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
                contactName: data.contactName || undefined,
                website: data.website || undefined,
                notes: data.notes || undefined,
                servicesOffered: data.servicesOffered 
                    ? data.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
                    : undefined,
            };

            await VendorService.createVendor(vendorData);

            toast({
                title: "Success",
                description: "Vendor account created successfully",
            });

            reset();
            setOpen(false);
            onVendorCreated?.();
        } catch (error) {
            console.error("Failed to create vendor:", error);
            toast({
                title: "Error",
                description: "Failed to create vendor account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Vendor Account</DialogTitle>
                    <DialogDescription>
                        Create a new vendor account with login credentials and company information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* User Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    {...register("firstName")}
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    {...register("lastName")}
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    {...register("contactEmail")}
                                    disabled={isLoading}
                                    placeholder="Alternative contact email"
                                />
                                {errors.contactEmail && (
                                    <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Contact Phone</Label>
                                <Input
                                    id="contactPhone"
                                    {...register("contactPhone")}
                                    disabled={isLoading}
                                    placeholder="(555) 123-4567"
                                />
                                {errors.contactPhone && (
                                    <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Company Information</h3>
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                {...register("companyName")}
                                disabled={isLoading}
                            />
                            {errors.companyName && (
                                <p className="text-sm text-red-500">{errors.companyName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactName">Primary Contact Name</Label>
                            <Input
                                id="contactName"
                                {...register("contactName")}
                                disabled={isLoading}
                                placeholder="Main contact person for the company"
                            />
                            {errors.contactName && (
                                <p className="text-sm text-red-500">{errors.contactName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                {...register("website")}
                                disabled={isLoading}
                                placeholder="https://www.company.com"
                            />
                            {errors.website && (
                                <p className="text-sm text-red-500">{errors.website.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="servicesOffered">Services Offered</Label>
                            <Input
                                id="servicesOffered"
                                {...register("servicesOffered")}
                                disabled={isLoading}
                                placeholder="Construction, Plumbing, Electrical (comma-separated)"
                            />
                            <p className="text-sm text-muted-foreground">
                                Separate multiple services with commas
                            </p>
                            {errors.servicesOffered && (
                                <p className="text-sm text-red-500">{errors.servicesOffered.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Input
                                id="notes"
                                {...register("notes")}
                                disabled={isLoading}
                                placeholder="Internal admin notes (optional)"
                            />
                            {errors.notes && (
                                <p className="text-sm text-red-500">{errors.notes.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Vendor"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
