"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Building2, AlertCircle } from "lucide-react";

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

import { LoginFormData, loginSchema } from "@/lib/validations";
import { useAuth } from "@/lib/contexts/auth-context";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const user = await login(data);

            if (!user) {
                throw new Error("Invalid email or password");
            }
            router.push("/dashboard");
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
                setError(error.message || "Login failed. Please try again.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Demo credential autofill handler
    const autofill = (email: string, password: string) => {
        // react-hook-form's setValue
        setValue("email", email);
        setValue("password", password);
    };

    return (
        <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                            <Building2 className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in to your JDC Portal account
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}{" "}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        {" "}
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your password"
                                            {...register("password")}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-destructive">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href="/register"
                                        className="text-primary hover:underline"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Demo Credentials - Only show in development */}
                    {process.env.NODE_ENV === "development" && (
                        <Card className="mt-4 border-dashed">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">
                                    Demo Credentials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        className="p-2 bg-muted/50 rounded w-full text-left hover:bg-muted transition"
                                        onClick={() =>
                                            autofill(
                                                "admin.test@jdc.com",
                                                "Admin123!"
                                            )
                                        }
                                    >
                                        <p className="font-medium">Admin</p>
                                        <p className="text-muted-foreground">
                                            admin.test@jdc.com
                                        </p>
                                        <p className="text-muted-foreground">
                                            Admin123!
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 bg-muted/50 rounded w-full text-left hover:bg-muted transition"
                                        onClick={() =>
                                            autofill(
                                                "employee@jdc.com",
                                                "Password123!"
                                            )
                                        }
                                    >
                                        <p className="font-medium">Employee</p>
                                        <p className="text-muted-foreground">
                                            employee@jdc.com
                                        </p>
                                        <p className="text-muted-foreground">
                                            Password123!
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        className="p-2 bg-muted/50 rounded w-full text-left hover:bg-muted transition"
                                        onClick={() =>
                                            autofill(
                                                "vendor@example.com",
                                                "Password123!"
                                            )
                                        }
                                    >
                                        <p className="font-medium">Vendor</p>
                                        <p className="text-muted-foreground">
                                            vendor@example.com
                                        </p>
                                        <p className="text-muted-foreground">
                                            Password123!
                                        </p>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </PublicRoute>
    );
}
