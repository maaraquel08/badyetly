"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DueFormHeader } from "@/components/due-form/due-form-header";
import { DueForm } from "@/components/due-form/due-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { ArrowLeft } from "lucide-react";
import { supportsVaryingAmount } from "@/lib/utils";

export default function NewDuePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
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

        // Validate required fields
        if (!formData.title?.trim()) {
            toast({
                title: "Validation error",
                description: "Title is required.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.category?.trim()) {
            toast({
                title: "Validation error",
                description: "Category is required.",
                variant: "destructive",
            });
            return;
        }

        // Check if category supports optional amounts
        const categorySupportsOptionalAmount = supportsVaryingAmount(
            formData.category
        );

        // Process amount value
        let amountValue: number | null = null;
        if (
            typeof formData.amount === "number" &&
            !Number.isNaN(formData.amount) &&
            formData.amount !== null
        ) {
            amountValue = formData.amount;
        } else if (
            formData.amount &&
            typeof formData.amount === "string" &&
            formData.amount.trim() !== ""
        ) {
            const parsed = Number.parseFloat(formData.amount);
            if (!Number.isNaN(parsed)) {
                amountValue = parsed;
            }
        }

        // Validate amount based on category
        if (!categorySupportsOptionalAmount && amountValue === null) {
            toast({
                title: "Validation error",
                description: "Amount is required for this category.",
                variant: "destructive",
            });
            return;
        }

        // If category supports optional amount, allow null or 0
        // Otherwise, ensure we have a valid positive amount
        if (
            !categorySupportsOptionalAmount &&
            (amountValue === null || amountValue <= 0)
        ) {
            toast({
                title: "Validation error",
                description: "Please enter a valid amount greater than 0.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const supabase = createClient();

            // Verify user session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:103',message:'Before checking user profile exists',data:{userId:user.id,sessionUserId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            if (sessionError || !session) {
                console.error("Session error:", sessionError);
                throw new Error("Authentication session not found");
            }

            // Check if user profile exists in public.users
            const { data: userProfile, error: profileCheckError } = await supabase
                .from("users")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:110',message:'User profile check result',data:{userId:user.id,profileExists:!!userProfile,profileCheckError:profileCheckError?{message:profileCheckError.message,code:profileCheckError.code}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion

            // If profile doesn't exist, create it using upsert to handle race conditions
            if (!userProfile) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:115',message:'Creating missing user profile',data:{userId:user.id,email:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                // Check if user exists first, then insert or update
                const { data: existingProfile } = await supabase
                    .from("users")
                    .select("id")
                    .eq("id", user.id)
                    .maybeSingle();
                
                let createProfileError;
                if (existingProfile) {
                    // Update existing
                    const result = await supabase
                        .from("users")
                        .update({
                            email: user.email!,
                            name: user.user_metadata?.name || null,
                        })
                        .eq("id", user.id);
                    createProfileError = result.error;
                } else {
                    // Insert new
                    const result = await supabase
                        .from("users")
                        .insert({
                            id: user.id,
                            email: user.email!,
                            name: user.user_metadata?.name || null,
                        });
                    createProfileError = result.error;
                }
                
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:123',message:'User profile creation result',data:{userId:user.id,createProfileError:createProfileError?{message:createProfileError.message,code:createProfileError.code,details:createProfileError.details}:null,success:!createProfileError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                if (createProfileError) {
                    console.error("Failed to create user profile:", createProfileError);
                    throw new Error(`Failed to create user profile: ${createProfileError.message}`);
                }
            }

            // Create the monthly due
            // Amount is already converted to number or null by the form component
            const amountValue =
                typeof formData.amount === "number" &&
                !Number.isNaN(formData.amount)
                    ? formData.amount
                    : null;

            const insertData = {
                user_id: user.id,
                title: formData.title.trim(),
                amount: amountValue,
                category: formData.category.trim(),
                start_date: formData.start_date,
                recurrence: formData.recurrence || "monthly",
                recurrence_frequency: formData.recurrence_frequency || 1,
                due_day: formData.due_day || null,
                status: formData.status || "active",
                notes: formData.notes?.trim() || null,
                end_type: formData.end_type || "never",
                end_date: formData.end_date || null,
                occurrences: formData.occurrences || null,
            };

            console.log("Inserting monthly due with data:", {
                ...insertData,
                user_id: user.id,
                session_user_id: session.user.id,
            });

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:139',message:'Before inserting monthly_due',data:{userId:user.id,insertData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            const { data: monthlyDue, error: monthlyDueError } = await supabase
                .from("monthly_dues")
                .insert(insertData)
                .select()
                .single();

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dues/new/page.tsx:145',message:'After inserting monthly_due',data:{userId:user.id,error:monthlyDueError?{message:monthlyDueError.message,code:monthlyDueError.code,details:monthlyDueError.details}:null,success:!monthlyDueError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion

            if (monthlyDueError) {
                const errorDetails = {
                    message: monthlyDueError?.message,
                    details: monthlyDueError?.details,
                    hint: monthlyDueError?.hint,
                    code: monthlyDueError?.code,
                };
                console.error("Error creating monthly due:", errorDetails);
                console.error("Full error object:", monthlyDueError);
                throw monthlyDueError;
            }

            // Generate due instances
            const dueInstances = generateDueInstances(monthlyDue, formData);

            // Insert due instances
            const { error: instancesError } = await supabase
                .from("due_instances")
                .insert(dueInstances);

            if (instancesError) {
                console.error("Error creating due instances:", {
                    error: instancesError,
                    message: instancesError.message,
                    details: instancesError.details,
                    hint: instancesError.hint,
                    code: instancesError.code,
                });
                throw instancesError;
            }

            toast({
                title: "Due created successfully",
                description: `${formData.title} has been added to your monthly dues.`,
            });

            router.push("/dashboard");
        } catch (error: any) {
            console.error("Error creating due:", {
                error,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
            });

            // Extract a user-friendly error message
            let errorMessage =
                "There was an error creating your monthly due. Please try again.";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.details) {
                errorMessage = error.details;
            } else if (error?.hint) {
                errorMessage = error.hint;
            } else if (typeof error === "string") {
                errorMessage = error;
            }

            toast({
                title: "Error creating due",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateDueInstances = (monthlyDue: any, formData: any) => {
        const dueInstances = [];
        const startDate = new Date(formData.start_date);
        const currentDate = new Date(startDate);
        let instanceCount = 0;
        const maxInstances =
            formData.end_type === "after_occurrences"
                ? parseInt(formData.occurrences)
                : 100;
        const endDate =
            formData.end_type === "after_date"
                ? new Date(formData.end_date)
                : new Date(9999, 11, 31);

        const frequency = parseInt(formData.recurrence_frequency);

        while (instanceCount < maxInstances && currentDate <= endDate) {
            let dueDate = new Date(currentDate);
            if (formData.due_day) {
                dueDate.setDate(parseInt(formData.due_day));
                const month = dueDate.getMonth();
                dueDate.setDate(parseInt(formData.due_day));
                if (dueDate.getMonth() !== month) {
                    dueDate = new Date(
                        dueDate.getFullYear(),
                        dueDate.getMonth(),
                        0
                    );
                }
            }

            dueInstances.push({
                monthly_due_id: monthlyDue.id,
                due_date: dueDate.toISOString().split("T")[0],
                is_paid: false,
            });

            instanceCount++;

            // Calculate next date based on recurrence
            switch (formData.recurrence) {
                case "weekly":
                    currentDate.setDate(currentDate.getDate() + 7 * frequency);
                    break;
                case "biweekly":
                    currentDate.setDate(currentDate.getDate() + 14 * frequency);
                    break;
                case "monthly":
                    currentDate.setMonth(currentDate.getMonth() + frequency);
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

        return dueInstances;
    };

    return (
        <div className="space-y-6">
            <DueFormHeader
                heading="Add New Due"
                text="Create a new recurring monthly payment."
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="flex-shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </DueFormHeader>

            <DueForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
