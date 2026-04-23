"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
    pageTransition,
    staggerContainer,
    staggerItem,
} from "@/lib/animations";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuideCard } from "@/components/help/GuideCard";
import { useTour } from "@/lib/tours/tour-provider";
import { BookOpen, Search, Map, Sparkles, FileText } from "lucide-react";
import type { GuideMetadata } from "@/lib/guides/types";
import { useAuth } from "@/lib/contexts/auth-context";
import { getAllowedGuideRoles } from "@/lib/guides/role-mapping";
import type { Role } from "@/lib/types/auth";

interface HelpHubClientProps {
    allGuides: GuideMetadata[];
    guidesByRole: Record<string, GuideMetadata[]>;
    roleLabels: Record<string, string>;
}

export function HelpHubClient({
    allGuides,
    guidesByRole,
    roleLabels,
}: HelpHubClientProps) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const { startTour } = useTour();
    const { user } = useAuth();

    // Resolve which guide categories the current user is allowed to view based
    // on their role(s). `shared` is always included by the helper.
    const allowedRoles = useMemo(() => {
        const roleNames = ((user?.roles ?? []) as (string | Role)[]).map((r) =>
            typeof r === "string" ? r : r.name,
        );
        return new Set(getAllowedGuideRoles(roleNames));
    }, [user]);

    const visibleGuides = useMemo(
        () => allGuides.filter((g) => allowedRoles.has(g.role)),
        [allGuides, allowedRoles],
    );

    const visibleGuidesByRole = useMemo(() => {
        const out: Record<string, GuideMetadata[]> = {};
        for (const role of Object.keys(guidesByRole)) {
            if (allowedRoles.has(role as GuideMetadata["role"])) {
                out[role] = guidesByRole[role];
            }
        }
        return out;
    }, [guidesByRole, allowedRoles]);

    const filteredGuides = useMemo(() => {
        let guides = visibleGuides;

        if (activeFilter) {
            guides = guides.filter((g) => g.role === activeFilter);
        }

        if (search.trim()) {
            const query = search.toLowerCase();
            guides = guides.filter(
                (g) =>
                    g.title.toLowerCase().includes(query) ||
                    g.description.toLowerCase().includes(query) ||
                    g.tags?.some((t) => t.toLowerCase().includes(query)),
            );
        }

        return guides;
    }, [visibleGuides, search, activeFilter]);

    const roleFilters = Object.keys(visibleGuidesByRole).filter(
        (role) => visibleGuidesByRole[role].length > 0,
    );

    return (
        <ProtectedRoute requireAuth={true}>
            <motion.main
                className="space-y-8 p-6 max-w-7xl mx-auto"
                variants={pageTransition}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Help & Guides</h1>
                        <p className="text-muted-foreground mt-1">
                            Step-by-step instructions for using the JDC Portal
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    <Link href="/help/tours">
                        <Card className="group hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Map className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                                        Interactive Tours
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Guided walkthroughs of key features
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Card
                        className="group hover:shadow-md transition-all hover:border-emerald-500/30 cursor-pointer"
                        onClick={() => startTour("orientation")}
                    >
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                                    Quick Start
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    New here? Start with the basics
                                </p>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                                <FileText className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    {visibleGuides.length} Guides Available
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Covering all portal features
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Search & Filters */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search guides by title, description, or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={
                                activeFilter === null ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setActiveFilter(null)}
                        >
                            <BookOpen className="h-3 w-3 mr-1" />
                            All
                        </Button>
                        {roleFilters.map((role) => (
                            <Button
                                key={role}
                                variant={
                                    activeFilter === role
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                    setActiveFilter(
                                        activeFilter === role ? null : role,
                                    )
                                }
                            >
                                {roleLabels[role] || role}
                                <Badge
                                    variant="secondary"
                                    className="ml-1.5 px-1.5 text-xs"
                                >
                                    {visibleGuidesByRole[role].length}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Guide Cards */}
                {filteredGuides.length > 0 ? (
                    <div>
                        {activeFilter ? (
                            // Flat grid when filtered
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredGuides.map((guide) => (
                                    <motion.div
                                        key={guide.slug}
                                        variants={staggerItem}
                                    >
                                        <GuideCard guide={guide} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            // Grouped by role when showing all
                            <div className="space-y-8">
                                {roleFilters.map((role) => {
                                    const guides = search.trim()
                                        ? filteredGuides.filter(
                                              (g) => g.role === role,
                                          )
                                        : visibleGuidesByRole[role];
                                    if (guides.length === 0) return null;
                                    return (
                                        <div key={role}>
                                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                {roleLabels[role] || role}{" "}
                                                Guides
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {guides.length}
                                                </Badge>
                                            </h2>
                                            <motion.div
                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                                variants={staggerContainer}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                {guides.map((guide) => (
                                                    <motion.div
                                                        key={guide.slug}
                                                        variants={staggerItem}
                                                    >
                                                        <GuideCard
                                                            guide={guide}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <Card className="py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-1">
                                No guides found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your search or filter criteria.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </motion.main>
        </ProtectedRoute>
    );
}
