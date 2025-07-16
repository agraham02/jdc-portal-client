"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleForm } from "@/components/rbac";
import { RBACRole } from "@/lib/types/rbac";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function CreateRolePage() {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSave = async (role: RBACRole) => {
        setSuccessMessage(`Role "${role.name}" created successfully!`);

        // Auto-redirect after a brief success message
        setTimeout(() => {
            router.push("/admin/rbac/roles");
        }, 2000);
    };

    const handleCancel = () => {
        router.push("/admin/rbac/roles");
    };

    if (successMessage) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/rbac/roles")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Roles
                    </Button>
                </div>

                <Card>
                    <CardContent className="py-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Role Created Successfully!
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {successMessage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to roles list...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Roles
                </Button>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Role</CardTitle>
                    <CardDescription>
                        Create a custom role with specific permissions. Custom
                        roles allow you to define exactly what permissions users
                        should have beyond the standard system roles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">
                            Guidelines for Creating Roles:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                • Choose a descriptive name that clearly
                                indicates the role&apos;s purpose
                            </li>
                            <li>
                                • Select only the permissions necessary for the
                                role&apos;s responsibilities
                            </li>
                            <li>
                                • Consider the principle of least privilege -
                                grant minimal access needed
                            </li>
                            <li>
                                • Add a clear description to help other
                                administrators understand the role
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Role Form */}
            <RoleForm onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
}
