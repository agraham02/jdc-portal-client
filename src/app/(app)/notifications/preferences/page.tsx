"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { NotificationsApi } from "@/lib/services/notifications";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Save, Settings } from "lucide-react";
import type {
    UserPreferences,
    UpdatePreferencesDto,
} from "@/lib/types/notifications";
import { NotificationType } from "@/lib/types/notifications";

/**
 * User notification preferences page
 * Allows users to configure email, push, quiet hours, and opt-out categories
 */
export default function NotificationPreferencesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences | null>(
        null
    );

    // Form state
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [quietHoursStart, setQuietHoursStart] = useState("22:00");
    const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
    const [optOutCategories, setOptOutCategories] = useState<
        NotificationType[]
    >([]);

    // Load preferences
    useEffect(() => {
        async function loadPreferences() {
            try {
                const { data } = await NotificationsApi.getPreferences();
                setPreferences(data);
                setEmailEnabled(data.emailEnabled);
                setPushEnabled(data.pushEnabled);
                setQuietHoursStart(data.quietHoursStart || "22:00");
                setQuietHoursEnd(data.quietHoursEnd || "08:00");
                setOptOutCategories(data.optOutCategories || []);
            } catch (error) {
                console.error("Failed to load preferences:", error);
                toast.error("Failed to load notification preferences");
            } finally {
                setLoading(false);
            }
        }
        loadPreferences();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates: UpdatePreferencesDto = {
                emailEnabled,
                pushEnabled,
                quietHoursStart,
                quietHoursEnd,
                optOutCategories,
            };

            const { data } = await NotificationsApi.updatePreferences(updates);
            setPreferences(data);
            toast.success("Preferences saved successfully");
        } catch (error) {
            console.error("Failed to save preferences:", error);
            toast.error("Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    const toggleOptOut = (type: NotificationType) => {
        setOptOutCategories((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const hasChanges =
        preferences &&
        (emailEnabled !== preferences.emailEnabled ||
            pushEnabled !== preferences.pushEnabled ||
            quietHoursStart !== (preferences.quietHoursStart || "22:00") ||
            quietHoursEnd !== (preferences.quietHoursEnd || "08:00") ||
            JSON.stringify(optOutCategories.sort()) !==
                JSON.stringify((preferences.optOutCategories || []).sort()));

    if (loading) {
        return (
            <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
                <main className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 animate-spin" />
                        <div>
                            <h1 className="text-3xl font-bold">
                                Notification Preferences
                            </h1>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute anyOf={[P.NOTIFICATIONS_READ]}>
            <main className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        <div>
                            <h1 className="text-3xl font-bold">
                                Notification Preferences
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage how and when you receive notifications
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                {/* Email Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>
                            Receive notifications via email in addition to
                            in-app
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="email-enabled"
                                className="cursor-pointer"
                            >
                                Enable email notifications
                            </Label>
                            <Switch
                                id="email-enabled"
                                checked={emailEnabled}
                                onCheckedChange={setEmailEnabled}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Push Notifications</CardTitle>
                        <CardDescription>
                            Receive real-time push notifications when
                            you&apos;re online
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="push-enabled"
                                className="cursor-pointer"
                            >
                                Enable push notifications
                            </Label>
                            <Switch
                                id="push-enabled"
                                checked={pushEnabled}
                                onCheckedChange={setPushEnabled}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Quiet Hours */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>
                            Mute notifications during specific hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quiet-start">Start time</Label>
                                <Select
                                    value={quietHoursStart}
                                    onValueChange={setQuietHoursStart}
                                >
                                    <SelectTrigger id="quiet-start">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i
                                                .toString()
                                                .padStart(2, "0");
                                            return (
                                                <SelectItem
                                                    key={hour}
                                                    value={`${hour}:00`}
                                                >
                                                    {hour}:00
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quiet-end">End time</Label>
                                <Select
                                    value={quietHoursEnd}
                                    onValueChange={setQuietHoursEnd}
                                >
                                    <SelectTrigger id="quiet-end">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i
                                                .toString()
                                                .padStart(2, "0");
                                            return (
                                                <SelectItem
                                                    key={hour}
                                                    value={`${hour}:00`}
                                                >
                                                    {hour}:00
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You won&apos;t receive notifications between{" "}
                            {quietHoursStart} and {quietHoursEnd}
                        </p>
                    </CardContent>
                </Card>

                {/* Notification Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Categories</CardTitle>
                        <CardDescription>
                            Choose which types of notifications you want to
                            receive
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.values(NotificationType).map((type) => {
                                const isOptedOut =
                                    optOutCategories.includes(type);
                                const formattedName = type
                                    .replace(/([A-Z])/g, " $1")
                                    .trim();

                                return (
                                    <div
                                        key={type}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`category-${type}`}
                                            checked={!isOptedOut}
                                            onCheckedChange={() =>
                                                toggleOptOut(type)
                                            }
                                        />
                                        <Label
                                            htmlFor={`category-${type}`}
                                            className="cursor-pointer font-normal"
                                        >
                                            {formattedName}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </ProtectedRoute>
    );
}
