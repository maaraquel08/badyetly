"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";

export function CurrencySelector() {
    const { currency, setCurrency } = useCurrency();

    return (
        <Select
            value={currency.code}
            onValueChange={(code) => {
                const newCurrency = currencies.find((c) => c.code === code);
                if (newCurrency) {
                    setCurrency(newCurrency);
                }
            }}
        >
            <SelectTrigger className="w-[130px]">
                <SelectValue>
                    {currency.code} ({currency.symbol})
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {currencies.map((currency) => (
                    <SelectItem
                        key={currency.code}
                        value={currency.code}
                        className="flex items-center gap-2"
                    >
                        <span>
                            {currency.code} ({currency.symbol})
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
