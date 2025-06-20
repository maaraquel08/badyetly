"use client";

import { CalendarCell } from "./calendar-cell";
import type { DueInstance } from "./types";

interface DesktopCalendarViewProps {
    calendarDays: (number | null)[];
    year: number;
    month: number;
    today: Date;
    dueInstances: DueInstance[];
    onCellClick: (day: number) => void;
    onBillClick: (due: DueInstance, event: React.MouseEvent) => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}

export function DesktopCalendarView({
    calendarDays,
    year,
    month,
    today,
    dueInstances,
    onCellClick,
    onBillClick,
    onMarkAsPaid,
    processing,
}: DesktopCalendarViewProps) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDuesForDate = (day: number) => {
        const compareDate = new Date(year, month, day);
        return dueInstances.filter((due) => {
            const dueDate = new Date(due.due_date);
            return dueDate.toDateString() === compareDate.toDateString();
        });
    };

    return (
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
                    const isToday =
                        new Date(year, month, day).toDateString() ===
                        today.toDateString();

                    return (
                        <CalendarCell
                            key={`day-${day}`}
                            day={day}
                            dues={dues}
                            isToday={isToday}
                            year={year}
                            month={month}
                            onCellClick={onCellClick}
                            onBillClick={onBillClick}
                            onMarkAsPaid={onMarkAsPaid}
                            processing={processing}
                        />
                    );
                })}
            </div>
        </>
    );
}
