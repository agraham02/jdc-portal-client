import {
    Bell,
    Building2,
    FileText,
    Home,
    LayoutDashboard,
    Settings,
    Shield,
    ShieldCheck,
    User,
    Users,
} from "lucide-react";
import type { MenuItem } from "./types";
import { PermissionName as P } from "@/lib/constants/permission-names";

export const menu = {
    application: [
        { title: "Home", url: "/", icon: Home },
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "Notifications", url: "/notifications", icon: Bell },
    ] satisfies MenuItem[],

    procurement: [
        { title: "Contracts", url: "/contracts", icon: FileText },
        {
            title: "My Applications",
            url: "/contracts/my-applications",
            icon: FileText,
            anyOf: [P.CONTRACT_APPLY],
        },
    ] satisfies MenuItem[],

    resources: [
        {
            title: "HR Resources",
            url: "/hr-resources",
            icon: FileText,
            anyOf: [P.HR_DOCUMENT_READ],
        },
    ] satisfies MenuItem[],

    people: [
        {
            title: "Employees",
            url: "/employees",
            icon: Users,
            anyOf: [P.EMPLOYEE_READ, P.EMPLOYEE_READ_ALL],
        },
        {
            title: "Vendors",
            url: "/vendors",
            icon: Building2,
            anyOf: [P.VENDOR_READ, P.VENDOR_READ_ALL],
        },
    ] satisfies MenuItem[],

    userManagement: [
        {
            title: "Users",
            url: "/users",
            icon: Users,
            anyOf: [P.USER_READ, P.USER_READ_ALL, P.RBAC_USER_ASSIGN_ROLES],
        },
        {
            title: "Roles",
            url: "/users/roles",
            icon: Shield,
            anyOf: [
                P.RBAC_ROLE_READ,
                P.RBAC_ROLE_MANAGE,
                P.RBAC_PERMISSION_READ,
            ],
        },
    ] satisfies MenuItem[],

    account: [
        { title: "Profile", url: "/profile", icon: User },
        { title: "Settings", url: "/settings", icon: Settings },
    ] satisfies MenuItem[],
} as const;

export type MenuGroups = keyof typeof menu;
