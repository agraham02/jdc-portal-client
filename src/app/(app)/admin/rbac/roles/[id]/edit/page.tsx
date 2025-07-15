"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RBACService } from "@/lib/services/rbac";
import { RoleForm } from "@/components/rbac";
import { RBACRole } from "@/lib/types/rbac";
import { SYSTEM_ROLES } from "@/lib/constants/permissions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

export default function EditRolePage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.id as string;

    const [role, setRole] = useState<RBACRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const data = await RBACService.getRoleById(roleId);
                setRole(data);

                // Check if this is a system role
                if (
                    !data.isCustom ||
                    SYSTEM_ROLES.includes(
                        data.name as (typeof SYSTEM_ROLES)[number]
                    )
                ) {
                    setError("System roles cannot be edited");
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to fetch role"
                );
            } finally {
                setLoading(false);
            }
        };

        if (roleId) {
            fetchRole();
        }
    }, [roleId]);

    const handleSave = async (updatedRole: RBACRole) => {
        setSuccessMessage(`Role "${updatedRole.name}" updated successfully!`);

        // Auto-redirect after a brief success message
        setTimeout(() => {
            router.push(`/admin/rbac/roles/${updatedRole._id}`);
        }, 2000);
    };

    const handleCancel = () => {
        if (role) {
            router.push(`/admin/rbac/roles/${role._id}`);
        } else {
            router.push("/admin/rbac/roles");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                </div>
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2">Loading role...</span>
                </div>
            </div>
        );
    }

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
                            Role Updated Successfully!
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {successMessage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to role details...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !role) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                </div>

                <Card>
                    <CardContent className="py-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Cannot Edit Role
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {error || "Role not found"}
                        </p>
                        <Button variant="outline" onClick={handleCancel}>
                            Go Back
                        </Button>
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
                    Back to Role Details
                </Button>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Role: {role.name}</CardTitle>
                    <CardDescription>
                        Update the role information and permissions. Changes
                        will affect all users currently assigned to this role.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-md">
                        <h4 className="font-medium mb-2">Important Notes:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                • Changing permissions will immediately affect
                                all users with this role
                            </li>
                            <li>
                                • Role name changes should be communicated to
                                other administrators
                            </li>
                            <li>
                                • Consider the impact on users&apos; current
                                workflows
                            </li>
                            <li>• System roles cannot be modified</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Role Form */}
            <RoleForm role={role} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
}
