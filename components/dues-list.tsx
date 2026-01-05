"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DuesListProps {
    title: string;
    dues: any[];
    emptyMessage: string;
    variant: "default" | "warning" | "destructive";
}

export function DuesList({
    title,
    dues,
    emptyMessage,
    variant,
}: DuesListProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [processing, setProcessing] = useState<Record<string, boolean>>({});

    const handleMarkAsPaid = async (dueId: string) => {
        setProcessing((prev) => ({ ...prev, [dueId]: true }));

        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Marked as paid",
                description: "The payment has been marked as paid.",
            });
            setProcessing((prev) => ({ ...prev, [dueId]: false }));
            router.refresh();
        }, 1000);
    };

    const getCardVariant = () => {
        switch (variant) {
            case "warning":
                return "bg-white border-amber-200";
            case "destructive":
                return "bg-white border-red-200";
            default:
                return "bg-white border-gray-200";
        }
    };

    const getDueStatus = (due: any) => {
        const dueDate = new Date(due.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        if (due.is_paid) return "paid";
        if (dueDate < today) return "overdue";
        if (dueDate.getTime() === today.getTime()) return "due-today";
        return "upcoming";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800 border-green-300";
            case "overdue":
                return "bg-red-100 text-red-800 border-red-300";
            case "due-today":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "upcoming":
                return "bg-blue-100 text-blue-800 border-blue-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "paid":
                return "Paid";
            case "overdue":
                return "Overdue";
            case "due-today":
                return "Due Today";
            case "upcoming":
                return "Upcoming";
            default:
                return "Unknown";
        }
    };

    return (
        <Card className={getCardVariant()}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {dues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    dues.map((due) => {
                        const status = getDueStatus(due);
                        return (
                            <div
                                key={due.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="space-y-1">
                                    <div className="font-medium">
                                        {due.monthly_dues.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(due.due_date)} •{" "}
                                        {due.monthly_dues.category}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right font-medium">
                                        {formatCurrency(
                                            due.monthly_dues.amount || 0
                                        )}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={getStatusColor(status)}
                                    >
                                        {getStatusText(status)}
                                    </Badge>
                                    {!due.is_paid && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() =>
                                                handleMarkAsPaid(due.id)
                                            }
                                            disabled={processing[due.id]}
                                        >
                                            <Check className="h-4 w-4" />
                                            <span className="sr-only">
                                                Mark as paid
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
