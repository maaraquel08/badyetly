"use client";

import type React from "react";
import { useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentAmountDialog } from "@/components/payment-amount-dialog";

import {
    Check,
    Calendar,
    CreditCard,
    Tag,
    FileText,
    Clock,
    X,
} from "lucide-react";
import { formatCurrency, getCategoryColor, supportsVaryingAmount } from "@/lib/utils";
import { format } from "date-fns";

interface BillDetailsSheetProps {
    bill: any;
    isOpen: boolean;
    onClose: () => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent, paidAmount?: number) => void;
    onMarkAsUnpaid?: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}

export function BillDetailsSheet({
    bill,
    isOpen,
    onClose,
    onMarkAsPaid,
    onMarkAsUnpaid,
    processing,
}: BillDetailsSheetProps) {
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    if (!bill) return null;

    const handleMarkAsPaidClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const needsPaymentAmount =
            supportsVaryingAmount(bill.monthly_dues?.category) ||
            bill.monthly_dues?.amount === null;

        if (needsPaymentAmount) {
            setPaymentDialogOpen(true);
        } else {
            onMarkAsPaid(bill.id, e);
        }
    };

    const handlePaymentConfirm = (amount: number) => {
        const syntheticEvent = {
            stopPropagation: () => {},
        } as React.MouseEvent;
        onMarkAsPaid(bill.id, syntheticEvent, amount);
        setPaymentDialogOpen(false);
    };

    const getStatusInfo = () => {
        const dueDate = new Date(bill.due_date);
        const today = new Date();

        if (bill.is_paid) {
            return {
                status: "Paid",
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                icon: Check,
            };
        }

        if (dueDate < today) {
            return {
                status: "Overdue",
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
                icon: Clock,
            };
        }

        if (dueDate.toDateString() === today.toDateString()) {
            return {
                status: "Due Today",
                color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                icon: Clock,
            };
        }

        return {
            status: "Upcoming",
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            icon: Calendar,
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {bill.monthly_dues.title}
                    </SheetTitle>
                    <SheetDescription>
                        Bill details and payment information
                    </SheetDescription>
                </SheetHeader>

                <div className="px-6 pb-6 pt-4 border-t border-border space-y-6 flex-1 overflow-y-auto">
                    {/* Amount and Status */}
                    <div className="rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-foreground mb-3">
                            {formatCurrency(
                                bill.paid_amount !== null &&
                                    bill.paid_amount !== undefined
                                    ? bill.paid_amount
                                    : bill.monthly_dues?.amount
                            )}
                        </div>
                        {bill.paid_amount !== null &&
                            bill.paid_amount !== undefined &&
                            bill.monthly_dues?.amount !== null &&
                            bill.paid_amount !== bill.monthly_dues.amount && (
                                <div className="text-sm text-muted-foreground mb-2">
                                    Original:{" "}
                                    {formatCurrency(bill.monthly_dues.amount)}
                                </div>
                            )}
                        <div className="flex items-center justify-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge
                                variant="outline"
                                className={statusInfo.color}
                            >
                                {statusInfo.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Bill Information */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-foreground">
                            <FileText className="h-4 w-4" />
                            Bill Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Category
                                </span>
                                <Badge
                                    variant="outline"
                                    className={getCategoryColor(
                                        bill.monthly_dues.category
                                    )}
                                >
                                    {bill.monthly_dues.category}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Due Date
                                </span>
                                <span className="text-sm font-medium">
                                    {format(
                                        new Date(bill.due_date),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>

                            {bill.is_paid && bill.paid_on && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        Paid On
                                    </span>
                                    <span className="text-sm font-medium text-green-600">
                                        {format(
                                            new Date(bill.paid_on),
                                            "MMMM d, yyyy"
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recurring Information */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-foreground">
                            <Calendar className="h-4 w-4" />
                            Recurring Details
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Frequency
                                </span>
                                <span className="text-sm font-medium capitalize">
                                    {bill.monthly_dues.recurrence_frequency > 1
                                        ? `Every ${bill.monthly_dues.recurrence_frequency} ${bill.monthly_dues.recurrence}`
                                        : bill.monthly_dues.recurrence}
                                </span>
                            </div>

                            {bill.monthly_dues.end_type === "after_date" &&
                                bill.monthly_dues.end_date && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Ends On
                                        </span>
                                        <span className="text-sm font-medium">
                                            {format(
                                                new Date(
                                                    bill.monthly_dues.end_date
                                                ),
                                                "MMMM d, yyyy"
                                            )}
                                        </span>
                                    </div>
                                )}

                            {bill.monthly_dues.end_type ===
                                "after_occurrences" &&
                                bill.monthly_dues.occurrences && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            Total Occurrences
                                        </span>
                                        <span className="text-sm font-medium">
                                            {bill.monthly_dues.occurrences}
                                        </span>
                                    </div>
                                )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Next Due
                                </span>
                                <span className="text-sm font-medium">
                                    {format(
                                        new Date(
                                            new Date(bill.due_date).getTime() +
                                                30 * 24 * 60 * 60 * 1000
                                        ),
                                        "MMMM d, yyyy"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {bill.monthly_dues.notes && (
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold flex items-center gap-2 text-foreground">
                                <Tag className="h-4 w-4" />
                                Notes
                            </h3>
                            <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {bill.monthly_dues.notes}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="p-6 pt-4 border-t bg-background space-y-3">
                    {!bill.is_paid ? (
                        <Button
                            className="w-full"
                            onClick={handleMarkAsPaidClick}
                            disabled={processing[bill.id]}
                        >
                            {processing[bill.id] ? (
                                "Marking as Paid..."
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Paid
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={(e) =>
                                onMarkAsUnpaid && onMarkAsUnpaid(bill.id, e)
                            }
                            disabled={processing[bill.id]}
                        >
                            {processing[bill.id] ? (
                                "Marking as Unpaid..."
                            ) : (
                                <>
                                    <X className="mr-2 h-4 w-4" />
                                    Mark as Unpaid
                                </>
                            )}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </SheetContent>

            <PaymentAmountDialog
                isOpen={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
                onConfirm={handlePaymentConfirm}
                defaultAmount={bill.monthly_dues?.amount || null}
                billTitle={bill.monthly_dues?.title}
            />
        </Sheet>
    );
}
