"use client";

import { useState } from "react";
import {
    RBACRole,
    RBACPermission,
    CreateRoleRequest,
    UpdateRoleRequest,
} from "@/lib/types/rbac";
import { RBACService } from "@/lib/services/rbac";
import { usePermissions } from "@/lib/hooks/useRBAC";
import { VALIDATION_RULES } from "@/lib/constants/permissions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PermissionSelector } from "./PermissionSelector";
import { AlertCircle, Save, X } from "lucide-react";

interface RoleFormProps {
    role?: RBACRole; // If provided, this is an edit form
    onSave: (role: RBACRole) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

interface FormData {
    name: string;
    description: string;
    permissionIds: string[];
}

interface FormErrors {
    name?: string;
    description?: string;
    permissions?: string;
    general?: string;
}

export function RoleForm({
    role,
    onSave,
    onCancel,
    isSubmitting = false,
}: RoleFormProps) {
    const isEditing = !!role;
    const { permissions, loading: permissionsLoading } = usePermissions();

    const [formData, setFormData] = useState<FormData>({
        name: role?.name || "",
        description: role?.description || "",
        permissionIds: role?.permissions
            ? typeof role.permissions[0] === "string"
                ? (role.permissions as string[])
                : (role.permissions as RBACPermission[]).map((p) => p._id)
            : [],
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validation
    const validateField = (
        field: keyof FormData,
        value: string | string[]
    ): string | undefined => {
        switch (field) {
            case "name":
                return (
                    RBACService.validateRoleName(value as string) || undefined
                );
            case "description":
                return (
                    RBACService.validateRoleDescription(value as string) ||
                    undefined
                );
            case "permissionIds":
                return (
                    RBACService.validatePermissions(value as string[]) ||
                    undefined
                );
            default:
                return undefined;
        }
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        Object.keys(formData).forEach((key) => {
            const fieldKey = key as keyof FormData;
            const error = validateField(fieldKey, formData[fieldKey]);
            if (error) {
                newErrors[fieldKey as keyof FormErrors] = error;
            }
        });

        return newErrors;
    };

    // Handle field changes
    const handleFieldChange = (
        field: keyof FormData,
        value: string | string[]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Clear field error on change
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Handle field blur for validation
    const handleFieldBlur = (field: keyof FormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            setTouched({
                name: true,
                description: true,
                permissionIds: true,
            });
            return;
        }

        try {
            const requestData: CreateRoleRequest | UpdateRoleRequest = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                permissionIds: formData.permissionIds,
            };

            let savedRole: RBACRole;
            if (isEditing && role) {
                savedRole = await RBACService.updateRole(role._id, requestData);
            } else {
                savedRole = await RBACService.createRole(
                    requestData as CreateRoleRequest
                );
            }

            onSave(savedRole);
        } catch (error: unknown) {
            console.error("Failed to save role:", error);

            let errorMessage = "Failed to save role. Please try again.";

            if (error instanceof Error) {
                // Type-safe error handling with proper interfaces
                const axiosError = error as {
                    code?: string;
                    isAxiosError?: boolean;
                    response?: { status?: number };
                };

                // Check for network errors
                if (
                    axiosError.code === "ECONNABORTED" ||
                    axiosError.isAxiosError
                ) {
                    errorMessage =
                        "Network error: Unable to connect to the server. Please check your internet connection.";
                }
                // Check for validation errors
                else if (axiosError.response?.status === 400) {
                    errorMessage =
                        "Validation error: Please ensure all fields are filled out correctly.";
                }
                // Check for server errors
                else if (
                    axiosError.response?.status &&
                    axiosError.response.status >= 500
                ) {
                    errorMessage =
                        "Server error: Something went wrong on our end. Please try again later.";
                } else {
                    errorMessage = error.message;
                }
            }
            setErrors({
                general: errorMessage,
            });
        }
    };

    const isFormValid = Object.keys(validateForm()).length === 0;
    const hasUnsavedChanges = isEditing
        ? formData.name !== role?.name ||
          formData.description !== (role?.description || "") ||
          JSON.stringify(formData.permissionIds.sort()) !==
              JSON.stringify(
                  (typeof role?.permissions[0] === "string"
                      ? (role.permissions as string[])
                      : (role?.permissions as RBACPermission[]).map(
                            (p) => p._id
                        )
                  ).sort()
              )
        : formData.name.trim() !== "" ||
          formData.description.trim() !== "" ||
          formData.permissionIds.length > 0;

    if (permissionsLoading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner />
                        <span>Loading permissions...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Edit Role" : "Create New Role"}
                </CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Update the role information and permissions"
                        : "Create a new custom role with specific permissions"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                            <div className="flex items-center space-x-2 text-destructive">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">
                                    {errors.general}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Role Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Role Name{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                handleFieldChange("name", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("name")}
                            placeholder="Enter role name"
                            maxLength={VALIDATION_RULES.ROLE_NAME.MAX_LENGTH}
                            disabled={isSubmitting}
                            className={
                                errors.name && touched.name
                                    ? "border-destructive"
                                    : ""
                            }
                        />
                        {errors.name && touched.name && (
                            <p className="text-sm text-destructive">
                                {errors.name}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {formData.name.length}/
                            {VALIDATION_RULES.ROLE_NAME.MAX_LENGTH} characters
                        </p>
                    </div>

                    {/* Role Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                                handleFieldChange("description", e.target.value)
                            }
                            onBlur={() => handleFieldBlur("description")}
                            placeholder="Enter role description"
                            maxLength={
                                VALIDATION_RULES.ROLE_DESCRIPTION.MAX_LENGTH
                            }
                            disabled={isSubmitting}
                            className={
                                errors.description && touched.description
                                    ? "border-destructive"
                                    : ""
                            }
                            rows={3}
                        />
                        {errors.description && touched.description && (
                            <p className="text-sm text-destructive">
                                {errors.description}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {formData.description.length}/
                            {VALIDATION_RULES.ROLE_DESCRIPTION.MAX_LENGTH}{" "}
                            characters
                        </p>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-2">
                        {permissions && (
                            <PermissionSelector
                                permissions={permissions.permissions}
                                selectedPermissionIds={formData.permissionIds}
                                onChange={(permissionIds) =>
                                    handleFieldChange(
                                        "permissionIds",
                                        permissionIds
                                    )
                                }
                                disabled={isSubmitting}
                            />
                        )}
                        {errors.permissions && touched.permissionIds && (
                            <p className="text-sm text-destructive">
                                {errors.permissions}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            {hasUnsavedChanges && "You have unsaved changes"}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    !isFormValid ||
                                    isSubmitting ||
                                    !hasUnsavedChanges
                                }
                            >
                                {isSubmitting && (
                                    <LoadingSpinner className="w-4 h-4 mr-1" />
                                )}
                                <Save className="w-4 h-4 mr-1" />
                                {isEditing ? "Update Role" : "Create Role"}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
