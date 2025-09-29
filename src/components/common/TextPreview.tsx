"use client";

import React, { useState, useRef } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
    items: string[] | undefined | null;
    maxVisible?: number;
    className?: string;
};

/**
 * TextPreview component
 * - shows up to `maxVisible` items inline
 * - when there are more, shows a Popover on hover with the remaining items
 */
export default function TextPreview({
    items,
    maxVisible = 2,
    className,
}: Props) {
    const list = items || [];

    if (list.length === 0)
        return <span className="text-muted-foreground">—</span>;

    if (list.length <= maxVisible)
        return <span className={cn("", className)}>{list.join(", ")}</span>;

    const visible = list.slice(0, maxVisible);
    const remaining = list.slice(maxVisible);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "text-left text-sm text-primary underline-offset-2 hover:underline",
                        className
                    )}
                >
                    {visible.join(", ")}{" "}
                    <span className="text-muted-foreground">
                        +{remaining.length} more
                    </span>
                </div>
            </PopoverTrigger>

            <PopoverContent sideOffset={6} className="w-48 p-2">
                <div className="space-y-1">
                    {remaining.map((s, i) => (
                        <div key={i} className="text-sm text-foreground">
                            {s}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
