"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateInputProps {
    /** Selected date value */
    value?: Date | null;
    /** Change handler */
    onChange?: (date: Date | undefined) => void;
    /** Input label */
    label?: string;
    /** Placeholder text when no date is selected */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Required field indicator */
    required?: boolean;
    /** Error message */
    error?: string;
    /** Additional CSS classes */
    className?: string;
    /** Input ID for accessibility */
    id?: string;
    /** Minimum selectable date */
    fromDate?: Date;
    /** Maximum selectable date */
    toDate?: Date;
}

/**
 * DateInput - Reusable date picker component
 *
 * Features:
 * - Calendar popover for date selection
 * - Optional label and error message
 * - Disabled and required states
 * - Min/max date constraints
 * - Dark mode support
 *
 * Usage:
 * ```tsx
 * <DateInput
 *   label="Birth Date"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   required
 *   error={errors.birthDate}
 * />
 * ```
 */
export function DateInput({
    value,
    onChange,
    label,
    placeholder = "Pick a date",
    disabled = false,
    required = false,
    error,
    className,
    id,
    fromDate,
    toDate,
}: DateInputProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={id}>
                    {label}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </Label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        disabled={disabled}
                        data-empty={!value}
                        className={cn(
                            "data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal",
                            error &&
                                "border-destructive focus-visible:ring-destructive"
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                            format(value, "PPP")
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        onSelect={onChange}
                        disabled={disabled}
                        fromDate={fromDate}
                        toDate={toDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
