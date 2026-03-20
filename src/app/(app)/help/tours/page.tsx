"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTour } from "@/lib/tours/tour-provider";
import {
    isTourCompleted,
    resetAllTours,
    getCompletedTourIds,
} from "@/lib/tours/tour-storage";
import {
    ArrowLeft,
    Play,
    CheckCircle,
    RotateCcw,
    Map,
} from "lucide-react";

export default function ToursPage() {
    const { getAllTours, startTour } = useTour();
    const tours = getAllTours();
    const [completedIds, setCompletedIds] = useState<string[]>([]);

    useEffect(() => {
        setCompletedIds(getCompletedTourIds());
    }, []);

    function handleResetAll() {
        resetAllTours();
        setCompletedIds([]);
    }

    function handleStartTour(tourId: string) {
        startTour(tourId);
        // After tour completes, refresh completed state
        setTimeout(() => {
            setCompletedIds(getCompletedTourIds());
        }, 500);
    }

    return (
        <ProtectedRoute requireAuth={true}>
            <main className="space-y-6 p-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Link
                            href="/help"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Help & Guides
                        </Link>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold"
                        >
                            Interactive Tours
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Guided walkthroughs that highlight features directly
                            in the app
                        </motion.p>
                    </div>
                    {completedIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetAll}
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reset All Tours
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Map className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm">
                                    Tour Progress
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {completedIds.length} of {tours.length}{" "}
                                    tours completed
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{
                                        width: `${tours.length > 0 ? (completedIds.length / tours.length) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tour Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tours.map((tour, i) => {
                        const completed = isTourCompleted(tour.id);
                        return (
                            <motion.div
                                key={tour.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * (i + 1) }}
                            >
                                <Card
                                    className={`h-full ${completed ? "border-green-200 dark:border-green-800/50" : ""}`}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base font-semibold">
                                                {tour.title}
                                            </CardTitle>
                                            {completed && (
                                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            )}
                                        </div>
                                        {tour.roles.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {tour.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {tour.roles.length === 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs w-fit"
                                            >
                                                All Roles
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {tour.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleStartTour(tour.id)
                                                }
                                            >
                                                <Play className="h-3 w-3 mr-1" />
                                                {completed
                                                    ? "Retake Tour"
                                                    : "Start Tour"}
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {tour.steps.length} steps
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </ProtectedRoute>
    );
}
