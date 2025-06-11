"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { DueForm } from "@/components/due-form";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";

export default function NewDuePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();
    const { user } = useAuth();

    const handleSubmit = async (formData: any) => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please log in to create a due.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // First, create the monthly due
            const { data: monthlyDue, error: monthlyDueError } = await supabase
                .from("monthly_dues")
                .insert({
                    user_id: user.id,
                    title: formData.title,
                    amount: formData.amount,
                    category: formData.category,
                    start_date: formData.start_date,
                    recurrence: formData.recurrence,
                    recurrence_frequency: formData.recurrence_frequency,
                    due_day: formData.due_day,
                    status: formData.status,
                    notes: formData.notes,
                    end_type: formData.end_type,
                    end_date: formData.end_date,
                    occurrences: formData.occurrences,
                })
                .select()
                .single();

            if (monthlyDueError) {
                throw monthlyDueError;
            }

            // Generate due instances based on recurrence settings
            const dueInstances = [];
            const startDate = new Date(formData.start_date);
            const currentDate = new Date(startDate);
            let instanceCount = 0;
            const maxInstances =
                formData.end_type === "after_occurrences"
                    ? Number.parseInt(formData.occurrences)
                    : 100; // Limit to 100 instances for "never" end type
            const endDate =
                formData.end_type === "after_date"
                    ? new Date(formData.end_date)
                    : new Date(9999, 11, 31); // Far future date for "never" end type

            // Get frequency as number
            const frequency = Number.parseInt(formData.recurrence_frequency);

            while (instanceCount < maxInstances && currentDate <= endDate) {
                // Set the due day if specified
                let dueDate = new Date(currentDate);
                if (formData.due_day) {
                    dueDate.setDate(Number.parseInt(formData.due_day));

                    // Handle cases where the due day is invalid for the month
                    const month = dueDate.getMonth();
                    dueDate.setDate(Number.parseInt(formData.due_day));
                    if (dueDate.getMonth() !== month) {
                        // Set to last day of previous month
                        dueDate = new Date(
                            dueDate.getFullYear(),
                            dueDate.getMonth(),
                            0
                        );
                    }
                }

                dueInstances.push({
                    monthly_due_id: monthlyDue.id,
                    due_date: dueDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
                    is_paid: false,
                });

                instanceCount++;

                // Calculate next date based on recurrence
                switch (formData.recurrence) {
                    case "weekly":
                        currentDate.setDate(
                            currentDate.getDate() + 7 * frequency
                        );
                        break;
                    case "biweekly":
                        currentDate.setDate(
                            currentDate.getDate() + 14 * frequency
                        );
                        break;
                    case "monthly":
                        currentDate.setMonth(
                            currentDate.getMonth() + frequency
                        );
                        break;
                    case "quarterly":
                        currentDate.setMonth(
                            currentDate.getMonth() + 3 * frequency
                        );
                        break;
                    case "annually":
                        currentDate.setFullYear(
                            currentDate.getFullYear() + frequency
                        );
                        break;
                }
            }

            // Insert due instances
            const { error: instancesError } = await supabase
                .from("due_instances")
                .insert(dueInstances);

            if (instancesError) {
                throw instancesError;
            }

            toast({
                title: "Due created successfully",
                description: `${formData.title} has been added to your monthly dues.`,
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating due:", error);
            toast({
                title: "Error creating due",
                description:
                    "There was an error creating your monthly due. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Add Due"
                text="Create a new recurring monthly payment."
            />

            <DueForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
