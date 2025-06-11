"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { DuesTable } from "@/components/dues-table";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

interface MonthlyDue {
    id: string;
    user_id: string | null;
    title: string;
    amount: number;
    category: string;
    start_date: string;
    recurrence: string;
    due_day: number | null;
    status: string;
    notes: string | null;
    created_at: string;
}

export default function DuesPage() {
    const [dues, setDues] = useState<MonthlyDue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchDues();
        }
    }, [user]);

    const fetchDues = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();
            const { data, error: fetchError } = await supabase
                .from("monthly_dues")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            setDues(data || []);
        } catch (err) {
            console.error("Error fetching dues:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load dues"
            );
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    heading="Monthly Dues"
                    text="Manage your recurring monthly payments."
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
                    <Button onClick={fetchDues}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Monthly Dues"
                text="Manage your recurring monthly payments."
            >
                <Link href="/dashboard/dues/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Due
                    </Button>
                </Link>
            </DashboardHeader>

            <DuesTable dues={dues} isLoading={loading} />
        </div>
    );
}
