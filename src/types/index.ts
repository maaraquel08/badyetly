export type AccountType = "cash" | "bank" | "credit-card";

export type Account = {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
};

export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    accountId: string;
    toAccountId?: string; // For transfer transactions
};
