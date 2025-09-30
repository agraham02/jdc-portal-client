"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
    vendorRegistrationSchema,
    type VendorRegistrationFormData,
} from "@/lib/validations";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import VendorRegistrationForm from "@/components/vendors/VendorRegistrationForm";

export default function VendorRegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Vendor Registration</h1>
                    <p className="text-muted-foreground">
                        Submit your details for approval. You can update
                        information later.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Vendor Account</CardTitle>
                        <CardDescription>
                            Only vendors can self-register. Employees are
                            created by admins.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VendorRegistrationForm />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
