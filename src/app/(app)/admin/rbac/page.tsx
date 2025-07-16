"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Shield, Users, Key, UserCheck } from "lucide-react";

export default function RBACDashboard() {
    const dashboardCards = [
        {
            title: "Role Management",
            description: "Create, edit, and manage system and custom roles",
            icon: Shield,
            href: "/admin/rbac/roles",
            color: "text-blue-600",
        },
        {
            title: "User Role Assignment",
            description: "Assign and manage user roles",
            icon: UserCheck,
            href: "/admin/rbac/users",
            color: "text-green-600",
        },
        {
            title: "Permission Overview",
            description: "View all available system permissions",
            icon: Key,
            href: "/admin/rbac/permissions",
            color: "text-purple-600",
        },
        {
            title: "User Management",
            description: "View and manage all system users",
            icon: Users,
            href: "/admin/rbac/users",
            color: "text-orange-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={card.title}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center space-x-2">
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                    <CardTitle className="text-lg">
                                        {card.title}
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-sm">
                                    {card.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href={card.href}>Manage</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common RBAC management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Link href="/admin/rbac/roles/create">
                                <Shield className="w-4 h-4 mr-2" />
                                Create New Role
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Link href="/admin/rbac/users">
                                <UserCheck className="w-4 h-4 mr-2" />
                                Assign User Roles
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                        <CardDescription>
                            RBAC system status and information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    System Roles:
                                </span>
                                <span className="font-medium">
                                    3 (Admin, Employee, Vendor)
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Permission Categories:
                                </span>
                                <span className="font-medium">
                                    7 Categories
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    RBAC Status:
                                </span>
                                <span className="font-medium text-green-600">
                                    Active
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
