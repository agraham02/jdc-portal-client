import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleName } from "@/lib/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, FileText, ClipboardList, Search } from "lucide-react";
import Link from "next/link";

export default function VendorDashboardPage() {
    return (
        <ProtectedRoute requiredRoles={RoleName.VENDOR}>
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome to your vendor portal. Manage contracts and
                        track your applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Search className="w-5 h-5 mr-2 text-blue-600" />
                                Browse Contracts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Find and apply for new contract opportunities.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/contracts">
                                    View Available Contracts
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ClipboardList className="w-5 h-5 mr-2 text-green-600" />
                                My Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Track the status of your submitted applications.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href="/contracts/my-applications">
                                    View Applications
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="w-5 h-5 mr-2 text-purple-600" />
                                Company Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                Update your company information and
                                capabilities.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link href="/settings">Edit Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                        Getting Started
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Ready to start bidding on contracts? Make sure your
                        company profile is complete and browse available
                        opportunities.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" asChild>
                            <Link href="/contracts">
                                <FileText className="w-4 h-4 mr-2" />
                                Browse Contracts
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/settings">
                                <Building className="w-4 h-4 mr-2" />
                                Complete Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
