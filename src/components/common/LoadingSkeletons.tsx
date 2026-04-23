import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, staggerItem } from "@/lib/animations";

/**
 * Loading skeleton for contract list
 */
export function ContractListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {Array.from({ length: count }).map((_, i) => (
                <motion.div key={i} variants={staggerItem}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );
}
