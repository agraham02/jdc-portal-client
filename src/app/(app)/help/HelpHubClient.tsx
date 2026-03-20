"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuideCard } from "@/components/help/GuideCard";
import {
    BookOpen,
    Search,
    Map,
    Sparkles,
    FileText,
} from "lucide-react";
import type { GuideMetadata, GuideRole } from "@/lib/guides/types";

interface HelpHubClientProps {
    allGuides: GuideMetadata[];
    guidesByRole: Record<string, GuideMetadata[]>;
    roleLabels: Record<string, string>;
    roleToGuideRoles: Record<string, GuideRole[]>;
}

export function HelpHubClient({
    allGuides,
    guidesByRole,
    roleLabels,
}: HelpHubClientProps) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filteredGuides = useMemo(() => {
        let guides = allGuides;

        if (activeFilter) {
            guides = guides.filter((g) => g.role === activeFilter);
        }

        if (search.trim()) {
            const query = search.toLowerCase();
            guides = guides.filter(
                (g) =>
                    g.title.toLowerCase().includes(query) ||
                    g.description.toLowerCase().includes(query) ||
                    g.tags?.some((t) => t.toLowerCase().includes(query))
            );
        }

        return guides;
    }, [allGuides, search, activeFilter]);

    const roleFilters = Object.keys(guidesByRole).filter(
        (role) => guidesByRole[role].length > 0
    );

    return (
        <ProtectedRoute requireAuth={true}>
            <main className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            Help & Guides
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Step-by-step instructions for using the JDC Portal
                        </motion.p>
                    </div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
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

                    <Card className="border-dashed">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <Sparkles className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    Quick Start
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    New here? Start with the basics
                                </p>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="border-dashed">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    {allGuides.length} Guides Available
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Covering all portal features
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
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
                                        activeFilter === role ? null : role
                                    )
                                }
                            >
                                {roleLabels[role] || role}
                                <Badge
                                    variant="secondary"
                                    className="ml-1.5 px-1.5 text-xs"
                                >
                                    {guidesByRole[role].length}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {/* Guide Cards */}
                {filteredGuides.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                    >
                        {activeFilter ? (
                            // Flat grid when filtered
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredGuides.map((guide, i) => (
                                    <motion.div
                                        key={guide.slug}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                    >
                                        <GuideCard guide={guide} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // Grouped by role when showing all
                            <div className="space-y-8">
                                {roleFilters.map((role) => {
                                    const guides = search.trim()
                                        ? filteredGuides.filter(
                                              (g) => g.role === role
                                          )
                                        : guidesByRole[role];
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {guides.map((guide, i) => (
                                                    <motion.div
                                                        key={guide.slug}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            delay: 0.05 * i,
                                                        }}
                                                    >
                                                        <GuideCard
                                                            guide={guide}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
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
            </main>
        </ProtectedRoute>
    );
}
