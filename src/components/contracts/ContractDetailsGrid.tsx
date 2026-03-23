"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contract } from "@/lib/types/contracts";
import { formatCurrency } from "@/lib/utils/formatters";
import { format } from "date-fns";
import {
    DollarSignIcon,
    CalendarIcon,
    ClockIcon,
    FileTextIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ContractDetailsGridProps {
    contract: Contract;
}

export function ContractDetailsGrid({ contract }: ContractDetailsGridProps) {
    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* Budget */}
            {contract.budget !== undefined && contract.budget > 0 && (
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                                Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(contract.budget)}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Open Date */}
            {contract.openedAt && (
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Opened Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {format(new Date(contract.openedAt), "PPP")}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Deadline */}
            {contract.deadline && (
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                Deadline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {format(new Date(contract.deadline), "PPP")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(contract.deadline), "p")}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Awarded Vendor */}
            {contract.awardedToVendorId && (
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                Awarded Vendor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {contract.awardedVendor?.companyName ||
                                    `Vendor ID: ${contract.awardedToVendorId}`}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Award Date */}
            {contract.awardedAt && (
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Award Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {format(new Date(contract.awardedAt), "PPP")}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
