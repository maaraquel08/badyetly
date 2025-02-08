"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTransactionForm from "@/components/forms/AddTransactionForm";
import { TransactionList } from "@/components/features/TransactionList";

type Transaction = {
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
};

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const handleAddTransaction = (
        type: "income" | "expense",
        amount: number,
        description: string
    ) => {
        const newTransaction = {
            type,
            amount,
            description,
            date: new Date().toISOString(),
        };
        setTransactions([newTransaction, ...transactions]);
    };

    const totalBalance = transactions.reduce((acc, t) => {
        return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-8">
                Financial Tracker
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            ${totalBalance.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            ${totalIncome.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            ${totalExpenses.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-8">
                <AddTransactionForm onSubmit={handleAddTransaction} />
            </div>

            <TransactionList transactions={transactions} />
        </div>
    );
}
