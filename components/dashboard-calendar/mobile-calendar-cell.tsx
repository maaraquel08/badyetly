"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import {
    cn,
    formatCurrency,
    getCategoryColor,
    getCategoryBackgroundColor,
} from "@/lib/utils";
import type { MobileCalendarCellProps } from "./types";

export function MobileCalendarCell({
    date,
    dues,
    isToday,
    onCellClick,
    onBillClick,
    onMarkAsPaid,
    processing,
}: MobileCalendarCellProps) {
    const router = useRouter();
    const dayNumber = date.getDate();

    return (
        <div
            className={cn(
                "min-w-[140px] max-w-[140px] min-h-[200px] p-2 border border-gray-200 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer snap-start flex-shrink-0",
                isToday && "ring-2 ring-black"
            )}
            title="Click to add a new due for this date"
            onClick={() => onCellClick(date)}
        >
            <div className="h-full flex flex-col">
                {/* Day header */}
                <div className="flex-shrink-0 mb-2">
                    <div
                        className={cn(
                            "text-lg font-bold",
                            isToday && "text-black"
                        )}
                    >
                        {dayNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {format(date, "EEE")}
                    </div>
                </div>

                {/* Bills list */}
                <div className="flex-1">
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
                                        "text-xs p-2 rounded border cursor-pointer transition-colors shadow-sm hover:shadow-md",
                                        getCategoryBackgroundColor(
                                            due.monthly_dues?.category
                                        ),
                                        due.is_paid && "opacity-60"
                                    )}
                                    onClick={(e) => onBillClick(due, e)}
                                >
                                    <div className="space-y-1">
                                        <div
                                            className={cn(
                                                "font-medium text-gray-900",
                                                due.is_paid && "line-through"
                                            )}
                                        >
                                            {due.monthly_dues?.title ||
                                                "Unknown"}
                                        </div>
                                        <div className="text-gray-600">
                                            {formatCurrency(
                                                due.monthly_dues?.amount || 0
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getCategoryColor(
                                                    due.monthly_dues?.category
                                                )}`}
                                            >
                                                {due.monthly_dues?.category}
                                            </Badge>
                                            {!due.is_paid ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-6 w-6 p-0"
                                                    onClick={(e) =>
                                                        onMarkAsPaid(due.id, e)
                                                    }
                                                    disabled={
                                                        processing[due.id]
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

                {/* Add New Due Button */}
                <div className="flex-shrink-0 mt-2 pt-2 border-t border-gray-200">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Format date as YYYY-MM-DD for the query parameter
                            const formattedDate = format(date, "yyyy-MM-dd");
                            router.push(
                                `/dashboard/dues/add?date=${formattedDate}`
                            );
                        }}
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Due
                    </Button>
                </div>
            </div>
        </div>
    );
}
