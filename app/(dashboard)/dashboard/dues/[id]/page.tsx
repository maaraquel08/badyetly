"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { DashboardHeader } from "@/components/dashboard-header";
import { DueForm } from "@/components/due-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface EditDuePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditDuePage({ params }: EditDuePageProps) {
    const resolvedParams = React.use(params);
    const { id } = resolvedParams;
    const supabase = createClient();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const [due, setDue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDue = async () => {
            // Skip if this is the "new" route (should not happen with proper routing)
            if (id === "new") {
                router.push("/dashboard/dues/new");
                return;
            }

            // Validate UUID format
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                setError("Invalid due ID format");
                toast({
                    title: "Invalid due ID",
                    description:
                        "The due ID format is invalid. Please check the URL.",
                    variant: "destructive",
                });
                router.push("/dashboard/dues");
                return;
            }

            if (!user) {
                setError("User not authenticated");
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from("monthly_dues")
                    .select("*")
                    .eq("id", id)
                    .eq("user_id", user.id) // Ensure user can only access their own dues
                    .single();

                if (error) {
                    if (error.code === "PGRST116") {
                        setError("Due not found");
                        toast({
                            title: "Due not found",
                            description:
                                "The requested due could not be found or you don't have permission to access it.",
                            variant: "destructive",
                        });
                    } else {
                        throw error;
                    }
                    return;
                }

                setDue(data);
            } catch (error) {
                console.error("Error fetching due:", error);
                setError(
                    error instanceof Error ? error.message : "An error occurred"
                );
                toast({
                    title: "Error fetching due",
                    description: "Failed to load the due details.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (id && user) {
            fetchDue();
        }
    }, [id, supabase, toast, router, user]);

    const handleSubmit = async (formData: any) => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please log in to update this due.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // First update the monthly due
            const { error } = await supabase
                .from("monthly_dues")
                .update({
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
                .eq("id", id)
                .eq("user_id", user.id); // Ensure user can only update their own dues

            if (error) throw error;

            // Delete existing future due instances
            const today = new Date().toISOString().split("T")[0];
            await supabase
                .from("due_instances")
                .delete()
                .eq("monthly_due_id", id)
                .gt("due_date", today)
                .is("is_paid", false);

            // Generate new due instances based on updated recurrence settings
            const dueInstances = [];
            const startDate = new Date(); // Start from today for future instances
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

                // Only add future dates
                if (dueDate > new Date()) {
                    dueInstances.push({
                        monthly_due_id: id,
                        due_date: dueDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
                        is_paid: false,
                    });
                }

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

            // Insert new due instances if there are any
            if (dueInstances.length > 0) {
                await supabase.from("due_instances").insert(dueInstances);
            }

            toast({
                title: "Due updated",
                description: `${formData.title} has been updated.`,
            });

            router.push("/dashboard/dues");
            router.refresh();
        } catch (error) {
            console.error("Error updating due:", error);
            toast({
                title: "Error updating due",
                description: "Failed to update your monthly due.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please log in to delete this due.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);
        try {
            // First delete all due instances
            await supabase
                .from("due_instances")
                .delete()
                .eq("monthly_due_id", id);

            // Then delete the monthly due
            const { error } = await supabase
                .from("monthly_dues")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id); // Ensure user can only delete their own dues

            if (error) throw error;

            toast({
                title: "Due deleted",
                description: "The monthly due has been deleted.",
            });

            router.push("/dashboard/dues");
            router.refresh();
        } catch (error) {
            console.error("Error deleting due:", error);
            toast({
                title: "Error deleting due",
                description: "Failed to delete your monthly due.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    heading="Edit Due"
                    text="Loading due details..."
                />
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <DashboardHeader
                    heading="Edit Due"
                    text="There was an error loading the due details."
                />
                <div className="flex items-center justify-center h-64 flex-col">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <Button onClick={() => router.push("/dashboard/dues")}>
                        Back to Dues
                    </Button>
                </div>
            </div>
        );
    }

    if (!due) {
        return (
            <div className="space-y-6">
                <DashboardHeader heading="Edit Due" text="Due not found." />
                <div className="flex items-center justify-center h-64 flex-col">
                    <p className="text-muted-foreground mb-4">
                        The requested due could not be found.
                    </p>
                    <Button onClick={() => router.push("/dashboard/dues")}>
                        Back to Dues
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading="Edit Due"
                text="Update your recurring monthly payment."
            >
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this monthly due
                                and all its payment history. This action cannot
                                be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DashboardHeader>

            <DueForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                initialData={due}
                isEditing={true}
            />
        </div>
    );
}
