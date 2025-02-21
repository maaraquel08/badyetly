"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionList } from "@/components/features/transactions/TransactionList";
import { Transaction, Account } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AddTransactionForm } from "@/components/features/transactions/AddTransactionForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AnimatePresence } from "framer-motion";
import { useAccounts } from "@/contexts/AccountsContext";

export default function DashboardPage() {
    const { accounts, setAccounts } = useAccounts();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { formatAmount } = useCurrency();

    // Calculate totals
    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const handleAddTransaction = (transaction: Transaction) => {
        // Add the transaction
        setTransactions((prev) => [transaction, ...prev]);

        // Update the account balances
        setAccounts((prevAccounts) =>
            prevAccounts.map((account) => {
                if (transaction.type === "transfer") {
                    if (account.id === transaction.accountId) {
                        // Deduct from source account
                        return {
                            ...account,
                            balance: account.balance - transaction.amount,
                        };
                    }
                    if (account.id === transaction.toAccountId) {
                        // Add to destination account
                        return {
                            ...account,
                            balance: account.balance + transaction.amount,
                        };
                    }
                } else if (account.id === transaction.accountId) {
                    // Handle regular income/expense
                    return {
                        ...account,
                        balance:
                            account.balance +
                            (transaction.type === "income"
                                ? transaction.amount
                                : -transaction.amount),
                    };
                }
                return account;
            })
        );

        setSheetOpen(false);
    };

    const handleDeleteTransaction = (index: number) => {
        const transaction = transactions[index];

        // Remove the transaction
        setTransactions((prev) => prev.filter((_, i) => i !== index));

        // Reverse the account balance update
        setAccounts((prevAccounts) =>
            prevAccounts.map((account) => {
                if (account.id === transaction.accountId) {
                    return {
                        ...account,
                        balance:
                            account.balance -
                            (transaction.type === "income"
                                ? transaction.amount
                                : -transaction.amount),
                    };
                }
                return account;
            })
        );
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    Dashboard
                </h1>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add Transaction</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                            <AddTransactionForm
                                onSubmit={handleAddTransaction}
                                accounts={accounts}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatAmount(
                                accounts.reduce(
                                    (sum, acc) => sum + acc.balance,
                                    0
                                )
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {formatAmount(income)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {formatAmount(expenses)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <TransactionList
                        transactions={transactions}
                        accounts={accounts}
                        onDelete={handleDeleteTransaction}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
