"use client";
import { useAuth } from "@/lib/contexts/auth-context";
import React from "react";

export default function DashboardPage() {
    const { user } = useAuth();
    console.log(user);

    return <div>Dashboard</div>;
}
