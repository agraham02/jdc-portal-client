"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressFormProps {
    prefix: string;
    title: string;
    required?: boolean;
}

export function AddressForm({
    prefix,
    title,
    required = false,
}: AddressFormProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const getFieldName = (field: string) => `${prefix}.${field}`;
    const getError = (field: string) => {
        const fieldPath = getFieldName(field);
        // Navigate through the nested error object structure
        let result: unknown = errors;
        for (const key of fieldPath.split(".")) {
            if (result && typeof result === "object" && key in result) {
                result = (result as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        return result as { message?: string } | undefined;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{title}</h3>
                {required && <span className="text-red-500">*</span>}
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor={getFieldName("line1")}>
                        Address Line 1{" "}
                        {required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                        id={getFieldName("line1")}
                        {...register(getFieldName("line1"))}
                        placeholder="123 Main Street"
                    />
                    {getError("line1") && (
                        <p className="text-red-500 text-sm mt-1">
                            {getError("line1")?.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor={getFieldName("line2")}>
                        Address Line 2
                    </Label>
                    <Input
                        id={getFieldName("line2")}
                        {...register(getFieldName("line2"))}
                        placeholder="Apartment, suite, etc. (optional)"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor={getFieldName("city")}>
                            City{" "}
                            {required && (
                                <span className="text-red-500">*</span>
                            )}
                        </Label>
                        <Input
                            id={getFieldName("city")}
                            {...register(getFieldName("city"))}
                            placeholder="Springfield"
                        />
                        {getError("city") && (
                            <p className="text-red-500 text-sm mt-1">
                                {getError("city")?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor={getFieldName("state")}>
                            State{" "}
                            {required && (
                                <span className="text-red-500">*</span>
                            )}
                        </Label>
                        <Input
                            id={getFieldName("state")}
                            {...register(getFieldName("state"))}
                            placeholder="IL"
                            maxLength={2}
                        />
                        {getError("state") && (
                            <p className="text-red-500 text-sm mt-1">
                                {getError("state")?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor={getFieldName("zip")}>
                            ZIP Code{" "}
                            {required && (
                                <span className="text-red-500">*</span>
                            )}
                        </Label>
                        <Input
                            id={getFieldName("zip")}
                            {...register(getFieldName("zip"))}
                            placeholder="62704"
                        />
                        {getError("zip") && (
                            <p className="text-red-500 text-sm mt-1">
                                {getError("zip")?.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
