"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Account } from "@/types";
import { AccountIcon } from "./AccountIcon";

type AccountSelectorProps = {
    accounts: Account[];
    selectedAccountId: string;
    onSelectAccount: (accountId: string) => void;
};

export function AccountSelector({
    accounts,
    selectedAccountId,
    onSelectAccount,
}: AccountSelectorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Account</CardTitle>
            </CardHeader>
            <CardContent>
                <Select
                    value={selectedAccountId}
                    onValueChange={onSelectAccount}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
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
            </CardContent>
        </Card>
    );
}
