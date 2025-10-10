import { EyeOff, Eye } from "lucide-react";
import React, { useState, forwardRef } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import PasswordPolicyHints from "../auth/PasswordPolicyHints";

interface PasswordInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: React.ReactNode;
    showPasswordHint?: boolean;
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    (
        {
            placeholder,
            className,
            label,
            showPasswordHint = false,
            error,
            id,
            name,
            value,
            onChange,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);

        // Get the actual value for password hints
        const passwordValue =
            typeof value === "string" ? value : "";

        // Generate an ID for accessibility if not provided
        const inputId = id || name || "password-input";

        return (
            <div className="space-y-2">
                {label && <Label htmlFor={inputId}>{label}</Label>}
                <div className="relative">
                    <Input
                        {...props}
                        ref={ref}
                        id={inputId}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        autoComplete="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={placeholder || "Enter your password"}
                        className={className}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-pressed={showPassword}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {showPasswordHint && (
                    <PasswordPolicyHints password={passwordValue} />
                )}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
