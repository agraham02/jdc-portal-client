"use client";

import { useEffect, useMemo, useState } from "react";
import { RBACService } from "@/lib/services/rbac";
import type { RBACPermission, PermissionsResponse } from "@/lib/types/rbac";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export function PermissionsBrowser() {
    const [data, setData] = useState<PermissionsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await RBACService.getAllPermissions();
                if (!cancelled) setData(res);
            } catch (e) {
                if (!cancelled)
                    setError(
                        e instanceof Error
                            ? e.message
                            : "Failed to load permissions"
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const categorized = useMemo(() => data?.categorized ?? {}, [data]);
    const categories = useMemo(
        () => Object.keys(categorized).sort(),
        [categorized]
    );

    const filter = (p: RBACPermission) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            p.name.toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q)
        );
    };

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search permissions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72"
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
                <div className="space-y-4">
                    {categories.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No permissions
                        </div>
                    )}
                    {categories.map((cat, idx) => {
                        const items = (
                            categorized[cat] as RBACPermission[]
                        ).filter(filter);
                        if (items.length === 0) return null;
                        return (
                            <div key={cat}>
                                <div className="text-xs font-medium uppercase text-muted-foreground tracking-wide mb-2">
                                    {cat}
                                </div>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((p) => (
                                                <TableRow key={p._id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {p.name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {p.description ?? "—"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {idx < categories.length - 1 && (
                                    <Separator className="my-4" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
