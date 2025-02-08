import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Transaction = {
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
};

type TransactionListProps = {
    transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div>
                                <p className="font-medium">
                                    {transaction.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        transaction.date
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <p
                                className={`font-bold ${
                                    transaction.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {transaction.type === "income" ? "+" : "-"}$
                                {transaction.amount}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
