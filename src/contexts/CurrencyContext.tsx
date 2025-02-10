"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Currency = {
    code: string;
    symbol: string;
    name: string;
    rate: number; // Exchange rate relative to USD
};

type CurrencyContextType = {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatAmount: (amount: number) => string;
    convertAmount: (
        amount: number,
        fromCurrency: Currency,
        toCurrency: Currency
    ) => number;
};

const currencies: Currency[] = [
    {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        rate: 1, // Base currency
    },
    {
        code: "EUR",
        symbol: "€",
        name: "Euro",
        rate: 0.93, // 1 USD = 0.93 EUR
    },
    {
        code: "PHP",
        symbol: "₱",
        name: "Philippine Peso",
        rate: 56.12, // 1 USD = 56.12 PHP
    },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to USD

    // Convert amount between currencies
    const convertAmount = (
        amount: number,
        fromCurrency: Currency,
        toCurrency: Currency
    ) => {
        // First convert to USD (base currency)
        const usdAmount = amount / fromCurrency.rate;
        // Then convert from USD to target currency
        return usdAmount * toCurrency.rate;
    };

    const formatAmount = (amount: number) => {
        // Convert the amount from USD to the selected currency
        const convertedAmount = convertAmount(amount, currencies[0], currency);

        // Format with commas and 2 decimal places
        const formattedNumber = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(convertedAmount);

        return `${currency.symbol}${formattedNumber}`;
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatAmount,
                convertAmount,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}

export { currencies };
