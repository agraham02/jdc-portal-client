"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import type { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "sonner";

type FieldConfig = {
    name: string;
    label?: string;
    placeholder?: string;
    type?: string; // input type
    defaultValue?: unknown;
    required?: boolean;
};

type EntityCreateFormProps<T extends Record<string, unknown>> = {
    fields: FieldConfig[];
    // Optional grouped sections: each section has a title, optional description, and a list of fields.
    sections?: {
        title: string;
        description?: string;
        fields: FieldConfig[];
    }[];
    apiPath: string; // e.g. '/users'
    // Optional zod schema for validation
    schema?: ZodType<T> | undefined;
    // Optional transform before submit
    transform?: (values: Record<string, unknown>) => unknown;
    // Where to navigate after successful creation
    onSuccessPath?: string;
    submitLabel?: string;
};

export default function EntityCreateForm<T extends Record<string, unknown>>({
    fields,
    sections,
    apiPath,
    schema,
    transform,
    onSuccessPath,
    submitLabel = "Create",
}: EntityCreateFormProps<T>) {
    const router = useRouter();

    const resolver = schema ? zodResolver(schema as any) : undefined;

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<Record<string, unknown>>({ resolver });

    async function onSubmit(values: Record<string, unknown>) {
        try {
            const payload = transform ? transform(values) : values;
            await apiClient.post(apiPath, payload);
            toast.success("Created successfully");
            if (onSuccessPath) router.push(onSuccessPath);
        } catch (e: any) {
            // Show friendly message; apiClient will emit global events as well
            const msg = e?.message || "Failed to create";
            toast.error(msg);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* If sections provided, render each section inside a Card. Otherwise, render legacy flat fields. */}
            {sections && sections.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {sections.map((s, si) => (
                        <div key={si} className="">
                            {/* Use shadcn Card */}
                            <div className="">
                                {/* Card wrapper (using ui/card exports) */}
                                {/* We'll import locally to avoid changing module boundaries */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{s.title}</CardTitle>
                                        {s.description && (
                                            <CardDescription>
                                                {s.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {s.fields.map((f) => (
                                                <div key={f.name}>
                                                    {f.label && (
                                                        <label className="block text-sm font-medium mb-1">
                                                            {f.label}
                                                            {f.required && (
                                                                <span className="text-destructive ml-1">
                                                                    *
                                                                </span>
                                                            )}
                                                        </label>
                                                    )}
                                                    <Controller
                                                        name={f.name}
                                                        control={control}
                                                        defaultValue={
                                                            f.defaultValue ?? ""
                                                        }
                                                        render={({ field }) => {
                                                            // if this field is a phone field, render PhoneInput
                                                            const isPhone =
                                                                (f.type &&
                                                                    f.type ===
                                                                        "tel") ||
                                                                f.name
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        "phone"
                                                                    );

                                                            if (isPhone) {
                                                                return (
                                                                    <PhoneInput
                                                                        value={
                                                                            (field.value as any) ||
                                                                            undefined
                                                                        }
                                                                        onChange={(
                                                                            v
                                                                        ) =>
                                                                            field.onChange(
                                                                                v ||
                                                                                    ""
                                                                            )
                                                                        }
                                                                        placeholder={
                                                                            f.placeholder
                                                                        }
                                                                    />
                                                                );
                                                            }

                                                            const value =
                                                                field.value ===
                                                                    undefined ||
                                                                field.value ===
                                                                    null
                                                                    ? ""
                                                                    : typeof field.value ===
                                                                          "string" ||
                                                                      typeof field.value ===
                                                                          "number"
                                                                    ? field.value
                                                                    : String(
                                                                          field.value
                                                                      );
                                                            return (
                                                                <Input
                                                                    {...field}
                                                                    value={
                                                                        value as any
                                                                    }
                                                                    type={
                                                                        f.type ??
                                                                        "text"
                                                                    }
                                                                    placeholder={
                                                                        f.placeholder
                                                                    }
                                                                    aria-invalid={
                                                                        errors[
                                                                            f
                                                                                .name
                                                                        ]
                                                                            ? "true"
                                                                            : "false"
                                                                    }
                                                                />
                                                            );
                                                        }}
                                                    />
                                                    {errors[f.name] && (
                                                        <p className="text-sm text-destructive mt-1">
                                                            {
                                                                (errors as any)[
                                                                    f.name
                                                                ]?.message
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.name}>
                            {f.label && (
                                <label className="block text-sm font-medium mb-1">
                                    {f.label}
                                </label>
                            )}
                            <Controller
                                name={f.name}
                                control={control}
                                defaultValue={f.defaultValue ?? ""}
                                render={({ field }) => {
                                    const isPhone =
                                        (f.type && f.type === "tel") ||
                                        f.name.toLowerCase().includes("phone");

                                    if (isPhone) {
                                        return (
                                            <PhoneInput
                                                value={
                                                    (field.value as any) ||
                                                    undefined
                                                }
                                                onChange={(v) =>
                                                    field.onChange(v || "")
                                                }
                                                placeholder={f.placeholder}
                                            />
                                        );
                                    }

                                    // Ensure value is a supported input value type
                                    const value =
                                        field.value === undefined ||
                                        field.value === null
                                            ? ""
                                            : typeof field.value === "string" ||
                                              typeof field.value === "number"
                                            ? field.value
                                            : String(field.value);
                                    return (
                                        <Input
                                            {...field}
                                            value={value as any}
                                            type={f.type ?? "text"}
                                            placeholder={f.placeholder}
                                            aria-invalid={
                                                errors[f.name]
                                                    ? "true"
                                                    : "false"
                                            }
                                        />
                                    );
                                }}
                            />
                            {errors[f.name] && (
                                <p className="text-sm text-destructive mt-1">
                                    {(errors as any)[f.name]?.message}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting}>
                    {submitLabel}
                </Button>
                <Button variant="ghost" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
