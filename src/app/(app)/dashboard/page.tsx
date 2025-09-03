import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <main className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Procurement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/contracts"
                        >
                            Contracts
                        </Link>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/contracts/my-applications"
                            >
                                My Applications
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/hr-resources"
                            >
                                HR Resources
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>People</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/employees"
                        >
                            Employees
                        </Link>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/vendors"
                            >
                                Vendors
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/profile"
                        >
                            Profile
                        </Link>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/profile/security"
                            >
                                Security
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/profile/notifications"
                            >
                                Notification Preferences
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/profile/sessions"
                            >
                                Sessions
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/settings"
                            >
                                Settings
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Administration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Link
                            className="text-blue-600 hover:underline"
                            href="/admin/dashboard"
                        >
                            Admin Dashboard
                        </Link>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/admin/approvals"
                            >
                                Account Approvals
                            </Link>
                        </div>
                        <div>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/admin/rbac"
                            >
                                RBAC
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
