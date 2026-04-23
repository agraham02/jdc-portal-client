"use client";

import { motion } from "motion/react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import VendorRegistrationForm from "@/components/vendors/VendorRegistrationForm";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function VendorRegisterPage() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <motion.div variants={staggerItem} className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    Vendor Registration
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Submit your details for approval. You can update information
                    later.
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
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
        </motion.div>
    );
}
