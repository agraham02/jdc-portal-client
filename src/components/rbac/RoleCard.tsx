"use client";

import Link from "next/link";
import { RBACRole } from "@/lib/types/rbac";
import { SYSTEM_ROLES } from "@/lib/constants/permissions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Edit, Trash2, Eye } from "lucide-react";

interface RoleCardProps {
    role: RBACRole;
    onEdit?: (role: RBACRole) => void;
    onDelete?: (role: RBACRole) => void;
    onViewUsers?: (role: RBACRole) => void;
}

export function RoleCard({
    role,
    onEdit,
    onDelete,
    onViewUsers,
}: RoleCardProps) {
    const isSystemRole = SYSTEM_ROLES.includes(
        role.name as (typeof SYSTEM_ROLES)[number]
    );
    const permissionCount = Array.isArray(role.permissions)
        ? role.permissions.length
        : 0;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card
            className={`hover:shadow-md transition-shadow ${
                !role.isActive ? "opacity-70" : ""
            }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <Shield
                            className={`w-5 h-5 ${
                                isSystemRole
                                    ? "text-blue-600"
                                    : "text-green-600"
                            }`}
                        />
                        <div>
                            <CardTitle className="text-lg">
                                {role.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                    variant={
                                        isSystemRole ? "default" : "secondary"
                                    }
                                >
                                    {isSystemRole ? "System" : "Custom"}
                                </Badge>
                                <Badge
                                    variant={
                                        role.isActive
                                            ? "outline"
                                            : "destructive"
                                    }
                                >
                                    {role.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                {role.description && (
                    <CardDescription className="text-sm">
                        {role.description}
                    </CardDescription>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Permissions:
                        </span>
                        <Badge variant="outline">{permissionCount}</Badge>
                    </div>
                    {role.userCount !== undefined && (
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Users:
                            </span>
                            <Badge variant="outline">{role.userCount}</Badge>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                {(role.createdAt || role.updatedAt) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                        {role.createdAt && (
                            <div>Created: {formatDate(role.createdAt)}</div>
                        )}
                        {role.updatedAt &&
                            role.updatedAt !== role.createdAt && (
                                <div>Updated: {formatDate(role.updatedAt)}</div>
                            )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/rbac/roles/${role._id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Link>
                    </Button>

                    {role.isCustom && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(role)}
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                    )}

                    {onViewUsers && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewUsers(role)}
                        >
                            <Users className="w-4 h-4 mr-1" />
                            Users
                        </Button>
                    )}

                    {role.isCustom && role.userCount === 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete?.(role)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                    )}
                </div>

                {/* Warning for roles with users */}
                {role.isCustom && role.userCount && role.userCount > 0 && (
                    <div className="bg-muted p-2 rounded text-xs text-muted-foreground">
                        Cannot delete role with assigned users
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
