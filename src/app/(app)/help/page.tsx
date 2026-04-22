import { getAllGuides } from "@/lib/guides";
import { GUIDE_ROLE_LABELS } from "@/lib/guides/types";
import { HelpHubClient } from "./HelpHubClient";

export default function HelpPage() {
    const allGuides = getAllGuides();

    // Group guides by guide-role for display. Per-user filtering is applied
    // client-side in HelpHubClient using the authenticated user's roles.
    const guidesByRole = allGuides.reduce(
        (acc, guide) => {
            if (!acc[guide.role]) acc[guide.role] = [];
            acc[guide.role].push(guide);
            return acc;
        },
        {} as Record<string, typeof allGuides>,
    );

    return (
        <HelpHubClient
            allGuides={allGuides}
            guidesByRole={guidesByRole}
            roleLabels={GUIDE_ROLE_LABELS}
        />
    );
}
