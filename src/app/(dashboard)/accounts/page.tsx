"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Account, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { AccountIcon } from "@/components/features/accounts/AccountIcon";
import { Plus } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AddTransactionForm } from "@/components/features/transactions/AddTransactionForm";
import { TransactionList } from "@/components/features/transactions/TransactionList";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([
        { id: "1", name: "Cash Wallet", type: "cash", balance: 0 },
        { id: "2", name: "Main Bank", type: "bank", balance: 0 },
        { id: "3", name: "Credit Card", type: "credit-card", balance: 0 },
    ]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { formatAmount } = useCurrency();

    const handleAddTransaction = (transaction: Transaction) => {
        // Add the transaction
        setTransactions((prev) => [transaction, ...prev]);

        // Update the account balance
        setAccounts((prevAccounts) =>
            prevAccounts.map((account) => {
                if (account.id === transaction.accountId) {
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
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                    Accounts
                </h1>
                <div className="flex items-center gap-4">
                    <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                    </Button>
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Transaction
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[360px]">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                    <Card key={account.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {account.name}
                            </CardTitle>
                            <AccountIcon type={account.type} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatAmount(account.balance)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {account.type.charAt(0).toUpperCase() +
                                    account.type.slice(1)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
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
