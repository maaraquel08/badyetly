"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { BillDetailsSheet } from "@/components/bill-details-sheet";
import { AnalyticsCards } from "@/components/analytics-cards";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

import { DesktopCalendarView } from "./desktop-calendar-view";
import { ListView } from "./list-view";
import type { DashboardCalendarProps, DueInstance } from "./types";

export function DashboardCalendar({
    dueInstances,
    onRefresh,
}: DashboardCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [processing, setProcessing] = useState<Record<string, boolean>>({});
    const [selectedBill, setSelectedBill] = useState<DueInstance | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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

    const handleMarkAsPaid = async (dueId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setProcessing((prev) => ({ ...prev, [dueId]: true }));

        try {
            const { error } = await supabase
                .from("due_instances")
                .update({
                    is_paid: true,
                    paid_on: new Date().toISOString(),
                })
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

    const handleMarkAsUnpaid = async (
        dueId: string,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        setProcessing((prev) => ({ ...prev, [dueId]: true }));

        try {
            const { error } = await supabase
                .from("due_instances")
                .update({
                    is_paid: false,
                    paid_on: null,
                })
                .eq("id", dueId);

            if (error) {
                throw error;
            }

            toast.success("The payment has been marked as unpaid.");

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error marking as unpaid:", error);
            toast.error("Failed to mark payment as unpaid. Please try again.");
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
                    {/* Analytics Cards - shown for all views */}
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
        </>
    );
}
