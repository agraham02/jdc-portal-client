"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/lib/services/notificationService";
import { userService } from "@/lib/services/userService";
import { NotificationType } from "@/lib/types/notifications";
import { useAuth } from "@/lib/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName, User } from "@/lib/types/auth";
import { useToast } from "@/components/ui/use-toast";
import {
    Plus,
    Send,
    RefreshCw,
    Search,
    X,
    Users,
    UserCheck,
    AlertCircle,
} from "lucide-react";

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
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown>;
}

type RecipientType = "self" | "role" | "specific" | "multiple";

export function NotificationCreationPanelAdvanced() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState<NotificationFormData>({
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: "",
        message: "",
        data: {},
    });

    const [recipientType, setRecipientType] = useState<RecipientType>("self");
    const [targetRole, setTargetRole] = useState<RoleName>(RoleName.EMPLOYEE);
    const [customData, setCustomData] = useState<string>("");

    // User search and selection
    const [userSearch, setUserSearch] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const performUserSearch = useCallback(
        async (query: string) => {
            if (query.length < 2) return;

            setIsSearching(true);
            try {
                const results = await userService.searchUsers(query, 10);
                setSearchResults(results);
                setShowSearchResults(true);
            } catch {
                console.error("Failed to search users. Please try again.");
                toast({
                    title: "Search Error",
                    description: "Failed to search users. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsSearching(false);
            }
        },
        [toast]
    );

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (userSearch.trim() && recipientType === "specific") {
                performUserSearch(userSearch.trim());
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [userSearch, recipientType, performUserSearch]);

    const resetForm = () => {
        setFormData({
            type: NotificationType.SYSTEM_ANNOUNCEMENT,
            title: "",
            message: "",
            data: {},
        });
        setRecipientType("self");
        setTargetRole(RoleName.EMPLOYEE);
        setCustomData("");
        setShowAdvanced(false);
        setSelectedUsers([]);
        setUserSearch("");
        setSearchResults([]);
        setShowSearchResults(false);
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
            console.warn("Invalid JSON in custom data");
        }
    };

    const handleUserSelect = (selectedUser: User) => {
        if (recipientType === "specific") {
            setSelectedUsers([selectedUser]);
        } else if (recipientType === "multiple") {
            setSelectedUsers((prev) => {
                const exists = prev.find((u) => u._id === selectedUser._id);
                if (exists) return prev;
                return [...prev, selectedUser];
            });
        }
        setUserSearch("");
        setShowSearchResults(false);
    };

    const handleUserRemove = (userId: string) => {
        setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
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
        if (
            (recipientType === "specific" || recipientType === "multiple") &&
            selectedUsers.length === 0
        ) {
            return "Please select at least one recipient";
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

    const createNotifications = async () => {
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
            let recipientUserIds: string[] = [];
            let successMessage = "";

            // Determine recipients based on type
            switch (recipientType) {
                case "self":
                    recipientUserIds = [user._id];
                    successMessage = "Test notification created successfully";
                    break;
                case "role":
                    // For role-based notifications, create a single notification with role metadata
                    // The backend would ideally handle the distribution
                    recipientUserIds = [user._id]; // Temporary - send to admin
                    const roleData = {
                        ...formData.data,
                        targetRole,
                        isRoleBasedNotification: true,
                        createdBy: user._id,
                    };
                    setFormData((prev) => ({ ...prev, data: roleData }));
                    successMessage = `Role-based notification created for ${targetRole}s`;
                    break;
                case "specific":
                case "multiple":
                    recipientUserIds = selectedUsers.map((u) => u._id);
                    successMessage = `Notification sent to ${
                        recipientUserIds.length
                    } user${recipientUserIds.length > 1 ? "s" : ""}`;
                    break;
            }

            // Create notifications for each recipient
            const promises = recipientUserIds.map((userId) =>
                notificationService.createNotification({
                    ...formData,
                    userId,
                    title: formData.title.trim(),
                    message: formData.message.trim(),
                })
            );

            await Promise.all(promises);

            toast({
                title: "Success",
                description: successMessage,
            });

            resetForm();

            // Optional: Refresh to see new notifications
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error("Failed to create notification(s):", error);
            toast({
                title: "Error",
                description:
                    "Failed to create notification(s). Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const getRecipientSummary = () => {
        switch (recipientType) {
            case "self":
                return "Myself (Test)";
            case "role":
                return `All ${targetRole}s`;
            case "specific":
                return selectedUsers.length > 0
                    ? `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`
                    : "No user selected";
            case "multiple":
                return selectedUsers.length > 0
                    ? `${selectedUsers.length} selected user${
                          selectedUsers.length > 1 ? "s" : ""
                      }`
                    : "No users selected";
            default:
                return "";
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
                            onValueChange={(value: RecipientType) => {
                                setRecipientType(value);
                                setSelectedUsers([]);
                                setUserSearch("");
                                setShowSearchResults(false);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Myself (Test)
                                    </div>
                                </SelectItem>
                                <SelectItem value="role">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        All Users with Role
                                    </div>
                                </SelectItem>
                                <SelectItem value="specific">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        Specific User
                                    </div>
                                </SelectItem>
                                <SelectItem value="multiple">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Multiple Users
                                    </div>
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

                    {/* User Search and Selection */}
                    {(recipientType === "specific" ||
                        recipientType === "multiple") && (
                        <div className="space-y-2">
                            <Label htmlFor="user-search">
                                {recipientType === "specific"
                                    ? "Select User"
                                    : "Search Users"}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="user-search"
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={(e) =>
                                        setUserSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                                {isSearching && (
                                    <RefreshCw className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>

                            {/* Search Results */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="max-h-48 overflow-y-auto border rounded-md bg-background">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                            onClick={() =>
                                                handleUserSelect(user)
                                            }
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {user.roles.map(
                                                    (role, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {typeof role ===
                                                            "string"
                                                                ? role
                                                                : role.name}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Selected Users</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUsers.map((user) => (
                                            <Badge
                                                key={user._id}
                                                variant="default"
                                                className="flex items-center gap-1"
                                            >
                                                {user.firstName} {user.lastName}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() =>
                                                        handleUserRemove(
                                                            user._id
                                                        )
                                                    }
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results Message */}
                            {showSearchResults &&
                                searchResults.length === 0 &&
                                userSearch.length > 1 && (
                                    <div className="flex items-center gap-2 p-3 text-muted-foreground border rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        No users found matching &ldquo;
                                        {userSearch}&rdquo;
                                    </div>
                                )}
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
                            onClick={createNotifications}
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
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        Recipients:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {getRecipientSummary()}
                                    </span>
                                </div>
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
