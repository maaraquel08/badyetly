"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentAmountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    defaultAmount?: number | null;
    billTitle?: string;
}

export function PaymentAmountDialog({
    isOpen,
    onClose,
    onConfirm,
    defaultAmount,
    billTitle,
}: PaymentAmountDialogProps) {
    const [amount, setAmount] = useState<string>(
        defaultAmount?.toString() || ""
    );
    const [error, setError] = useState<string>("");

    const handleConfirm = () => {
        const amountValue = amount.trim();
        if (!amountValue) {
            setError("Please enter a payment amount");
            return;
        }

        const parsedAmount = Number.parseFloat(amountValue);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        onConfirm(parsedAmount);
        setAmount("");
        setError("");
    };

    const handleClose = () => {
        setAmount(defaultAmount?.toString() || "");
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Payment Amount</DialogTitle>
                    <DialogDescription>
                        {billTitle
                            ? `Enter the amount paid for ${billTitle}`
                            : "Enter the amount you paid for this bill"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">
                            Amount (PHP) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="payment-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleConfirm();
                                }
                            }}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

