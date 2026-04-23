"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import type { GuideMetadata } from "@/lib/guides/types";
import { GUIDE_ROLE_COLORS, GUIDE_ROLE_LABELS } from "@/lib/guides/types";

interface GuideCardProps {
    guide: GuideMetadata;
}

export function GuideCard({ guide }: GuideCardProps) {
    return (
        <Link href={`/help/guides/${guide.slug}`}>
            <Card className="group h-full hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                            {guide.title}
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Badge
                        variant="outline"
                        className={`w-fit text-xs ${GUIDE_ROLE_COLORS[guide.role]}`}
                    >
                        {GUIDE_ROLE_LABELS[guide.role]}
                    </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {guide.description}
                    </p>
                    {guide.estimatedMinutes && (
                        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{guide.estimatedMinutes} min read</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
