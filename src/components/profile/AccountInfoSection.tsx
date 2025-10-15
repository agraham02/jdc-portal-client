"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/contexts/auth-context";
import type { User } from "@/lib/types/auth";

interface AccountInfoSectionProps {
    user: User;
}

export function AccountInfoSection({ user }: AccountInfoSectionProps) {
    const { accountType } = useAuth();
    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">
                            Account Information
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Account details and status (read-only)
                    </p>
                    <Separator className="mb-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Email (Login)</Label>
                        <Input value={user.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex items-center h-10">
                            <StatusBadge type="user" status={user.status} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Input value={accountType || "Loading..."} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Roles</Label>
                        <Input
                            value={
                                user.roles
                                    ?.map((r) =>
                                        typeof r === "string" ? r : r.name
                                    )
                                    .join(", ") || ""
                            }
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Created</Label>
                        <Input
                            value={
                                user.createdAt
                                    ? format(new Date(user.createdAt), "PPP")
                                    : "N/A"
                            }
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Updated</Label>
                        <Input
                            value={
                                user.updatedAt
                                    ? format(new Date(user.updatedAt), "PPP")
                                    : "N/A"
                            }
                            disabled
                        />
                    </div>
                    {user.lastLogin && (
                        <div className="space-y-2 md:col-span-2">
                            <Label>Last Login</Label>
                            <Input
                                value={format(
                                    new Date(user.lastLogin),
                                    "PPP p"
                                )}
                                disabled
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
