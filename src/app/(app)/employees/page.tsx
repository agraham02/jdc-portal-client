"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Can } from "@/components/auth/Can";
import { PermissionName as P } from "@/lib/constants/permission-names";
import { EmployeesTable } from "@/components/employees/EmployeesTable";
import { useTour } from "@/lib/tours/tour-provider";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";

export default function EmployeesPage() {
    const { startTour } = useTour();

    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <motion.main
                className="space-y-4"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Employees</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTour("employees")}
                        >
                            <HelpCircle className="h-4 w-4 mr-1" />
                            Take a Tour
                        </Button>
                        <Can anyOf={[P.EMPLOYEE_CREATE]}>
                            <Link
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                href="/employees/new"
                                data-tour="create-employee"
                            >
                                Create New Employee
                            </Link>
                        </Can>
                    </div>
                </div>
                <div data-tour="employees-list">
                    <EmployeesTable />
                </div>
            </motion.main>
        </ProtectedRoute>
    );
}
