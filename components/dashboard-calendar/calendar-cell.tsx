"use client";

import { Button } from "@/components/ui/button";
import { Check, DollarSign, Calendar, Plus } from "lucide-react";
import { cn, formatCurrency, getCategoryBackgroundColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { CalendarCellProps } from "./types";

export function CalendarCell({
    day,
    dues,
    isToday,
    year,
    month,
    onCellClick,
    onBillClick,
    onMarkAsPaid,
    processing,
}: CalendarCellProps) {
    const router = useRouter();

    // Calculate totals for hover card
    const totalAmount = dues.reduce(
        (sum, due) => sum + (due.monthly_dues?.amount || 0),
        0
    );
    const paidAmount = dues
        .filter((due) => due.is_paid)
        .reduce((sum, due) => sum + (due.monthly_dues?.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const unpaidCount = dues.filter((due) => !due.is_paid).length;
    const paidCount = dues.filter((due) => due.is_paid).length;

    const cellContent = (
        <div
            className={cn(
                "min-h-[120px] p-1 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer",
                isToday && "ring-2 ring-black"
            )}
            title="Click to add a new due for this date"
            onClick={() => onCellClick(day)}
        >
            <div className="h-full flex flex-col">
                <div
                    className={cn(
                        "text-sm font-medium mb-1 flex-shrink-0",
                        isToday && "text-black font-bold"
                    )}
                >
                    {day}
                </div>

                <div className="flex-1">
                    <div className="space-y-1 pr-1">
                        {dues.map((due) => (
                            <div
                                key={due.id}
                                className={cn(
                                    "text-xs p-1 rounded border flex items-center justify-between group cursor-pointer transition-colors shadow-sm hover:shadow-md",
                                    getCategoryBackgroundColor(
                                        due.monthly_dues?.category
                                    ),
                                    due.is_paid && "opacity-60 line-through"
                                )}
                                onClick={(e) => onBillClick(due, e)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="truncate font-medium text-gray-900">
                                        {due.monthly_dues?.title || "Unknown"}
                                    </div>
                                    <div className="truncate text-gray-600">
                                        {formatCurrency(
                                            due.monthly_dues?.amount || 0
                                        )}
                                    </div>
                                </div>

                                {!due.is_paid && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                                        onClick={(e) => onMarkAsPaid(due.id, e)}
                                        disabled={processing[due.id]}
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

    // Only show hover card if there are dues
    if (dues.length === 0) {
        return cellContent;
    }

    return (
        <HoverCard openDelay={50} closeDelay={150}>
            <HoverCardTrigger asChild>{cellContent}</HoverCardTrigger>
            <HoverCardContent className="w-80" side="top" align="start">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">
                            Day {day}{" "}
                            {dues.length === 1 ? "Payment" : "Summary"}
                        </h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                    {dues.length === 1
                                        ? "Amount:"
                                        : "Total Amount:"}
                                </span>
                            </div>
                            <span className="text-sm font-medium">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>

                        {paidCount > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">
                                        Paid ({paidCount}):
                                    </span>
                                </div>
                                <span className="text-sm text-green-600">
                                    {formatCurrency(paidAmount)}
                                </span>
                            </div>
                        )}

                        {unpaidCount > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full border-2 border-amber-500" />
                                    <span className="text-sm">
                                        Pending ({unpaidCount}):
                                    </span>
                                </div>
                                <span className="text-sm text-amber-600">
                                    {formatCurrency(unpaidAmount)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t space-y-2">
                        <div className="flex justify-">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Format date as YYYY-MM-DD for the query parameter
                                    // Note: month is already 0-indexed from the calendar component
                                    const clickedDate = new Date(
                                        year,
                                        month,
                                        day
                                    );
                                    const formattedDate = format(
                                        clickedDate,
                                        "yyyy-MM-dd"
                                    );
                                    router.push(
                                        `/dashboard/dues/add?date=${formattedDate}`
                                    );
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Due
                            </Button>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
