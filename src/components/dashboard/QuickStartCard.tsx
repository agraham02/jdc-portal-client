"use client";

import { HelpCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseDashboardCard } from "./BaseDashboardCard";
import { useTour } from "@/lib/tours/tour-provider";
import { isTourCompleted } from "@/lib/tours/tour-storage";

export function QuickStartCard() {
    const { startTour } = useTour();
    const completed = isTourCompleted("orientation");

    if (completed) {
        return null;
    }

    return (
        <BaseDashboardCard title="Quick Start">
            <div className="flex flex-col items-center justify-center py-4 text-center">
                <HelpCircle className="mb-3 h-12 w-12 text-primary/60" />
                <p className="font-medium">New to the portal?</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Take a quick tour to learn where everything is.
                </p>
                <Button
                    size="sm"
                    onClick={() => startTour("orientation")}
                    data-tour="quick-start"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Start Tour
                </Button>
            </div>
        </BaseDashboardCard>
    );
}
