"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityDetail from "@/components/common/EntityDetail";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";

interface Params {
    id: string;
}
export default function EmployeeDetailsPage({ params }: { params: Params }) {
    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL]}>
            <motion.main
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                <EntityDetail
                    entityType="employee"
                    id={params.id}
                    canUpdate={true}
                />
            </motion.main>
        </ProtectedRoute>
    );
}
