"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionName as P } from "@/lib/constants/permission-names";
import EntityCreateForm from "@/components/common/EntityCreateForm";
import { motion } from "motion/react";
import { pageTransition } from "@/lib/animations";

/**
 * Employee invitation page.
 * Admin provides email and optional HR fields. Employee receives activation email
 * and completes their profile at /onboarding?token=xxx
 */
export default function EmployeeInvitePage() {
    const sections = [
        {
            title: "Employee Invitation",
            description:
                "Enter email address and optional HR information. The employee will receive an activation email to complete their profile.",
            fields: [
                {
                    name: "email",
                    label: "Work Email",
                    placeholder: "employee@company.com",
                    type: "email",
                    required: true,
                },
            ],
        },
        {
            title: "HR Information (Optional)",
            description:
                "Additional employee details. These can be updated later.",
            fields: [
                {
                    name: "employeeId",
                    label: "Employee ID",
                    placeholder: "E12345",
                },
                {
                    name: "jobTitle",
                    label: "Job Title",
                    placeholder: "Software Engineer",
                },
                {
                    name: "department",
                    label: "Department",
                    placeholder: "Engineering",
                },
                {
                    name: "hireDate",
                    label: "Hire Date",
                    placeholder: "YYYY-MM-DD",
                    type: "date",
                },
                {
                    name: "managerId",
                    label: "Manager ID (Optional)",
                    placeholder: "507f1f77bcf86cd799439011",
                },
            ],
        },
    ];

    return (
        <ProtectedRoute anyOf={[P.EMPLOYEE_CREATE]}>
            <motion.main
                className="space-y-4"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                <div data-tour="invite-employee-header">
                    <h1 className="text-2xl font-semibold">
                        Invite New Employee
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Send an activation email to a new employee. They&apos;ll
                        complete their profile and set their password.
                    </p>
                </div>
                <div data-tour="invite-employee-form">
                    <EntityCreateForm
                        sections={sections}
                        fields={[]}
                        apiPath="/employees"
                        onSuccessPath="/employees"
                        submitLabel="Send Invitation"
                    />
                </div>
            </motion.main>
        </ProtectedRoute>
    );
}
