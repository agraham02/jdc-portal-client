import { RoleName } from "@/lib/types/auth";
import type { GuideRole } from "./types";

/**
 * Maps an application RoleName to the set of guide categories that role is
 * allowed to view. `shared` (General) guides are visible to every authenticated
 * user and are appended automatically by `getAllowedGuideRoles`.
 *
 * Admin sees every category since they may need to assist any user.
 */
const ROLE_TO_GUIDE_ROLES: Record<RoleName, GuideRole[]> = {
    [RoleName.ADMIN]: [
        "admin",
        "management",
        "hr",
        "external-affairs",
        "employee",
        "shared",
    ],
    [RoleName.MANAGEMENT]: ["management", "shared"],
    [RoleName.HR]: ["hr", "shared"],
    [RoleName.EXTERNAL_AFFAIRS]: ["external-affairs", "shared"],
    [RoleName.EMPLOYEE]: ["employee", "shared"],
    [RoleName.VENDOR]: ["shared"],
};

/**
 * Returns the union of guide roles a user with the given role names may view.
 * Always includes `"shared"`. Unknown role names are ignored; if no roles
 * resolve to a mapping, falls back to `["shared"]`.
 */
export function getAllowedGuideRoles(roleNames: string[]): GuideRole[] {
    const allowed = new Set<GuideRole>(["shared"]);
    for (const name of roleNames) {
        const mapped = ROLE_TO_GUIDE_ROLES[name as RoleName];
        if (!mapped) continue;
        for (const r of mapped) allowed.add(r);
    }
    return Array.from(allowed);
}
