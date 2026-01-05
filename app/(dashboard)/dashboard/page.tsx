"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardCalendar } from "@/components/dashboard-calendar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { DueInstance } from "@/components/dashboard-calendar/types";

export default function DashboardPage() {
    const [dueInstances, setDueInstances] = useState<DueInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const pathname = usePathname();

    const fetchDueInstances = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();
            const { data, error: fetchError } = await supabase
                .from("due_instances")
                .select(
                    `
          *,
          monthly_dues!inner (
            id,
            title,
            amount,
            category,
            notes,
            user_id
          )
        `
                )
                .eq("monthly_dues.user_id", user.id)
                .order("due_date", { ascending: true });

            if (fetchError) throw fetchError;

            setDueInstances(
                (data || []).map((row) => ({
                    ...row,
                    is_paid: !!row.is_paid,
                }))
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load data"
            );
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchDueInstances();
        }
    }, [user, fetchDueInstances]);

    // Refresh data when navigating to dashboard (e.g., after editing a due)
    useEffect(() => {
        if (pathname === "/dashboard" && user) {
            fetchDueInstances();
        }
    }, [pathname, user, fetchDueInstances]);

    // Also refresh when page becomes visible (fallback for when component doesn't remount)
    useEffect(() => {
        if (!user) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchDueInstances();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [user, fetchDueInstances]);

    if (loading) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    heading="Dashboard"
                    text="Loading your monthly dues..."
                >
                    <Link href="/dashboard/dues/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Due
                        </Button>
                    </Link>
                </DashboardHeader>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    heading="Dashboard"
                    text="There was an error loading your dues."
                >
                    <Link href="/dashboard/dues/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Due
                        </Button>
                    </Link>
                </DashboardHeader>
                <div className="flex items-center justify-center h-64 flex-col">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <Button onClick={fetchDueInstances}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Dashboard"
                text="View your monthly dues and financial insights."
            >
                <Link href="/dashboard/dues/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Due
                    </Button>
                </Link>
            </DashboardHeader>

            <DashboardCalendar
                dueInstances={dueInstances}
                onRefresh={fetchDueInstances}
            />
        </div>
    );
}
