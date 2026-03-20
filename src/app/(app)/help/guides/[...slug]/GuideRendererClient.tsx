"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Printer,
    ArrowLeft,
    Clock,
} from "lucide-react";
import type { Guide, GuideMetadata } from "@/lib/guides/types";
import { GUIDE_ROLE_COLORS, GUIDE_ROLE_LABELS } from "@/lib/guides/types";

interface GuideRendererClientProps {
    guide: Pick<Guide, "title" | "description" | "role" | "estimatedMinutes" | "tags">;
    prev: GuideMetadata | null;
    next: GuideMetadata | null;
    mdxContent: ReactNode;
}

export function GuideRendererClient({
    guide,
    prev,
    next,
    mdxContent,
}: GuideRendererClientProps) {
    return (
        <ProtectedRoute requireAuth={true}>
            <main className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Breadcrumb & Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between print:hidden"
                >
                    <Link
                        href="/help"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Help & Guides
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`text-xs ${GUIDE_ROLE_COLORS[guide.role]}`}
                        >
                            {GUIDE_ROLE_LABELS[guide.role]}
                        </Badge>
                        {guide.estimatedMinutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {guide.estimatedMinutes} min read
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {guide.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {guide.description}
                    </p>
                    {guide.tags && guide.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {guide.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </motion.header>

                <hr className="print:hidden" />

                {/* MDX Content */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-neutral dark:prose-invert max-w-none"
                >
                    {mdxContent}
                </motion.article>

                <hr className="print:hidden" />

                {/* Prev/Next Navigation */}
                <motion.nav
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between print:hidden"
                >
                    {prev ? (
                        <Link href={`/help/guides/${prev.slug}`}>
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                {prev.title}
                            </Button>
                        </Link>
                    ) : (
                        <div />
                    )}
                    {next ? (
                        <Link href={`/help/guides/${next.slug}`}>
                            <Button variant="ghost" size="sm">
                                {next.title}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    ) : (
                        <div />
                    )}
                </motion.nav>
            </main>
        </ProtectedRoute>
    );
}
