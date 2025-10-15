"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmployeeService } from "@/lib/services/employee";
import {
    CheckCircle2,
    Loader2,
    AlertCircle,
    UserCircle,
    Mail,
    Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeOnboardingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        contactPhone: "",
        contactEmail: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generalError, setGeneralError] = useState("");

    useEffect(() => {
        if (!token) {
            setGeneralError(
                "Invalid activation link. Please contact your administrator."
            );
        }
    }, [token]);

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 12) {
            newErrors.password = "Password must be at least 12 characters";
        } else {
            // Check password strength
            const hasUpperCase = /[A-Z]/.test(formData.password);
            const hasLowerCase = /[a-z]/.test(formData.password);
            const hasNumbers = /\d/.test(formData.password);
            const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);

            if (
                !hasUpperCase ||
                !hasLowerCase ||
                !hasNumbers ||
                !hasSpecialChar
            ) {
                newErrors.password =
                    "Password must contain uppercase, lowercase, numbers, and special characters";
            }
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Optional phone validation
        if (
            formData.contactPhone &&
            !/^\+[1-9]\d{1,14}$/.test(formData.contactPhone)
        ) {
            newErrors.contactPhone = "Phone must be in format +1234567890";
        }

        // Optional email validation
        if (
            formData.contactEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
        ) {
            newErrors.contactEmail = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setGeneralError("");

        if (!token) {
            setGeneralError("Invalid activation token");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await EmployeeService.completeOnboarding({
                activationToken: token,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password,
                contactPhone: formData.contactPhone.trim() || undefined,
                contactEmail: formData.contactEmail.trim() || undefined,
            });

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to complete onboarding. Please try again.";
            setGeneralError(message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleChange(field: keyof typeof formData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <Card className="border-green-200 dark:border-green-900 shadow-lg">
                        <CardHeader className="text-center space-y-4 pb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 200,
                                }}
                                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                            >
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </motion.div>
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                    Welcome Aboard!
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Your account has been activated
                                    successfully.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center pb-8">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                    Redirecting you to the login page...
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl border-gray-200 dark:border-gray-800">
                    <CardHeader className="text-center space-y-3 pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 200,
                            }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                        >
                            <UserCircle className="h-9 w-9 text-white" />
                        </motion.div>
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                Complete Your Profile
                            </CardTitle>
                            <CardDescription className="text-sm mt-2">
                                {token
                                    ? "Just a few details to get you started."
                                    : "Loading your invitation..."}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <AnimatePresence mode="wait">
                            {generalError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Alert
                                        variant="destructive"
                                        className="mb-4"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {generalError}
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                                    <UserCircle className="h-4 w-4" />
                                    <span>Personal Information</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="firstName"
                                            className="text-sm font-medium"
                                        >
                                            First Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                handleChange(
                                                    "firstName",
                                                    e.target.value
                                                )
                                            }
                                            disabled={isLoading || !token}
                                            required
                                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <AnimatePresence>
                                            {errors.firstName && (
                                                <motion.p
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    className="text-xs text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.firstName}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="lastName"
                                            className="text-sm font-medium"
                                        >
                                            Last Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                handleChange(
                                                    "lastName",
                                                    e.target.value
                                                )
                                            }
                                            disabled={isLoading || !token}
                                            required
                                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <AnimatePresence>
                                            {errors.lastName && (
                                                <motion.p
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    className="text-xs text-red-500 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.lastName}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleChange(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        disabled={isLoading || !token}
                                        required
                                        showPasswordHint={true}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {errors.password && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xs text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.password}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="text-sm font-medium"
                                    >
                                        Confirm Password{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <PasswordInput
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            handleChange(
                                                "confirmPassword",
                                                e.target.value
                                            )
                                        }
                                        disabled={isLoading || !token}
                                        required
                                        showPasswordHint={false}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {errors.confirmPassword && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xs text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.confirmPassword}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                                    <Mail className="h-4 w-4" />
                                    <span>Contact Information</span>
                                    <span className="text-xs font-normal text-muted-foreground ml-auto">
                                        (Optional)
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="contactPhone"
                                        className="text-sm font-medium flex items-center gap-2"
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        Contact Phone
                                    </Label>
                                    <PhoneInput
                                        value={formData.contactPhone}
                                        onChange={(value) =>
                                            handleChange(
                                                "contactPhone",
                                                value || ""
                                            )
                                        }
                                        disabled={isLoading || !token}
                                        defaultCountry="US"
                                        className="transition-all duration-200"
                                    />
                                    <AnimatePresence>
                                        {errors.contactPhone && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xs text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.contactPhone}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <p className="text-xs text-muted-foreground">
                                        We&apos;ll use this for important
                                        account notifications
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="contactEmail"
                                        className="text-sm font-medium flex items-center gap-2"
                                    >
                                        <Mail className="h-3.5 w-3.5" />
                                        Personal Email
                                    </Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) =>
                                            handleChange(
                                                "contactEmail",
                                                e.target.value
                                            )
                                        }
                                        disabled={isLoading || !token}
                                        placeholder="personal@example.com"
                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <AnimatePresence>
                                        {errors.contactEmail && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-xs text-red-500 flex items-center gap-1"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.contactEmail}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <p className="text-xs text-muted-foreground">
                                        For account recovery and important
                                        notifications
                                    </p>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isLoading || !token}
                                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Activating Your Account...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Activate Account
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-muted-foreground mt-4"
                >
                    Your invitation link expires in 7 days
                </motion.p>
            </motion.div>
        </div>
    );
}
