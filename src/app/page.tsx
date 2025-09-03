"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeIconButton } from "@/components/navigation/ThemeIconButton";
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
    UserCheck,
    Bell,
    Lock,
    Upload,
    ClipboardList,
} from "lucide-react";

export default function Home() {
    const features = [
        {
            icon: UserCheck,
            title: "Account Management",
            description:
                "Secure account creation, approval workflows, and comprehensive profile management with role-based access controls",
        },
        {
            icon: Lock,
            title: "Role-Based Access Control",
            description:
                "Advanced RBAC system with customizable roles, permissions, and secure authorization for all system features",
        },
        {
            icon: ClipboardList,
            title: "Procurement & Contracts",
            description:
                "Complete contract lifecycle management from creation to vendor applications, reviews, and awards",
        },
        {
            icon: Upload,
            title: "Document Management",
            description:
                "Secure HR document storage, sharing, and management with version control and access permissions",
        },
        {
            icon: Bell,
            title: "Real-time Notifications",
            description:
                "Instant notifications for account approvals, contract updates, document changes, and system events",
        },
        {
            icon: Shield,
            title: "Enterprise Security",
            description:
                "Multi-layered security with audit trails, session management, and comprehensive data protection",
        },
    ];

    const userTypes = [
        {
            title: "Administrators",
            description:
                "Manage user accounts, oversee procurement workflows, configure roles and permissions, and access comprehensive system controls",
            features: [
                "User Account Approval & Management",
                "Role & Permission Configuration",
                "Contract & Procurement Oversight",
                "System Administration & Audit Logs",
                "HR Document Management",
                "Notification & System Broadcasts",
            ],
            href: "/login",
            badge: "Admin Access",
        },
        {
            title: "Employees",
            description:
                "Access your profile, view contracts, manage HR documents, and participate in internal procurement processes",
            features: [
                "Personal Profile Management",
                "Contract Creation & Management",
                "HR Document Access & Download",
                "Internal Notes & Collaboration",
                "Real-time Notifications",
                "Secure Document Upload",
            ],
            href: "/login",
            badge: "Employee Portal",
        },
        {
            title: "Vendors",
            description:
                "Submit account requests, apply for contracts, track application status, and manage your vendor profile",
            features: [
                "Account Registration & Approval",
                "Contract Application Submission",
                "Bid Status Tracking & Updates",
                "Vendor Profile Management",
                "Document Upload & Management",
                "Application Deadline Monitoring",
            ],
            href: "/register",
            badge: "Apply Now",
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
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Get Started</Link>
                        </Button>
                        <ThemeIconButton />
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
                            Comprehensive Business Management Platform
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Complete Procurement
                            <br />& Business Portal
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Unified platform for account management, procurement
                            workflows, HR document sharing, and role-based
                            collaboration. Designed for security, efficiency,
                            and compliance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link
                                    href="/register"
                                    className="flex items-center"
                                >
                                    Apply as Vendor{" "}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/login">Employee Access</Link>
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
                            Comprehensive Platform Features
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            From secure account management to complex
                            procurement workflows, our platform provides
                            enterprise-grade capabilities
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Key Capabilities Section */}
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
                            Built for Enterprise Requirements
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Advanced workflows and security features that meet
                            the needs of modern business operations
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl font-bold mb-6">
                                Security & Compliance
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Account Approval Workflows
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            External vendor accounts require
                                            administrative approval before
                                            access is granted
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Role-Based Security
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Granular permissions system with
                                            customizable roles and access
                                            controls
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Audit & Compliance
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Complete audit trails for all
                                            actions, with compliance-ready
                                            logging
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl font-bold mb-6">
                                Workflow Excellence
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Contract Lifecycle Management
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Complete procurement process from
                                            contract creation to vendor awards
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Real-time Notifications
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Instant alerts for account
                                            approvals, contract updates, and
                                            system events
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Document Management
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Secure file sharing with version
                                            control and permission-based access
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
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
                            Tailored Access for Every Role
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Secure, role-based access with features designed
                            specifically for administrators, employees, and
                            external vendors
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
                                                    ? "Apply as Vendor"
                                                    : userType.title ===
                                                      "Administrators"
                                                    ? "Admin Login"
                                                    : "Employee Login"}
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
                            Ready to Join Our Platform?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                            Experience secure, efficient business management
                            with comprehensive workflows designed for modern
                            organizations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="secondary" asChild>
                                <Link href="/register">
                                    Vendor Registration
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                                asChild
                            >
                                <Link href="/login">Employee Login</Link>
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
