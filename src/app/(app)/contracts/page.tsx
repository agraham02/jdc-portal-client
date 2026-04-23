"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ContractsTable } from "@/components/contracts";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useTour } from "@/lib/tours/tour-provider";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { pageTransition, staggerItem } from "@/lib/animations";

export default function ContractsPage() {
    const { startTour } = useTour();

    return (
        <ErrorBoundary>
            <ProtectedRoute anyOf={[P.CONTRACT_READ, P.CONTRACT_READ_ALL]}>
                <motion.main
                    className="container mx-auto space-y-6 py-6"
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={staggerItem}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-bold">Contracts</h1>
                            <p className="mt-2 text-muted-foreground">
                                Browse and manage available contracts
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTour("contracts")}
                        >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Take a Tour
                        </Button>
                    </motion.div>

                    <ContractsTable />
                </motion.main>
            </ProtectedRoute>
        </ErrorBoundary>
    );
}
