"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type AddTransactionFormProps = {
    onSubmit: (
        type: "income" | "expense",
        amount: number,
        description: string
    ) => void;
};

export default function AddTransactionForm({
    onSubmit,
}: AddTransactionFormProps) {
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [transactionType, setTransactionType] = useState<
        "income" | "expense"
    >("income");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!description || amount <= 0) {
            alert("Please fill in all fields correctly");
            return;
        }

        onSubmit(transactionType, amount, description);

        // Reset form
        setAmount(0);
        setDescription("");
        setTransactionType("income");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
                <CardDescription>
                    Add a new transaction to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <Label>Input amount</Label>
                    <Input
                        placeholder="0.00"
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                    <Select
                        value={transactionType}
                        onValueChange={(value: "income" | "expense") => {
                            setTransactionType(value);
                        }}
                    >
                        <Label>Transaction Type</Label>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Add additional notes to your transaction"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button type="submit">Add Transaction</Button>
                </form>
            </CardContent>
        </Card>
    );
}
