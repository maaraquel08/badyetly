export type AccountType = "cash" | "bank" | "credit-card";

export type Account = {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
};

export type Transaction = {
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    accountId: string; // Link transaction to account
};
