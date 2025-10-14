"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Address } from "@/lib/types/auth";
import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

// TODO: update address form for better UI and UX

interface BaseAddressFormProps {
    /** Field title/heading */
    label?: string;
    /** Title for React Hook Form mode (alternative to label) */
    title?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    idPrefix?: string;
}

interface ControlledAddressFormProps extends BaseAddressFormProps {
    /** Controlled mode: address value */
    value?: Address;
    /** Controlled mode: change handler */
    onChange?: (address: Address) => void;
    /** Controlled mode: field-level errors */
    errors?: Partial<Record<keyof Address, string>>;
    prefix?: never;
}

interface RHFAddressFormProps extends BaseAddressFormProps {
    /** React Hook Form mode: field prefix (e.g., "physicalAddress") */
    prefix: string;
    value?: never;
    onChange?: never;
    errors?: never;
}

type AddressFormProps = ControlledAddressFormProps | RHFAddressFormProps;

/**
 * AddressForm - Universal address input component
 *
 * Supports two modes:
 * 1. **Controlled mode** - Pass `value` and `onChange` props
 * 2. **React Hook Form mode** - Pass `prefix` prop and wrap in FormProvider
 *
 * Features:
 * - All address fields: line1, line2 (optional), city, state, zip
 * - Field-level validation errors
 * - Consistent styling
 * - Dark mode support
 *
 * Usage (Controlled):
 * ```tsx
 * <AddressForm
 *   label="Physical Address"
 *   value={physicalAddress}
 *   onChange={setPhysicalAddress}
 *   errors={errors}
 *   required
 * />
 * ```
 *
 * Usage (React Hook Form):
 * ```tsx
 * <FormProvider {...methods}>
 *   <AddressForm
 *     prefix="physicalAddress"
 *     title="Physical Address"
 *     required
 *   />
 * </FormProvider>
 * ```
 */
/**
 * Internal component for React Hook Form mode
 */
function RHFAddressFields({
    prefix,
    label,
    title,
    disabled = false,
    required = false,
    className,
    idPrefix,
}: RHFAddressFormProps) {
    const { register, formState } = useFormContext();
    const actualIdPrefix = idPrefix || prefix;
    const displayLabel = label || title;

    const getFieldName = (field: string) => `${prefix}.${field}`;

    const getError = (field: string) => {
        const fieldPath = getFieldName(field);
        let result: unknown = formState?.errors;
        for (const key of fieldPath.split(".")) {
            if (result && typeof result === "object" && key in result) {
                result = (result as Record<string, unknown>)[key];
            } else {
                return undefined;
            }
        }
        return (result as { message?: string })?.message;
    };

    return (
        <AddressFieldsLayout
            idPrefix={actualIdPrefix}
            displayLabel={displayLabel}
            required={required}
            className={className}
            getError={getError}
            renderField={(field, fieldId, placeholder) => (
                <Input
                    id={fieldId}
                    {...register(getFieldName(field))}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={field === "state" ? 2 : undefined}
                    className={cn(
                        getError(field) &&
                            "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!getError(field)}
                    aria-describedby={
                        getError(field) ? `${fieldId}-error` : undefined
                    }
                />
            )}
        />
    );
}

/**
 * Internal component for Controlled mode
 */
function ControlledAddressFields({
    value = { line1: "", line2: "", city: "", state: "", zip: "" },
    onChange,
    label,
    title,
    disabled = false,
    required = false,
    errors = {},
    className,
    idPrefix,
}: ControlledAddressFormProps) {
    const actualIdPrefix = idPrefix || "address";
    const displayLabel = label || title;

    const handleChange = (field: keyof Address, fieldValue: string) => {
        onChange?.({ ...value, [field]: fieldValue });
    };

    const getError = (field: string) => errors?.[field as keyof Address];

    return (
        <AddressFieldsLayout
            idPrefix={actualIdPrefix}
            displayLabel={displayLabel}
            required={required}
            className={className}
            getError={getError}
            renderField={(field, fieldId, placeholder) => (
                <Input
                    id={fieldId}
                    value={value[field as keyof Address] || ""}
                    onChange={(e) =>
                        handleChange(field as keyof Address, e.target.value)
                    }
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={field === "state" ? 2 : undefined}
                    className={cn(
                        getError(field) &&
                            "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={!!getError(field)}
                    aria-describedby={
                        getError(field) ? `${fieldId}-error` : undefined
                    }
                />
            )}
        />
    );
}

/**
 * Shared layout component for address fields
 */
function AddressFieldsLayout({
    idPrefix,
    displayLabel,
    required,
    className,
    getError,
    renderField,
}: {
    idPrefix: string;
    displayLabel?: string;
    required: boolean;
    className?: string;
    getError: (field: string) => string | undefined;
    renderField: (
        field: string,
        fieldId: string,
        placeholder: string
    ) => ReactNode;
}) {
    return (
        <div className={cn("space-y-4", className)}>
            {displayLabel && (
                <h3 className="text-sm font-medium">
                    {displayLabel}
                    {required && (
                        <span className="text-destructive ml-1">*</span>
                    )}
                </h3>
            )}

            <div className="grid grid-cols-1 gap-4">
                {/* Address Line 1 */}
                <div>
                    <Label htmlFor={`${idPrefix}-line1`}>
                        Address Line 1
                        {required && (
                            <span className="text-destructive ml-1">*</span>
                        )}
                    </Label>
                    {renderField("line1", `${idPrefix}-line1`, "123 Main St")}
                    {getError("line1") && (
                        <p
                            id={`${idPrefix}-line1-error`}
                            className="text-sm text-destructive mt-1"
                        >
                            {getError("line1")}
                        </p>
                    )}
                </div>

                {/* Address Line 2 (Optional) */}
                <div>
                    <Label htmlFor={`${idPrefix}-line2`}>
                        Address Line 2{" "}
                        <span className="text-muted-foreground">
                            (Optional)
                        </span>
                    </Label>
                    {renderField(
                        "line2",
                        `${idPrefix}-line2`,
                        "Apt, Suite, Unit, etc."
                    )}
                    {getError("line2") && (
                        <p
                            id={`${idPrefix}-line2-error`}
                            className="text-sm text-destructive mt-1"
                        >
                            {getError("line2")}
                        </p>
                    )}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor={`${idPrefix}-city`}>
                            City
                            {required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        {renderField("city", `${idPrefix}-city`, "Springfield")}
                        {getError("city") && (
                            <p
                                id={`${idPrefix}-city-error`}
                                className="text-sm text-destructive mt-1"
                            >
                                {getError("city")}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor={`${idPrefix}-state`}>
                            State
                            {required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        {renderField("state", `${idPrefix}-state`, "IL")}
                        {getError("state") && (
                            <p
                                id={`${idPrefix}-state-error`}
                                className="text-sm text-destructive mt-1"
                            >
                                {getError("state")}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor={`${idPrefix}-zip`}>
                            ZIP Code
                            {required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        {renderField("zip", `${idPrefix}-zip`, "62704")}
                        {getError("zip") && (
                            <p
                                id={`${idPrefix}-zip-error`}
                                className="text-sm text-destructive mt-1"
                            >
                                {getError("zip")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AddressForm(props: AddressFormProps) {
    // Use discriminated union to determine which component to render
    if ("prefix" in props && props.prefix) {
        return <RHFAddressFields {...(props as RHFAddressFormProps)} />;
    } else {
        return (
            <ControlledAddressFields
                {...(props as ControlledAddressFormProps)}
            />
        );
    }
}
