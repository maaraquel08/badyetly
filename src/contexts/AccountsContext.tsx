"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Account } from "@/types";

type AccountsContextType = {
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
};

const AccountsContext = createContext<AccountsContextType | undefined>(
    undefined
);

export function AccountsProvider({ children }: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<Account[]>([
        { id: "1", name: "Cash Wallet", type: "cash", balance: 0 },
        { id: "2", name: "Main Bank", type: "bank", balance: 0 },
        { id: "3", name: "Credit Card", type: "credit-card", balance: 0 },
    ]);

    return (
        <AccountsContext.Provider value={{ accounts, setAccounts }}>
            {children}
        </AccountsContext.Provider>
    );
}

export function useAccounts() {
    const context = useContext(AccountsContext);
    if (context === undefined) {
        throw new Error("useAccounts must be used within an AccountsProvider");
    }
    return context;
}
