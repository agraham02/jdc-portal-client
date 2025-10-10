import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

export default function Page() {
    return (
        <ProtectedRoute anyOf={[P.USER_READ, P.USER_READ_ALL]}>
            <div className="container py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/users">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            User Management
                        </CardTitle>
                        <CardDescription>
                            User approvals are managed through entity-specific
                            pages
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            To approve or manage user accounts, please navigate
                            to the appropriate entity-specific page:
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link href="/vendors">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    Manage Vendors
                                </Button>
                            </Link>
                            <Link href="/employees">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    Manage Employees
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            The Users page is for viewing all users across the
                            system. Approval workflows are handled on the
                            Vendors and Employees pages respectively.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
