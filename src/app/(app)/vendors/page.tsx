"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { VendorsTable } from "@/components/vendors/VendorsTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTour } from "@/lib/tours/tour-provider";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function VendorsPage() {
    const { startTour } = useTour();

    return (
        <ProtectedRoute anyOf={[P.VENDOR_READ, P.VENDOR_READ_ALL]}>
            <main className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Vendors</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTour("vendors")}
                        >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Take a Tour
                        </Button>
                        <Can anyOf={[P.VENDOR_CREATE]}>
                            <Link
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                href="/vendors/new"
                            >
                                Create New Vendor
                            </Link>
                        </Can>
                    </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                    <div data-tour="vendors-list">
                        <VendorsTable />
                    </div>
                </Suspense>
            </main>
        </ProtectedRoute>
    );
}
