import Link from "next/link";
import { motion } from "motion/react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pageTransition } from "@/lib/animations";

export function AccessDenied() {
    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            className="min-h-screen flex items-center justify-center p-4"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-destructive" />
                    </div>
                    <CardTitle className="text-destructive">
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        You don&apos;t have permission to access this page.
                        Please contact your administrator if you believe this is
                        an error.
                    </p>
                    <div className="flex gap-2">
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
