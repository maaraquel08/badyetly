"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { BillDetailsSheet } from "@/components/bill-details-sheet";
import { AnalyticsCards } from "@/components/analytics-cards";
import { PaymentAmountDialog } from "@/components/payment-amount-dialog";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import { supportsVaryingAmount } from "@/lib/utils";

import { DesktopCalendarView } from "./desktop-calendar-view";
import { ListView } from "./list-view";
import { ReportsTab } from "@/components/reports-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DashboardCalendarProps, DueInstance } from "./types";

export function DashboardCalendar({
    dueInstances,
    onRefresh,
}: DashboardCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [processing, setProcessing] = useState<Record<string, boolean>>({});
    const [selectedBill, setSelectedBill] = useState<DueInstance | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [pendingDueId, setPendingDueId] = useState<string | null>(null);
    const [pendingDue, setPendingDue] = useState<DueInstance | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days for desktop view
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Generate calendar days for desktop
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === "prev") {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const handleMarkAsPaid = async (
        dueId: string,
        event: React.MouseEvent,
        paidAmount?: number
    ) => {
        event.stopPropagation();

        // Find the due instance to check if we need payment dialog
        const due = dueInstances.find((d) => d.id === dueId);
        if (!due) return;

        // Check if we need to show payment dialog (varying amount categories or null amount)
        const needsPaymentAmount =
            supportsVaryingAmount(due.monthly_dues.category) ||
            due.monthly_dues.amount === null;

        // If we need payment amount and it's not provided, show dialog
        if (needsPaymentAmount && paidAmount === undefined) {
            setPendingDueId(dueId);
            setPendingDue(due);
            setPaymentDialogOpen(true);
            return;
        }

        // Proceed with marking as paid
        setProcessing((prev) => ({ ...prev, [dueId]: true }));

        try {
            const updateData: {
                is_paid: boolean;
                paid_on: string;
                paid_amount?: number | null;
            } = {
                is_paid: true,
                paid_on: new Date().toISOString(),
            };

            // Store paid_amount if provided or if category is cards/null amount
            if (paidAmount !== undefined) {
                updateData.paid_amount = paidAmount;
            } else if (needsPaymentAmount) {
                // This shouldn't happen, but handle it gracefully
                updateData.paid_amount = null;
            }

            const { error } = await supabase
                .from("due_instances")
                .update(updateData)
                .eq("id", dueId);

            if (error) {
                throw error;
            }

            toast.success("The payment has been marked as paid.");

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error marking as paid:", error);
            toast.error("Failed to mark payment as paid. Please try again.");
        } finally {
            setProcessing((prev) => ({ ...prev, [dueId]: false }));
        }
    };

    const handlePaymentConfirm = (amount: number) => {
        if (pendingDueId) {
            // Create a synthetic event for the mark as paid handler
            const syntheticEvent = {
                stopPropagation: () => {},
            } as React.MouseEvent;
            handleMarkAsPaid(pendingDueId, syntheticEvent, amount);
        }
        setPaymentDialogOpen(false);
        setPendingDueId(null);
        setPendingDue(null);
    };

    const handleMarkAsUnpaid = async (
        dueId: string,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        setProcessing((prev) => ({ ...prev, [dueId]: true }));

        try {
            // Try updating without paid_amount first to avoid column issues
            let { error, data } = await supabase
                .from("due_instances")
                .update({
                    is_paid: false,
                    paid_on: null,
                })
                .eq("id", dueId)
                .select();

            // If successful and we want to clear paid_amount, try a second update
            if (!error && data && data.length > 0) {
                // Try to also clear paid_amount if the column exists
                // Use a separate update to avoid issues if column doesn't exist
                const { error: paidAmountError } = await supabase
                    .from("due_instances")
                    .update({ paid_amount: null })
                    .eq("id", dueId);

                // Ignore errors about paid_amount column not existing
                if (paidAmountError) {
                    const errorCode = paidAmountError.code || "";
                    const errorMessage = paidAmountError.message || "";
                    // PostgreSQL error code for undefined column
                    if (
                        errorCode !== "42703" &&
                        !errorMessage.includes("paid_amount") &&
                        !errorMessage.includes("column")
                    ) {
                        // Only log if it's not a column-not-found error
                        console.warn(
                            "Could not clear paid_amount:",
                            paidAmountError
                        );
                    }
                }
            }

            if (error) {
                // Log error details before throwing
                console.error("Supabase update error:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    fullError: error,
                });
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error("No rows were updated. The due instance may not exist.");
            }

            toast.success("The payment has been marked as unpaid.");

            if (onRefresh) {
                onRefresh();
            }
        } catch (error: unknown) {
            // Better error handling for unknown error types
            let errorMessage = "Failed to mark payment as unpaid. Please try again.";
            
            if (error instanceof Error) {
                errorMessage = error.message;
                console.error("Error marking as unpaid:", error);
            } else if (error && typeof error === "object") {
                // Try to extract from Supabase error format
                const supabaseError = error as {
                    message?: string;
                    details?: string;
                    hint?: string;
                    code?: string;
                };
                
                errorMessage =
                    supabaseError.message ||
                    supabaseError.details ||
                    supabaseError.hint ||
                    errorMessage;
                
                console.error("Error marking as unpaid:", {
                    message: supabaseError.message,
                    details: supabaseError.details,
                    hint: supabaseError.hint,
                    code: supabaseError.code,
                    raw: error,
                });
            } else {
                console.error("Unknown error type:", typeof error, error);
            }
            
            toast.error(errorMessage);
        } finally {
            setProcessing((prev) => ({ ...prev, [dueId]: false }));
        }
    };

    const handleBillClick = (due: DueInstance, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedBill(due);
        setIsSheetOpen(true);
    };

    const handleCellClick = (targetDate: Date | number) => {
        let clickedDate: Date;

        if (typeof targetDate === "number") {
            // Desktop view - day number
            clickedDate = new Date(year, month, targetDate);
        } else {
            // Mobile view - Date object
            clickedDate = targetDate;
        }

        // Format the date as YYYY-MM-DD for URL parameter
        const formattedDate = format(clickedDate, "yyyy-MM-dd");
        router.push(`/dashboard/dues/new?date=${formattedDate}`);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl md:text-2xl font-bold">
                            {/* Mobile: Show month for list view */}
                            <span className="md:hidden">
                                {monthNames[month]} {year}
                            </span>
                            {/* Desktop: Show month */}
                            <span className="hidden md:inline">
                                {monthNames[month]} {year}
                            </span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            {/* Desktop navigation */}
                            <div className="hidden md:flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => navigateMonth("prev")}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => navigateMonth("next")}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Mobile navigation for list view */}
                            <div className="md:hidden flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => navigateMonth("prev")}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => navigateMonth("next")}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="calendar" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="calendar">Calendar</TabsTrigger>
                            <TabsTrigger value="reports">Reports</TabsTrigger>
                        </TabsList>
                        <TabsContent value="calendar" className="space-y-0">
                            {/* Analytics Cards - shown for calendar view */}
                            <div className="mb-6">
                                <AnalyticsCards
                                    dueInstances={dueInstances}
                                    viewingDate={currentDate}
                                />
                            </div>

                            {/* Mobile views */}
                            <div className="md:hidden">
                                <ListView
                                    dueInstances={dueInstances}
                                    currentDate={currentDate}
                                    today={today}
                                    onBillClick={handleBillClick}
                                    onMarkAsPaid={handleMarkAsPaid}
                                    processing={processing}
                                />
                            </div>

                            {/* Desktop view */}
                            <div className="hidden md:block">
                                <DesktopCalendarView
                                    calendarDays={calendarDays}
                                    year={year}
                                    month={month}
                                    today={today}
                                    dueInstances={dueInstances}
                                    onCellClick={handleCellClick}
                                    onBillClick={handleBillClick}
                                    onMarkAsPaid={handleMarkAsPaid}
                                    processing={processing}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="reports" className="space-y-0">
                            <ReportsTab
                                dueInstances={dueInstances}
                                viewingDate={currentDate}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <BillDetailsSheet
                bill={selectedBill}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onMarkAsPaid={handleMarkAsPaid}
                onMarkAsUnpaid={handleMarkAsUnpaid}
                processing={processing}
            />

            <PaymentAmountDialog
                isOpen={paymentDialogOpen}
                onClose={() => {
                    setPaymentDialogOpen(false);
                    setPendingDueId(null);
                    setPendingDue(null);
                }}
                onConfirm={handlePaymentConfirm}
                defaultAmount={pendingDue?.monthly_dues.amount || null}
                billTitle={pendingDue?.monthly_dues.title}
            />
        </>
    );
}
