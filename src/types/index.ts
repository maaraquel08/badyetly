export type AccountType =
    | "cash"
    | "bank"
    | "credit-card"
    | "investment"
    | "savings"
    | "digital-wallet"
    | "crypto";

export type Account = {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
};

export type TransactionType = "income" | "expense" | "transfer";

export type IncomeCategory =
    | "salary"
    | "freelance"
    | "investment"
    | "business"
    | "gift"
    | "refund"
    | "other";

export type ExpenseCategory =
    | "food"
    | "transportation"
    | "housing"
    | "utilities"
    | "healthcare"
    | "entertainment"
    | "shopping"
    | "education"
    | "debt"
    | "insurance"
    | "savings"
    | "other";

export type TransferCategory =
    | "regular-transfer"
    | "savings"
    | "investment"
    | "debt-payment"
    | "reimbursement"
    | "other";

export type Transaction = {
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    accountId: string;
    toAccountId?: string;
    category?: IncomeCategory | ExpenseCategory | TransferCategory;
    transferFee?: number;
};
