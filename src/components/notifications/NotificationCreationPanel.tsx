"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { notificationService } from "@/lib/services/notificationService";
import { NotificationType } from "@/lib/types/notifications";
import { useAuth } from "@/lib/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Send, RefreshCw } from "lucide-react";

// Notification type display names
const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    [NotificationType.APPLICATION_SUBMITTED]: "Application Submitted",
    [NotificationType.APPLICATION_ACCEPTED]: "Application Accepted",
    [NotificationType.APPLICATION_REJECTED]: "Application Rejected",
    [NotificationType.CONTRACT_AWARDED]: "Contract Awarded",
    [NotificationType.CONTRACT_CREATED]: "Contract Created",
    [NotificationType.CONTRACT_DEADLINE_APPROACHING]:
        "Contract Deadline Approaching",
    [NotificationType.EMPLOYEE_APPROVED]: "Employee Approved",
    [NotificationType.EMPLOYEE_REJECTED]: "Employee Rejected",
    [NotificationType.VENDOR_APPROVED]: "Vendor Approved",
    [NotificationType.VENDOR_REJECTED]: "Vendor Rejected",
    [NotificationType.FILE_UPLOADED]: "File Uploaded",
    [NotificationType.FILE_APPROVED]: "File Approved",
    [NotificationType.FILE_REJECTED]: "File Rejected",
    [NotificationType.SYSTEM_ANNOUNCEMENT]: "System Announcement",
};

interface NotificationFormData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown>;
}

export function NotificationCreationPanel() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState<NotificationFormData>({
        userId: "",
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: "",
        message: "",
        data: {},
    });

    const [recipientType, setRecipientType] = useState<
        "self" | "role" | "specific"
    >("self");
    const [targetRole, setTargetRole] = useState<RoleName>(RoleName.EMPLOYEE);
    const [customData, setCustomData] = useState<string>("");

    const resetForm = () => {
        setFormData({
            userId: "",
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            title: "",
            message: "",
            data: {},
        });
        setRecipientType("self");
        setTargetRole(RoleName.EMPLOYEE);
        setCustomData("");
        setShowAdvanced(false);
    };

    const handleInputChange = (
        field: keyof NotificationFormData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleDataChange = (value: string) => {
        setCustomData(value);
        try {
            const parsedData = value.trim() ? JSON.parse(value) : {};
            setFormData((prev) => ({
                ...prev,
                data: parsedData,
            }));
        } catch {
            // Invalid JSON - we'll validate on submit
            console.warn("Invalid JSON in custom data");
        }
    };

    const validateForm = (): string | null => {
        if (!formData.title.trim()) {
            return "Title is required";
        }
        if (!formData.message.trim()) {
            return "Message is required";
        }
        if (recipientType === "self" && !user?._id) {
            return "User ID not available";
        }
        if (customData.trim()) {
            try {
                JSON.parse(customData);
            } catch {
                return "Custom data must be valid JSON";
            }
        }
        return null;
    };

    const createNotification = async () => {
        const validationError = validateForm();
        if (validationError) {
            toast({
                title: "Validation Error",
                description: validationError,
                variant: "destructive",
            });
            return;
        }

        if (!user) return;

        setIsCreating(true);
        try {
            // Determine recipient based on type
            let targetUserId = user._id; // Default to self

            if (recipientType === "self") {
                targetUserId = user._id;
            } else if (recipientType === "role") {
                // For role-based notifications, we'll send to the admin for now
                // In a real implementation, you'd want to create multiple notifications
                // or have the backend handle role-based distribution
                targetUserId = user._id;

                // Add role information to the data
                const roleData = {
                    ...formData.data,
                    targetRole,
                    isRoleBasedNotification: true,
                    createdBy: user._id,
                };

                setFormData((prev) => ({
                    ...prev,
                    data: roleData,
                }));
            }

            await notificationService.createNotification({
                ...formData,
                userId: targetUserId,
                title: formData.title.trim(),
                message: formData.message.trim(),
            });

            toast({
                title: "Success",
                description: `Notification created successfully${
                    recipientType === "role" ? ` for ${targetRole} role` : ""
                }`,
            });

            resetForm();

            // Optional: Refresh the page to see the new notification
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch {
            console.error("Failed to create notification. Please try again.");
            toast({
                title: "Error",
                description: "Failed to create notification. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ProtectedRoute requiredRoles={[RoleName.ADMIN]}>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Notification
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Recipient Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="recipient-type">Send To</Label>
                        <Select
                            value={recipientType}
                            onValueChange={(
                                value: "self" | "role" | "specific"
                            ) => setRecipientType(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self">
                                    Myself (Test)
                                </SelectItem>
                                <SelectItem value="role">
                                    All Users with Role
                                </SelectItem>
                                <SelectItem value="specific" disabled>
                                    Specific User (Coming Soon)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role Selection */}
                    {recipientType === "role" && (
                        <div className="space-y-2">
                            <Label htmlFor="target-role">Target Role</Label>
                            <Select
                                value={targetRole}
                                onValueChange={(value: RoleName) =>
                                    setTargetRole(value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RoleName.ADMIN}>
                                        Administrators
                                    </SelectItem>
                                    <SelectItem value={RoleName.EMPLOYEE}>
                                        Employees
                                    </SelectItem>
                                    <SelectItem value={RoleName.VENDOR}>
                                        Vendors
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Notification Type */}
                    <div className="space-y-2">
                        <Label htmlFor="notification-type">
                            Notification Type
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: NotificationType) =>
                                handleInputChange("type", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(NOTIFICATION_TYPE_LABELS).map(
                                    ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter notification title"
                            value={formData.title}
                            onChange={(e) =>
                                handleInputChange("title", e.target.value)
                            }
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.title.length}/100 characters
                        </p>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Enter notification message"
                            value={formData.message}
                            onChange={(e) =>
                                handleInputChange("message", e.target.value)
                            }
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.message.length}/500 characters
                        </p>
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? "Hide" : "Show"} Advanced Options
                        </Button>
                    </div>

                    {/* Advanced Options */}
                    {showAdvanced && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                                <Label htmlFor="custom-data">
                                    Custom Data (JSON)
                                    <span className="text-xs text-muted-foreground ml-2">
                                        Optional
                                    </span>
                                </Label>
                                <Textarea
                                    id="custom-data"
                                    placeholder='{"key": "value", "priority": "high"}'
                                    value={customData}
                                    onChange={(e) =>
                                        handleDataChange(e.target.value)
                                    }
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Additional data to include with the
                                    notification. Must be valid JSON.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={createNotification}
                            disabled={isCreating}
                            className="flex-1"
                        >
                            {isCreating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Create Notification
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={isCreating}
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Preview */}
                    {(formData.title || formData.message) && (
                        <div className="mt-6 p-4 border rounded-lg bg-background">
                            <h4 className="font-medium mb-2">Preview</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        Type:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {
                                            NOTIFICATION_TYPE_LABELS[
                                                formData.type
                                            ]
                                        }
                                    </span>
                                </div>
                                {recipientType === "role" && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            Target:
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            All {targetRole}s
                                        </span>
                                    </div>
                                )}
                                {formData.title && (
                                    <div>
                                        <span className="text-sm font-medium">
                                            Title:
                                        </span>
                                        <p className="text-sm mt-1">
                                            {formData.title}
                                        </p>
                                    </div>
                                )}
                                {formData.message && (
                                    <div>
                                        <span className="text-sm font-medium">
                                            Message:
                                        </span>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">
                                            {formData.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ProtectedRoute>
    );
}
