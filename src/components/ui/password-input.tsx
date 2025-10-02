import { EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

export function PasswordInput({
    register,
    placeholder,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-hook-form register has complex internal type
    register: any;
    placeholder?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder={placeholder || "Enter your password"}
                {...register("password")}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
