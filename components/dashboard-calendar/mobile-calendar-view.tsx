"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { MobileCalendarCell } from "./mobile-calendar-cell";
import type { DueInstance } from "./types";

interface MobileCalendarViewProps {
    mobileStartDate: Date;
    today: Date;
    dueInstances: DueInstance[];
    onNavigateMobileDays: (direction: "prev" | "next") => void;
    onSetMobileStartDate: (date: Date) => void;
    onCellClick: (date: Date) => void;
    onBillClick: (due: DueInstance, event: React.MouseEvent) => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}

export function MobileCalendarView({
    mobileStartDate,
    today,
    dueInstances,
    onNavigateMobileDays,
    onSetMobileStartDate,
    onCellClick,
    onBillClick,
    onMarkAsPaid,
    processing,
}: MobileCalendarViewProps) {
    // Generate 7-day scrollable view for mobile
    const mobileDays = Array.from({ length: 7 }, (_, i) =>
        addDays(mobileStartDate, i)
    );

    const getDuesForDate = (targetDate: Date) => {
        return dueInstances.filter((due) => {
            const dueDate = new Date(due.due_date);
            return dueDate.toDateString() === targetDate.toDateString();
        });
    };

    return (
        <>
            {/* Mobile 7-day navigation */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateMobileDays("prev")}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    {format(mobileStartDate, "MMM d")} -{" "}
                    {format(addDays(mobileStartDate, 6), "MMM d, yyyy")}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateMobileDays("next")}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Horizontal scrollable view for mobile */}
            <div className="flex gap-2 overflow-x-auto py-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {mobileDays.map((date, index) => {
                    const dues = getDuesForDate(date);
                    const isToday = isSameDay(date, today);

                    return (
                        <MobileCalendarCell
                            key={index}
                            date={date}
                            dues={dues}
                            isToday={isToday}
                            onCellClick={onCellClick}
                            onBillClick={onBillClick}
                            onMarkAsPaid={onMarkAsPaid}
                            processing={processing}
                        />
                    );
                })}
            </div>

            {/* Quick navigation to today */}
            <div className="mt-4 text-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        onSetMobileStartDate(
                            startOfWeek(new Date(), { weekStartsOn: 0 })
                        )
                    }
                >
                    Go to This Week
                </Button>
            </div>
        </>
    );
}
