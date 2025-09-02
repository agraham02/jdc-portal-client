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
        {
            title: "HR Resources",
            url: "/hr-resources",
            icon: FileText,
            anyOf: [P.FILE_READ, P.FILE_READ_ALL],
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

    admin: [
        {
            title: "Admin Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "RBAC",
            url: "/admin/rbac",
            icon: Shield,
            anyOf: [P.RBAC_ROLE_READ, P.RBAC_ROLE_MANAGE],
        },
        {
            title: "Roles",
            url: "/admin/rbac/roles",
            icon: ShieldCheck,
            anyOf: [P.RBAC_ROLE_READ],
        },
        {
            title: "Permissions",
            url: "/admin/rbac/permissions",
            icon: ShieldCheck,
            anyOf: [P.RBAC_PERMISSION_READ],
        },
        {
            title: "Users",
            url: "/admin/rbac/users",
            icon: Users,
            anyOf: [P.RBAC_USER_ASSIGN_ROLES],
        },
    ] satisfies MenuItem[],

    account: [
        { title: "Profile", url: "/profile", icon: User },
        { title: "Security", url: "/profile/security", icon: Shield },
        {
            title: "Notification Prefs",
            url: "/profile/notifications",
            icon: Bell,
        },
        { title: "Sessions", url: "/profile/sessions", icon: User },
        { title: "Settings", url: "/settings", icon: Settings },
    ] satisfies MenuItem[],
} as const;

export type MenuGroups = keyof typeof menu;
