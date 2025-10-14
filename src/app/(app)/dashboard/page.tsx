import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";

// TODO: improve dashboard
// It is currently generic and outdated. It should show relevant info and quick links based on the account type / permissions
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
                        <Can anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/contracts"
                            >
                                Contracts
                            </Link>
                        </Can>
                        <div>
                            <Can anyOf={[P.CONTRACT_APPLY]}>
                                <Link
                                    className="text-blue-600 hover:underline"
                                    href="/contracts/my-applications"
                                >
                                    My Applications
                                </Link>
                            </Can>
                        </div>
                        <div>
                            <Can anyOf={[P.FILE_READ, P.FILE_READ_ALL]}>
                                <Link
                                    className="text-blue-600 hover:underline"
                                    href="/hr-resources"
                                >
                                    HR Resources
                                </Link>
                            </Can>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>People</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Can anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/employees"
                            >
                                Employees
                            </Link>
                        </Can>
                        <div>
                            <Can anyOf={[P.VENDOR_READ, P.VENDOR_READ_ALL]}>
                                <Link
                                    className="text-blue-600 hover:underline"
                                    href="/vendors"
                                >
                                    Vendors
                                </Link>
                            </Can>
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
                        <Can
                            anyOf={[
                                P.SYSTEM_ADMIN,
                                P.RBAC_ROLE_READ,
                                P.RBAC_ROLE_MANAGE,
                            ]}
                        >
                            <Link
                                className="text-blue-600 hover:underline"
                                href="/admin/dashboard"
                            >
                                Admin Dashboard
                            </Link>
                        </Can>
                        <div>
                            <Can anyOf={[P.USER_ACTIVATE]}>
                                <Link
                                    className="text-blue-600 hover:underline"
                                    href="/admin/approvals"
                                >
                                    Account Approvals
                                </Link>
                            </Can>
                        </div>
                        <div>
                            <Can anyOf={[P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}>
                                <Link
                                    className="text-blue-600 hover:underline"
                                    href="/admin/rbac"
                                >
                                    RBAC
                                </Link>
                            </Can>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
