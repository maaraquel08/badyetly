"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Account, AccountType } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AccountIcon } from "./AccountIcon";
import { currencies, useCurrency } from "@/contexts/CurrencyContext";

type AddAccountFormProps = {
    onSubmit: (account: Omit<Account, "id">) => void;
    onSuccess?: () => void;
};

export function AddAccountForm({ onSubmit, onSuccess }: AddAccountFormProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<AccountType | "">("");
    const [initialBalance, setInitialBalance] = useState("");
    const { currency, convertAmount } = useCurrency();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!type) return;

        // Convert initial balance to USD before saving
        const balanceInUSD = convertAmount(
            parseFloat(initialBalance || "0"),
            currency,
            currencies[0] // USD is our base currency
        );

        onSubmit({
            name,
            type,
            balance: balanceInUSD,
        });

        // Reset form
        setName("");
        setType("");
        setInitialBalance("");

        // Call onSuccess callback
        onSuccess?.();
    };

    const accountTypes: { value: AccountType; label: string }[] = [
        { value: "cash", label: "Cash" },
        { value: "bank", label: "Bank Account" },
        { value: "credit-card", label: "Credit Card" },
        { value: "investment", label: "Investment" },
        { value: "savings", label: "Savings" },
        { value: "digital-wallet", label: "Digital Wallet" },
        { value: "crypto", label: "Cryptocurrency" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Input
                    placeholder="Account Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {accountTypes.map((accountType) => (
                            <SelectItem
                                key={accountType.value}
                                value={accountType.value}
                            >
                                <div className="flex items-center gap-2">
                                    <AccountIcon
                                        type={accountType.value}
                                        className="h-4 w-4"
                                    />
                                    <span>{accountType.label}</span>
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
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="pl-7"
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={!type || !name}>
                Add Account
            </Button>
        </form>
    );
}
