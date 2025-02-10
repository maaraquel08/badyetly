"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction, Account } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AccountIcon } from "@/components/features/accounts/AccountIcon";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";

type AddTransactionFormProps = {
    onSubmit: (transaction: Transaction) => void;
    accounts: Account[];
};

export function AddTransactionForm({
    onSubmit,
    accounts,
}: AddTransactionFormProps) {
    const { currency, convertAmount } = useCurrency();
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"income" | "expense">("income");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAccountId) {
            // You might want to add proper form validation/error handling
            return;
        }

        // Convert input amount to USD before storing
        const usdAmount = convertAmount(
            parseFloat(amount),
            currency,
            currencies[0] // USD
        );

        const transaction: Transaction = {
            type,
            amount: usdAmount, // Store in USD
            description,
            date: date.toISOString(),
            accountId: selectedAccountId,
        };

        onSubmit(transaction);
        setAmount("");
        setDescription("");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
                <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    onClick={() => setType("income")}
                    className="flex-1"
                >
                    Income
                </Button>
                <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    onClick={() => setType("expense")}
                    className="flex-1"
                >
                    Expense
                </Button>
            </div>

            <div className="space-y-2">
                <Select
                    value={selectedAccountId}
                    onValueChange={setSelectedAccountId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                                <div className="flex items-center gap-2">
                                    <AccountIcon
                                        type={account.type}
                                        className="h-4 w-4"
                                    />
                                    <span>{account.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="rounded-md border">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="rounded-md"
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={!selectedAccountId}
            >
                Add Transaction
            </Button>
        </form>
    );
}
