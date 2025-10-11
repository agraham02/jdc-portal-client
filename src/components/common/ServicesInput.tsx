"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ServicesInputProps {
    id?: string;
    label?: string;
    value?: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    maxItems?: number;
    suggestions?: string[];
    className?: string;
}

/**
 * ServicesInput - Multi-select tag input for vendor services
 * 
 * Features:
 * - Add/remove tags
 * - Enter or comma to add
 * - Optional suggestions
 * - Max items limit
 * - Clean, accessible UI
 * 
 * Usage:
 * ```tsx
 * <ServicesInput
 *   label="Services Offered"
 *   value={services}
 *   onChange={setServices}
 *   suggestions={["Construction", "Electrical", "Plumbing"]}
 * />
 * ```
 */
export function ServicesInput({
    id = "services",
    label,
    value = [],
    onChange,
    placeholder = "Type and press Enter to add",
    disabled = false,
    required = false,
    error,
    maxItems = 20,
    suggestions = [
        "Construction",
        "Electrical",
        "Plumbing",
        "HVAC",
        "Landscaping",
        "Carpentry",
        "Painting",
        "Roofing",
        "Concrete",
        "Flooring",
    ],
    className,
}: ServicesInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredSuggestions = suggestions.filter(
        (s) =>
            s.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(s)
    );

    const addService = (service: string) => {
        const trimmed = service.trim();
        if (
            !trimmed ||
            value.includes(trimmed) ||
            value.length >= maxItems
        ) {
            return;
        }
        onChange?.([...value, trimmed]);
        setInputValue("");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeService = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addService(inputValue);
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            // Remove last tag on backspace if input is empty
            removeService(value.length - 1);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={id}>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            )}

            {/* Selected tags */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                    {value.map((service, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            {service}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive/20"
                                onClick={() => removeService(index)}
                                disabled={disabled}
                                aria-label={`Remove ${service}`}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Input field */}
            <div className="relative">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        id={id}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder={
                            value.length >= maxItems
                                ? `Maximum ${maxItems} services`
                                : placeholder
                        }
                        disabled={disabled || value.length >= maxItems}
                        className={cn(
                            error && "border-destructive focus-visible:ring-destructive"
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => addService(inputValue)}
                        disabled={!inputValue.trim() || value.length >= maxItems || disabled}
                        aria-label="Add service"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
                        {filteredSuggestions.slice(0, 8).map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                                onClick={() => addService(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}

            {!error && (
                <p className="text-xs text-muted-foreground">
                    Press Enter or comma to add. {value.length}/{maxItems} services
                </p>
            )}
        </div>
    );
}
