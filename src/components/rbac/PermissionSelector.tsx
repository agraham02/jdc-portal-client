"use client";

import { useMemo, useState } from "react";
import type { RBACPermission, PermissionsResponse } from "@/lib/types/rbac";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type Props = {
    permissionsData: PermissionsResponse | null;
    value: string[];
    onChange: (permissionIds: string[]) => void;
    disabled?: boolean;
};

export function PermissionSelector({
    permissionsData,
    value,
    onChange,
    disabled,
}: Props) {
    const [query, setQuery] = useState("");

    const categorized = useMemo(
        () => permissionsData?.categorized ?? {},
        [permissionsData]
    );
    const categories = useMemo(
        () => Object.keys(categorized).sort(),
        [categorized]
    );

    const toggle = (id: string) => {
        if (disabled) return;
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const filteredIds = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        const all: RBACPermission[] = permissionsData?.permissions ?? [];
        return all
            .filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.description ?? "").toLowerCase().includes(q)
            )
            .map((p) => p._id);
    }, [permissionsData, query]);

    const isVisible = (permId: string) => {
        return filteredIds == null || filteredIds.includes(permId);
    };

    return (
        <div className="space-y-3">
            <Input
                placeholder="Search permissions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search permissions"
            />

            <div className="max-h-80 overflow-auto rounded-md border p-3">
                {categories.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        No permissions available
                    </div>
                )}
                {categories.map((cat, idx) => {
                    const items = categorized[cat] as RBACPermission[];
                    const anyVisible = items.some((p) => isVisible(p._id));
                    if (!anyVisible) return null;
                    return (
                        <div key={cat} className="py-2">
                            <div className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                                {cat}
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {items.map((p) => {
                                    if (!isVisible(p._id)) return null;
                                    const checked = value.includes(p._id);
                                    return (
                                        <label
                                            key={p._id}
                                            className="flex items-start gap-2 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() =>
                                                    toggle(p._id)
                                                }
                                                disabled={disabled}
                                                aria-label={`Toggle permission ${p.name}`}
                                            />
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium">
                                                    {p.name}
                                                </div>
                                                {p.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {p.description}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {idx < categories.length - 1 && (
                                <Separator className="my-3" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
