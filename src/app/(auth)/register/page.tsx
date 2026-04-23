"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Building2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function RegisterPage() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <motion.div variants={staggerItem} className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    Create Your Account
                </h1>
                <p className="text-muted-foreground text-sm">
                    Choose your account type to get started. Your account will
                    need approval before you can sign in.
                </p>
            </motion.div>

            <motion.div variants={staggerItem}>
                <Card className="hover:shadow-md transition-shadow">
                    <Link href="/register/vendor">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-2">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">
                                Vendor Registration
                            </CardTitle>
                            <CardDescription>
                                Register your business as a vendor to provide
                                services and submit proposals.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                    Submit service proposals
                                </li>
                                <li className="flex items-center">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                    Manage contracts
                                </li>
                            </ul>

                            <Button className="w-full">
                                Register as Vendor
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Link>
                </Card>
            </motion.div>

            <motion.div variants={staggerItem} className="text-center mt-8">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary/80"
                        >
                            Sign in
                        </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Employees cannot self-register. Please contact an
                        administrator to have an account created for you.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
