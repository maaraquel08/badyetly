"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { format } from "date-fns";
import {
    cn,
    formatCurrency,
    getCategoryColor,
    getCategoryBackgroundColor,
} from "@/lib/utils";
import type { DueInstance } from "./types";

interface ListViewProps {
    dueInstances: DueInstance[];
    currentDate: Date;
    today: Date;
    onBillClick: (due: DueInstance, event: React.MouseEvent) => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}

export function ListView({
    dueInstances,
    currentDate,
    today,
    onBillClick,
    onMarkAsPaid,
    processing,
}: ListViewProps) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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

    const monthlyDues = getAllDuesForMonth();

    if (monthlyDues.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No bills for this month</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {monthlyDues.map((due) => {
                const dueDate = new Date(due.due_date);
                const isToday = dueDate.toDateString() === today.toDateString();
                const isOverdue = dueDate < today && !due.is_paid;
                const isDueToday = isToday && !due.is_paid;

                return (
                    <div
                        key={due.id}
                        className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-colors",
                            // Use category background colors as base
                            getCategoryBackgroundColor(
                                due.monthly_dues?.category
                            ),
                            due.is_paid && "opacity-60"
                        )}
                        onClick={(e) => onBillClick(due, e)}
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
                                        {due.monthly_dues?.title || "Unknown"}
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
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${getCategoryColor(
                                            due.monthly_dues?.category
                                        )}`}
                                    >
                                        {due.monthly_dues?.category}
                                    </Badge>
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
                                        onClick={(e) => onMarkAsPaid(due.id, e)}
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
}
