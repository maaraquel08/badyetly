"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Transaction,
    Account,
    TransactionType,
    IncomeCategory,
    ExpenseCategory,
    TransferCategory,
} from "@/types";
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
import {
    Briefcase,
    Gift,
    RotateCcw,
    Building2,
    Laptop,
    TrendingUp,
    MoreHorizontal,
    Utensils,
    Bus,
    Home,
    Lightbulb,
    Heart,
    Film,
    ShoppingBag,
    GraduationCap,
    CreditCard,
    Shield,
    PiggyBank,
    ArrowRightLeft,
    Wallet,
    Repeat,
    HandCoins,
} from "lucide-react";

type AddTransactionFormProps = {
    onSubmit: (transaction: Transaction) => void;
    accounts: Account[];
};

const incomeCategories: {
    value: IncomeCategory;
    label: string;
    icon: JSX.Element;
}[] = [
    {
        value: "salary",
        label: "Salary",
        icon: <Briefcase className="h-4 w-4" />,
    },
    {
        value: "freelance",
        label: "Freelance",
        icon: <Laptop className="h-4 w-4" />,
    },
    {
        value: "investment",
        label: "Investment",
        icon: <TrendingUp className="h-4 w-4" />,
    },
    {
        value: "business",
        label: "Business",
        icon: <Building2 className="h-4 w-4" />,
    },
    { value: "gift", label: "Gift", icon: <Gift className="h-4 w-4" /> },
    {
        value: "refund",
        label: "Refund",
        icon: <RotateCcw className="h-4 w-4" />,
    },
    {
        value: "other",
        label: "Other",
        icon: <MoreHorizontal className="h-4 w-4" />,
    },
];

const expenseCategories: {
    value: ExpenseCategory;
    label: string;
    icon: JSX.Element;
}[] = [
    {
        value: "food",
        label: "Food & Dining",
        icon: <Utensils className="h-4 w-4" />,
    },
    {
        value: "transportation",
        label: "Transportation",
        icon: <Bus className="h-4 w-4" />,
    },
    {
        value: "housing",
        label: "Housing",
        icon: <Home className="h-4 w-4" />,
    },
    {
        value: "utilities",
        label: "Utilities",
        icon: <Lightbulb className="h-4 w-4" />,
    },
    {
        value: "healthcare",
        label: "Healthcare",
        icon: <Heart className="h-4 w-4" />,
    },
    {
        value: "entertainment",
        label: "Entertainment",
        icon: <Film className="h-4 w-4" />,
    },
    {
        value: "shopping",
        label: "Shopping",
        icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
        value: "education",
        label: "Education",
        icon: <GraduationCap className="h-4 w-4" />,
    },
    {
        value: "debt",
        label: "Debt Payment",
        icon: <CreditCard className="h-4 w-4" />,
    },
    {
        value: "insurance",
        label: "Insurance",
        icon: <Shield className="h-4 w-4" />,
    },
    {
        value: "savings",
        label: "Savings",
        icon: <PiggyBank className="h-4 w-4" />,
    },
    {
        value: "other",
        label: "Other",
        icon: <MoreHorizontal className="h-4 w-4" />,
    },
];

const transferCategories: {
    value: TransferCategory;
    label: string;
    icon: JSX.Element;
}[] = [
    {
        value: "regular-transfer",
        label: "Regular Transfer",
        icon: <ArrowRightLeft className="h-4 w-4" />,
    },
    {
        value: "savings",
        label: "Savings Transfer",
        icon: <PiggyBank className="h-4 w-4" />,
    },
    {
        value: "investment",
        label: "Investment Transfer",
        icon: <TrendingUp className="h-4 w-4" />,
    },
    {
        value: "debt-payment",
        label: "Debt Payment",
        icon: <CreditCard className="h-4 w-4" />,
    },
    {
        value: "reimbursement",
        label: "Reimbursement",
        icon: <HandCoins className="h-4 w-4" />,
    },
    {
        value: "other",
        label: "Other Transfer",
        icon: <MoreHorizontal className="h-4 w-4" />,
    },
];

export function AddTransactionForm({
    onSubmit,
    accounts,
}: AddTransactionFormProps) {
    const { currency, convertAmount } = useCurrency();
    const [amount, setAmount] = useState("");
    const [transferFee, setTransferFee] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<TransactionType>("income");
    const [category, setCategory] = useState<
        IncomeCategory | ExpenseCategory | TransferCategory | ""
    >("");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [toAccountId, setToAccountId] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAccountId || (type === "transfer" && !toAccountId)) {
            return;
        }

        const amountInUSD = convertAmount(
            parseFloat(amount),
            currency,
            currencies[0]
        );

        const feeInUSD =
            type === "transfer" && transferFee
                ? convertAmount(
                      parseFloat(transferFee),
                      currency,
                      currencies[0]
                  )
                : 0;

        const transaction: Transaction = {
            type,
            amount: amountInUSD,
            description,
            date: date.toISOString(),
            accountId: selectedAccountId,
            ...(type === "transfer" && {
                toAccountId,
                transferFee: feeInUSD,
            }),
            ...(category && { category }),
        };

        onSubmit(transaction);
        setAmount("");
        setTransferFee("");
        setDescription("");
        setToAccountId("");
        setCategory("");
    };

    const getCategoryContent = () => {
        switch (type) {
            case "income":
                return {
                    categories: incomeCategories,
                    placeholder: "Select Income Category",
                };
            case "expense":
                return {
                    categories: expenseCategories,
                    placeholder: "Select Expense Category",
                };
            case "transfer":
                return {
                    categories: transferCategories,
                    placeholder: "Select Transfer Type",
                };
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
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
                <Button
                    type="button"
                    variant={type === "transfer" ? "default" : "outline"}
                    onClick={() => setType("transfer")}
                    className="flex-1"
                >
                    Transfer
                </Button>
            </div>

            <div className="space-y-2">
                <Select
                    value={selectedAccountId}
                    onValueChange={setSelectedAccountId}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                type === "transfer"
                                    ? "From Account"
                                    : "Select Account"
                            }
                        />
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

            {type === "transfer" && (
                <div className="space-y-2">
                    <Select value={toAccountId} onValueChange={setToAccountId}>
                        <SelectTrigger>
                            <SelectValue placeholder="To Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts
                                .filter((acc) => acc.id !== selectedAccountId)
                                .map((account) => (
                                    <SelectItem
                                        key={account.id}
                                        value={account.id}
                                    >
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
            )}

            <div className="space-y-2">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue
                            placeholder={getCategoryContent().placeholder}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {getCategoryContent().categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                                <div className="flex items-center gap-2">
                                    {cat.icon}
                                    <span>{cat.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currency.symbol}
                    </div>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-7"
                        required
                    />
                </div>
            </div>

            {type === "transfer" && (
                <div className="space-y-2">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currency.symbol}
                        </div>
                        <Input
                            type="number"
                            placeholder="Transfer Fee (optional)"
                            value={transferFee}
                            onChange={(e) => setTransferFee(e.target.value)}
                            className="pl-7"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Enter any bank charges or transfer fees
                    </p>
                </div>
            )}

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
                disabled={
                    !selectedAccountId || (type === "transfer" && !toAccountId)
                }
            >
                Add Transaction
            </Button>
        </form>
    );
}
