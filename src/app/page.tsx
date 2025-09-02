"use client";

import { useEffect } from "react";
import { AccountType } from "@/lib/types/auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Users,
    FileText,
    Shield,
    ArrowRight,
    CheckCircle,
} from "lucide-react";

export default function Home() {
    const router = useRouter();

    const features = [
        {
            icon: Building2,
            title: "Vendor Management",
            description:
                "Streamlined vendor registration, profile management, and capability tracking",
        },
        {
            icon: Users,
            title: "Employee Portal",
            description:
                "Centralized employee management with role-based access controls",
        },
        {
            icon: FileText,
            title: "Contract Management",
            description:
                "Complete procurement lifecycle from posting to award and tracking",
        },
        {
            icon: Shield,
            title: "Secure Access",
            description:
                "Enterprise-grade security with role-based permissions and audit trails",
        },
    ];

    const userTypes = [
        {
            title: "Administrators",
            description:
                "Manage users, oversee contracts, and generate comprehensive reports",
            features: [
                "User Management",
                "Contract Oversight",
                "System Administration",
                "Reporting",
            ],
            href: "/login",
            badge: "Admin Access",
        },
        {
            title: "Employees",
            description:
                "Access HR resources, view contracts, and manage your profile",
            features: [
                "Profile Management",
                "Contract Viewing",
                "HR Resources",
                "Document Access",
            ],
            href: "/login",
            badge: "Employee Portal",
        },
        {
            title: "Vendors",
            description:
                "Apply for contracts, manage bids, and track application status",
            features: [
                "Contract Bidding",
                "Bid Management",
                "Status Tracking",
                "Profile Setup",
            ],
            href: "/register",
            badge: "Get Started",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">JDC Portal</h1>
                            <p className="text-xs text-muted-foreground">
                                Jackson Development Company
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="secondary" className="mb-4">
                            Enterprise Management Portal
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Streamline Your
                            <br />
                            Business Operations
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Comprehensive portal for managing employees,
                            vendors, and procurement contracts. Built for
                            efficiency, security, and scalability.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link
                                    href="/register"
                                    className="flex items-center"
                                >
                                    Start Your Journey{" "}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/login">Access Portal</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything You Need in One Platform
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Our comprehensive portal provides all the tools
                            necessary for efficient business management
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <feature.icon className="w-10 h-10 text-primary mb-2" />
                                        <CardTitle className="text-lg">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Types Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Choose Your Access Level
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Different portal experiences tailored to your role
                            and responsibilities
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {userTypes.map((userType, index) => (
                            <motion.div
                                key={userType.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <CardTitle className="text-xl">
                                                {userType.title}
                                            </CardTitle>
                                            <Badge variant="outline">
                                                {userType.badge}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {userType.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-2 mb-6">
                                            {userType.features.map(
                                                (feature) => (
                                                    <li
                                                        key={feature}
                                                        className="flex items-center text-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button className="w-full" asChild>
                                            <Link href={userType.href}>
                                                {userType.title === "Vendors"
                                                    ? "Register Now"
                                                    : "Access Portal"}
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-primary text-primary-foreground">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                            Join thousands of users who trust JDC Portal for
                            their business management needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/register">Create Account</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                                asChild
                            >
                                <Link href="/login">Sign In</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="font-semibold">
                                    Jackson Development Company
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Management Portal
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 Jackson Development Company. All rights
                            reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
