"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Transaction, Account } from "@/types";
import { AccountIcon } from "@/components/features/accounts/AccountIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";

type TransactionListProps = {
    transactions: Transaction[];
    accounts: Account[];
    onDelete?: (index: number) => void;
    onEdit?: (index: number, transaction: Transaction) => void;
};

export function TransactionList({
    transactions,
    accounts,
    onDelete,
    onEdit,
}: TransactionListProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { formatAmount } = useCurrency();

    const getAccount = (accountId: string) => {
        return accounts.find((account) => account.id === accountId);
    };

    const getBalanceBeforeTransaction = (
        transaction: Transaction,
        index: number
    ) => {
        // Get all previous transactions for this account
        const previousTransactions = transactions
            .slice(index + 1)
            .filter((t) => t.accountId === transaction.accountId);

        // Calculate the current balance for this account
        const account = getAccount(transaction.accountId);
        if (!account) return 0;

        // Start with current account balance
        let balance = account.balance;

        // Add back all transactions that came after this one
        for (const tx of transactions.slice(0, index + 1)) {
            if (tx.accountId === transaction.accountId) {
                balance -= tx.type === "income" ? tx.amount : -tx.amount;
            }
        }

        return balance;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short", // "Mar"
            day: "numeric", // "1"
            year: "numeric", // "2024"
        });
    };

    const getTransactionDisplay = (transaction: Transaction) => {
        const account = getAccount(transaction.accountId);

        if (transaction.type === "transfer" && transaction.toAccountId) {
            const toAccount = getAccount(transaction.toAccountId);
            return {
                color: "text-blue-600",
                prefix: "→",
                accountDisplay: (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <AccountIcon
                                type={account?.type || "bank"}
                                className="h-3.5 w-3.5"
                            />
                            <span>{account?.name}</span>
                        </div>
                        <span className="px-2">→</span>
                        <div className="flex items-center gap-1.5">
                            <AccountIcon
                                type={toAccount?.type || "bank"}
                                className="h-3.5 w-3.5"
                            />
                            <span>{toAccount?.name}</span>
                        </div>
                    </div>
                ),
            };
        }

        return {
            color:
                transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600",
            prefix: transaction.type === "income" ? "+" : "-",
            accountDisplay: account && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <AccountIcon type={account.type} className="h-3.5 w-3.5" />
                    <span>{account.name}</span>
                </div>
            ),
        };
    };

    if (transactions.length === 0) {
        return <p className="text-muted-foreground">No transactions yet</p>;
    }

    return (
        <div className="space-y-4">
            <AnimatePresence initial={false}>
                {transactions.map((transaction, index) => {
                    const balanceBefore = getBalanceBeforeTransaction(
                        transaction,
                        index
                    );
                    const display = getTransactionDisplay(transaction);

                    return (
                        <motion.div
                            key={transaction.date + transaction.description}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                opacity: { duration: 0.2 },
                            }}
                        >
                            <motion.div
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                exit={{ y: 20 }}
                                className="flex items-center gap-2"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex-1 p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {transaction.description}
                                            </p>
                                            {display.accountDisplay}
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p
                                                className={`font-bold ${display.color}`}
                                            >
                                                {display.prefix}
                                                {formatAmount(
                                                    transaction.amount
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Before:{" "}
                                                {formatAmount(balanceBefore)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {hoveredIndex === index &&
                                        (onDelete || onEdit) && (
                                            <motion.div
                                                initial={{
                                                    width: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    width: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex gap-2 overflow-hidden"
                                            >
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onEdit(
                                                                index,
                                                                transaction
                                                            )
                                                        }
                                                        className="shrink-0 h-8 w-8 p-0"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onDelete(index)
                                                        }
                                                        className="shrink-0 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </motion.div>
                                        )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
