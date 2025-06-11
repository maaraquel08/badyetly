"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Calendar, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { cn, formatCurrency } from "@/lib/utils";
import { BillDetailsSheet } from "@/components/bill-details-sheet";
import { createClient } from "@/lib/supabase";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface DashboardCalendarProps {
    dueInstances: any[];
    onRefresh?: () => void;
}

export function DashboardCalendar({
    dueInstances,
    onRefresh,
}: DashboardCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mobileStartDate, setMobileStartDate] = useState(() => {
        // Start from the beginning of current week for mobile view
        return startOfWeek(new Date(), { weekStartsOn: 0 });
    });
    const [processing, setProcessing] = useState<Record<string, boolean>>({});
    const [selectedBill, setSelectedBill] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const { toast } = useToast();
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

    // Generate 3-day view for mobile
    const mobileDays = [
        mobileStartDate,
        addDays(mobileStartDate, 1),
        addDays(mobileStartDate, 2),
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

    const navigateMobileDays = (direction: "prev" | "next") => {
        setMobileStartDate((prev) => {
            if (direction === "prev") {
                return addDays(prev, -3);
            } else {
                return addDays(prev, 3);
            }
        });
    };

    const getDuesForDate = (targetDate: Date | number) => {
        let compareDate: Date;

        if (typeof targetDate === "number") {
            // Desktop view - day number
            compareDate = new Date(year, month, targetDate);
        } else {
            // Mobile view - Date object
            compareDate = targetDate;
        }

        return dueInstances.filter((due) => {
            const dueDate = new Date(due.due_date);
            return dueDate.toDateString() === compareDate.toDateString();
        });
    };

    const getAllDuesForMonth = () => {
        return dueInstances
            .filter((due) => {
                const dueDate = new Date(due.due_date);
                return (
                    dueDate.getMonth() === month &&
                    dueDate.getFullYear() === year
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.due_date).getTime() -
                    new Date(b.due_date).getTime()
            );
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

            toast({
                title: "Marked as paid",
                description: "The payment has been marked as paid.",
            });

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error marking as paid:", error);
            toast({
                title: "Error",
                description:
                    "Failed to mark payment as paid. Please try again.",
                variant: "destructive",
            });
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

            toast({
                title: "Marked as unpaid",
                description: "The payment has been marked as unpaid.",
            });

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("Error marking as unpaid:", error);
            toast({
                title: "Error",
                description:
                    "Failed to mark payment as unpaid. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessing((prev) => ({ ...prev, [dueId]: false }));
        }
    };

    const handleBillClick = (due: any, event: React.MouseEvent) => {
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

    const getDayStatus = (targetDate: Date | number) => {
        let compareDate: Date;

        if (typeof targetDate === "number") {
            compareDate = new Date(year, month, targetDate);
        } else {
            compareDate = targetDate;
        }

        const dues = getDuesForDate(targetDate);

        if (dues.length === 0) return "normal";

        const hasOverdue = dues.some((due) => {
            const dueDate = new Date(due.due_date);
            return dueDate < today && !due.is_paid;
        });

        const hasDueToday = dues.some((due) => {
            const dueDate = new Date(due.due_date);
            return (
                dueDate.toDateString() === today.toDateString() && !due.is_paid
            );
        });

        const allPaid = dues.length > 0 && dues.every((due) => due.is_paid);

        if (hasOverdue) return "overdue";
        if (hasDueToday) return "due-today";
        if (allPaid) return "paid";
        return "upcoming";
    };

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

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const renderDesktopCalendarView = () => (
        <>
            <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="min-h-[120px] max-h-[200px] p-1"
                            />
                        );
                    }

                    const dues = getDuesForDate(day);
                    const dayStatus = getDayStatus(day);
                    const isToday =
                        new Date(year, month, day).toDateString() ===
                        today.toDateString();

                    return (
                        <div
                            key={`day-${day}`}
                            className={cn(
                                "min-h-[120px] max-h-[200px] p-1 border rounded-lg transition-colors hover:bg-muted/50 hover:border-primary/50 cursor-pointer",
                                isToday && "ring-2 ring-primary",
                                dayStatus === "overdue" &&
                                    "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700",
                                dayStatus === "due-today" &&
                                    "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700",
                                dayStatus === "upcoming" &&
                                    "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
                                dayStatus === "paid" &&
                                    "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                            )}
                            title="Click to add a new due for this date"
                            onClick={() => handleCellClick(day)}
                        >
                            <div className="h-full flex flex-col">
                                <div
                                    className={cn(
                                        "text-sm font-medium mb-1 flex-shrink-0",
                                        isToday && "text-primary font-bold"
                                    )}
                                >
                                    {day}
                                </div>

                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                                    <div className="space-y-1 pr-1">
                                        {dues.map((due) => (
                                            <div
                                                key={due.id}
                                                className={cn(
                                                    "text-xs p-1 rounded border flex items-center justify-between group cursor-pointer transition-colors bg-white dark:bg-gray-900 shadow-sm hover:shadow-md",
                                                    due.is_paid &&
                                                        "opacity-60 line-through"
                                                )}
                                                onClick={(e) =>
                                                    handleBillClick(due, e)
                                                }
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                        {due.monthly_dues
                                                            ?.title ||
                                                            "Unknown"}
                                                    </div>
                                                    <div className="truncate text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(
                                                            due.monthly_dues
                                                                ?.amount || 0
                                                        )}
                                                    </div>
                                                </div>

                                                {!due.is_paid && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                                                        onClick={(e) =>
                                                            handleMarkAsPaid(
                                                                due.id,
                                                                e
                                                            )
                                                        }
                                                        disabled={
                                                            processing[due.id]
                                                        }
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                )}

                                                {due.is_paid && (
                                                    <Check className="h-3 w-3 text-green-600 ml-1 flex-shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderMobileCalendarView = () => (
        <>
            {/* Mobile 3-day navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMobileDays("prev")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    {format(mobileStartDate, "MMM d")} -{" "}
                    {format(addDays(mobileStartDate, 2), "MMM d, yyyy")}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMobileDays("next")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* 3-column grid for mobile */}
            <div className="grid grid-cols-3 gap-2">
                {mobileDays.map((date, index) => {
                    const dues = getDuesForDate(date);
                    const dayStatus = getDayStatus(date);
                    const isToday = isSameDay(date, today);
                    const dayNumber = date.getDate();

                    return (
                        <div
                            key={index}
                            className={cn(
                                "min-h-[200px] max-h-[300px] p-2 border rounded-lg transition-colors hover:bg-muted/50 hover:border-primary/50 cursor-pointer",
                                isToday && "ring-2 ring-primary",
                                dayStatus === "overdue" &&
                                    "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700",
                                dayStatus === "due-today" &&
                                    "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700",
                                dayStatus === "upcoming" &&
                                    "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
                                dayStatus === "paid" &&
                                    "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                            )}
                            title="Click to add a new due for this date"
                            onClick={() => handleCellClick(date)}
                        >
                            <div className="h-full flex flex-col">
                                {/* Day header */}
                                <div className="flex-shrink-0 mb-2">
                                    <div
                                        className={cn(
                                            "text-lg font-bold",
                                            isToday && "text-primary"
                                        )}
                                    >
                                        {dayNumber}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(date, "EEE")}
                                    </div>
                                </div>

                                {/* Bills list */}
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                                    <div className="space-y-2">
                                        {dues.length === 0 ? (
                                            <div className="text-xs text-muted-foreground text-center py-4">
                                                No bills
                                            </div>
                                        ) : (
                                            dues.map((due) => (
                                                <div
                                                    key={due.id}
                                                    className={cn(
                                                        "text-xs p-2 rounded border cursor-pointer transition-colors bg-white dark:bg-gray-900 shadow-sm hover:shadow-md",
                                                        due.is_paid &&
                                                            "opacity-60"
                                                    )}
                                                    onClick={(e) =>
                                                        handleBillClick(due, e)
                                                    }
                                                >
                                                    <div className="space-y-1">
                                                        <div
                                                            className={cn(
                                                                "font-medium text-gray-900 dark:text-gray-100",
                                                                due.is_paid &&
                                                                    "line-through"
                                                            )}
                                                        >
                                                            {due.monthly_dues
                                                                ?.title ||
                                                                "Unknown"}
                                                        </div>
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            {formatCurrency(
                                                                due.monthly_dues
                                                                    ?.amount ||
                                                                    0
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                {
                                                                    due
                                                                        .monthly_dues
                                                                        ?.category
                                                                }
                                                            </span>
                                                            {!due.is_paid ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleMarkAsPaid(
                                                                            due.id,
                                                                            e
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing[
                                                                            due
                                                                                .id
                                                                        ]
                                                                    }
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                            ) : (
                                                                <Check className="h-3 w-3 text-green-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick navigation to today */}
            <div className="mt-4 text-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setMobileStartDate(
                            startOfWeek(new Date(), { weekStartsOn: 0 })
                        )
                    }
                >
                    Go to This Week
                </Button>
            </div>
        </>
    );

    const renderListView = () => {
        const monthlyDues = getAllDuesForMonth();

        if (monthlyDues.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        No bills for this month
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {monthlyDues.map((due) => {
                    const dueDate = new Date(due.due_date);
                    const isToday =
                        dueDate.toDateString() === today.toDateString();
                    const isOverdue = dueDate < today && !due.is_paid;
                    const isDueToday = isToday && !due.is_paid;

                    return (
                        <div
                            key={due.id}
                            className={cn(
                                "p-3 rounded-lg border bg-white dark:bg-gray-900 cursor-pointer transition-colors hover:bg-muted/50",
                                isOverdue &&
                                    "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
                                isDueToday &&
                                    "border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
                                due.is_paid && "opacity-60"
                            )}
                            onClick={(e) => handleBillClick(due, e)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3
                                            className={cn(
                                                "font-medium text-sm",
                                                due.is_paid && "line-through"
                                            )}
                                        >
                                            {due.monthly_dues?.title ||
                                                "Unknown"}
                                        </h3>
                                        {due.is_paid && (
                                            <Check className="h-4 w-4 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {format(dueDate, "MMM d, yyyy")}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">
                                            {due.monthly_dues?.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="font-medium text-sm">
                                            {formatCurrency(
                                                due.monthly_dues?.amount || 0
                                            )}
                                        </div>
                                        <div
                                            className={cn(
                                                "text-xs",
                                                isOverdue && "text-red-600",
                                                isDueToday && "text-amber-600",
                                                due.is_paid && "text-green-600"
                                            )}
                                        >
                                            {due.is_paid
                                                ? "Paid"
                                                : isOverdue
                                                ? "Overdue"
                                                : isDueToday
                                                ? "Due Today"
                                                : "Upcoming"}
                                        </div>
                                    </div>
                                    {!due.is_paid && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) =>
                                                handleMarkAsPaid(due.id, e)
                                            }
                                            disabled={processing[due.id]}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl md:text-2xl font-bold">
                            {/* Mobile: Show current 3-day range or month for list view */}
                            <span className="md:hidden">
                                {viewMode === "list"
                                    ? `${monthNames[month]} ${year}`
                                    : `${format(
                                          mobileStartDate,
                                          "MMM d"
                                      )} - ${format(
                                          addDays(mobileStartDate, 2),
                                          "d"
                                      )}`}
                            </span>
                            {/* Desktop: Show month */}
                            <span className="hidden md:inline">
                                {monthNames[month]} {year}
                            </span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            {/* View toggle for mobile */}
                            <div className="md:hidden flex border rounded-lg">
                                <Button
                                    variant={
                                        viewMode === "calendar"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("calendar")}
                                >
                                    <Calendar className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={
                                        viewMode === "list"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>

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
                            {viewMode === "list" && (
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
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile views */}
                    <div className="md:hidden">
                        {viewMode === "calendar"
                            ? renderMobileCalendarView()
                            : renderListView()}
                    </div>

                    {/* Desktop view */}
                    <div className="hidden md:block">
                        {renderDesktopCalendarView()}
                    </div>

                    {/* Legend - only show for desktop and mobile calendar view */}
                    {(viewMode === "calendar" ||
                        (typeof window !== "undefined" &&
                            window.innerWidth >= 768)) && (
                        <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 border rounded ring-1 md:ring-2 ring-primary"></div>
                                <span>Today</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border border-red-200 rounded dark:bg-red-950 dark:border-red-800"></div>
                                <span>Overdue</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-amber-100 border border-amber-200 rounded dark:bg-amber-950 dark:border-amber-800"></div>
                                <span>Due Today</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-100 border border-blue-200 rounded dark:bg-blue-950 dark:border-blue-800"></div>
                                <span>Upcoming</span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-50 border border-green-200 rounded dark:bg-green-950 dark:border-green-800"></div>
                                <span>Paid</span>
                            </div>
                        </div>
                    )}
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
