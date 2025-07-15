"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "onChange" | "checked"
    > {
    checked?: boolean | "indeterminate";
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        React.useImperativeHandle(ref, () => inputRef.current!, []);

        React.useEffect(() => {
            if (inputRef.current) {
                if (checked === "indeterminate") {
                    inputRef.current.indeterminate = true;
                    inputRef.current.checked = false;
                } else {
                    inputRef.current.indeterminate = false;
                    inputRef.current.checked = checked || false;
                }
            }
        }, [checked]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
        };

        return (
            <div className="relative inline-flex">
                <input
                    ref={inputRef}
                    type="checkbox"
                    className="sr-only"
                    checked={checked === true}
                    onChange={handleChange}
                    {...props}
                />
                <div
                    className={cn(
                        "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "cursor-pointer",
                        checked === true
                            ? "bg-primary text-primary-foreground"
                            : "bg-background",
                        className
                    )}
                    onClick={() =>
                        !props.disabled && onCheckedChange?.(!checked)
                    }
                >
                    {checked === true && (
                        <Check className="h-4 w-4 text-current" />
                    )}
                    {checked === "indeterminate" && (
                        <Minus className="h-4 w-4 text-current" />
                    )}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
