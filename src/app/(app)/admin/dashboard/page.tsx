import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionName as P } from "@/lib/constants/permission-names";
import Link from "next/link";
import { Can } from "@/components/authz/Can";

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute
            anyOf={[P.SYSTEM_ADMIN, P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}
        >
            <div className="container mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Can anyOf={[P.USER_ACTIVATE]}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Approvals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Review and approve external sign-up
                                    requests.
                                </p>
                                <Link
                                    href="/admin/approvals"
                                    className="text-blue-600 hover:underline"
                                >
                                    Go to Approvals
                                </Link>
                            </CardContent>
                        </Card>
                    </Can>

                    <Can anyOf={[P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE]}>
                        <Card>
                            <CardHeader>
                                <CardTitle>RBAC Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Manage roles, permissions, and assignments.
                                </p>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href="/admin/rbac"
                                        className="text-blue-600 hover:underline"
                                    >
                                        RBAC Home
                                    </Link>
                                    <Link
                                        href="/admin/rbac/roles"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Roles
                                    </Link>
                                    <Link
                                        href="/admin/rbac/permissions"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Permissions
                                    </Link>
                                    <Link
                                        href="/admin/rbac/users"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Users
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </Can>

                    <Can anyOf={[P.FILE_READ, P.FILE_READ_ALL]}>
                        <Card>
                            <CardHeader>
                                <CardTitle>HR Resources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Upload and manage HR and company documents.
                                </p>
                                <Link
                                    href="/hr-resources"
                                    className="text-blue-600 hover:underline"
                                >
                                    Go to HR Resources
                                </Link>
                            </CardContent>
                        </Card>
                    </Can>
                </div>
            </div>
        </ProtectedRoute>
    );
}
