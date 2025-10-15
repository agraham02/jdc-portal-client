"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/lib/contexts/auth-context";
import { AuthService } from "@/lib/services/auth";
import {
    EmployeeService,
    type EmployeeWithUser,
} from "@/lib/services/employee";
import { VendorService, type VendorWithUser } from "@/lib/services/vendor";
import { apiToast } from "@/lib/utils/toast-helpers";
import {
    GeneralInfoSection,
    PasswordSection,
    AccountInfoSection,
    EmployeeSection,
    VendorSection,
    type ProfileFormData,
    type PasswordFormData,
} from "@/components/profile";

export default function ProfilePage() {
    const { user, accountType, refresh } = useAuth();

    // Fetch vendor data - only when user is a Vendor
    const { data: vendorData, isLoading: loadingVendor } = useSWR(
        accountType === "Vendor" ? "/vendors/me" : null,
        () => VendorService.getMyProfile(),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        }
    );

    // Fetch employee data - only when user is an Employee
    const { data: employeeData, isLoading: loadingEmployee } = useSWR(
        accountType === "Employee" ? "/employees/me" : null,
        () => EmployeeService.getMyProfile(),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        }
    );

    const isLoading = loadingVendor || loadingEmployee;

    const profileDefaultValues = useMemo<ProfileFormData>(
        () => ({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            contactEmail: user?.contactEmail || "",
            contactPhone: user?.contactPhone || "",
        }),
        [user]
    );

    const handleProfileSubmit = async (data: ProfileFormData) => {
        try {
            await AuthService.updateProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
            });
            apiToast.success("Profile updated successfully");
            await refresh();
        } catch (e: unknown) {
            apiToast.error("Failed to update profile", e);
            throw e;
        }
    };

    const handlePasswordSubmit = async (data: PasswordFormData) => {
        try {
            await AuthService.changePassword(data);
            apiToast.success("Password changed successfully");
        } catch (e: unknown) {
            apiToast.error("Failed to change password", e);
            throw e;
        }
    };

    const handleEmployeeUpdate = async (data: Partial<EmployeeWithUser>) => {
        if (!employeeData?._id) return;

        try {
            // Extract only the fields that match UpdateEmployeeDto
            const updateDto = {
                employeeId: data.employeeId,
                jobTitle: data.jobTitle,
                department: data.department,
                hireDate: data.hireDate
                    ? new Date(data.hireDate).toISOString()
                    : undefined,
                managerId: data.managerId,
            };

            await EmployeeService.updateEmployee(employeeData._id, updateDto);
            apiToast.success("Employee information updated");
            // Refresh will re-fetch employee data via SWR
            await refresh();
        } catch (e: unknown) {
            apiToast.error("Failed to update employee information", e);
            throw e;
        }
    };

    const handleVendorUpdate = async (data: Partial<VendorWithUser>) => {
        if (!vendorData?._id) return;

        try {
            // Extract only the fields that match UpdateVendorDto
            const updateDto = {
                companyName: data.companyName,
                website: data.website,
                contactName: data.contactName,
                servicesOffered: data.servicesOffered,
                notes: data.notes,
            };

            await VendorService.updateVendor(vendorData._id, updateDto);
            apiToast.success("Vendor information updated");
            // Refresh will re-fetch vendor data via SWR
            await refresh();
        } catch (e: unknown) {
            apiToast.error("Failed to update vendor information", e);
            throw e;
        }
    };

    if (!user) {
        return (
            <main className="max-w-5xl mx-auto p-6">
                <p className="text-muted-foreground">Loading user data...</p>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and account settings
                </p>
            </div>

            {/* General Information */}
            <GeneralInfoSection
                defaultValues={profileDefaultValues}
                physicalAddress={user.physicalAddress}
                mailingAddress={user.mailingAddress}
                onSubmit={handleProfileSubmit}
                isSubmitting={false}
            />

            {/* Employee-Specific Information */}
            {accountType === "Employee" && employeeData && !isLoading && (
                <EmployeeSection
                    employee={employeeData}
                    onUpdate={handleEmployeeUpdate}
                />
            )}

            {/* Vendor-Specific Information */}
            {accountType === "Vendor" && vendorData && !isLoading && (
                <VendorSection
                    vendor={vendorData}
                    onUpdate={handleVendorUpdate}
                />
            )}

            {/* Change Password */}
            <PasswordSection
                onSubmit={handlePasswordSubmit}
                isSubmitting={false}
            />

            {/* Account Information */}
            <AccountInfoSection user={user} />
        </main>
    );
}
