"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User, Building2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function RegisterPage() {
    return (
        <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Create Your Account
                        </h1>
                        <p className="text-gray-600">
                            Choose your account type to get started. Your
                            account will need approval before you can sign in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Registration */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                                <Link href="/register/employee">
                                    <CardHeader className="text-center pb-4">
                                        <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <User className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <CardTitle className="text-xl text-gray-900">
                                            Employee Registration
                                        </CardTitle>
                                        <CardDescription>
                                            Register as a company employee to
                                            access internal resources and
                                            services.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2">
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                                Access to employee portal
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                                Internal HR resources
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                                Company notifications
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                                                Contract management
                                            </li>
                                        </ul>

                                        <Button className="w-full group-hover:bg-blue-700 transition-colors">
                                            Register as Employee
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Link>
                            </Card>
                        </motion.div>

                        {/* Vendor Registration */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                                <Link href="/register/vendor">
                                    <CardHeader className="text-center pb-4">
                                        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <Building2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <CardTitle className="text-xl text-gray-900">
                                            Vendor Registration
                                        </CardTitle>
                                        <CardDescription>
                                            Register your business as a vendor
                                            to provide services and submit
                                            proposals.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="text-sm text-gray-600 space-y-2">
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                Submit service proposals
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                Manage contracts
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                Business communications
                                            </li>
                                            <li className="flex items-center">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                Vendor portal access
                                            </li>
                                        </ul>

                                        <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors">
                                            Register as Vendor
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Link>
                            </Card>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-center mt-8"
                    >
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Sign in instead
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </PublicRoute>
    );
}
