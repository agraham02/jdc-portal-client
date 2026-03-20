import { getAllGuides } from "@/lib/guides";
import type { GuideRole } from "@/lib/guides/types";
import { GUIDE_ROLE_LABELS } from "@/lib/guides/types";
import { HelpHubClient } from "./HelpHubClient";

// Map account types / role names to guide roles for filtering
const ROLE_TO_GUIDE_ROLES: Record<string, GuideRole[]> = {
    Admin: ["admin", "shared"],
    Management: ["management", "shared"],
    HR: ["hr", "shared"],
    "External Affairs": ["external-affairs", "shared"],
    Employee: ["employee", "shared"],
};

export default function HelpPage() {
    const allGuides = getAllGuides();

    // Group guides by role for display
    const guidesByRole = allGuides.reduce(
        (acc, guide) => {
            if (!acc[guide.role]) acc[guide.role] = [];
            acc[guide.role].push(guide);
            return acc;
        },
        {} as Record<string, typeof allGuides>
    );

    return (
        <HelpHubClient
            allGuides={allGuides}
            guidesByRole={guidesByRole}
            roleLabels={GUIDE_ROLE_LABELS}
            roleToGuideRoles={ROLE_TO_GUIDE_ROLES}
        />
    );
}
