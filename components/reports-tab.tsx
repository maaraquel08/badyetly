"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { DueInstance } from "@/components/dashboard-calendar/types";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface ReportsTabProps {
    dueInstances: DueInstance[];
    viewingDate?: Date;
}

interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    count: number;
}

interface TypeBreakdown {
    type: string;
    amount: number;
    percentage: number;
}

export function ReportsTab({ dueInstances, viewingDate }: ReportsTabProps) {
    const { user } = useAuth();
    const [monthlySalary, setMonthlySalary] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const today = new Date();
    const safeViewingDate = viewingDate || today;
    const currentMonth = safeViewingDate.getMonth();
    const currentYear = safeViewingDate.getFullYear();

    useEffect(() => {
        const fetchSalary = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("monthly_salary")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setMonthlySalary(data.monthly_salary);
                }
            } catch (error) {
                console.error("Error fetching salary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalary();
    }, [user, supabase]);

    // Filter dues for current month only
    const currentMonthDues = dueInstances.filter((due) => {
        const dueDate = new Date(due.due_date);
        return (
            dueDate.getMonth() === currentMonth &&
            dueDate.getFullYear() === currentYear
        );
    });

    // Helper function to get amount
    const getAmount = (due: DueInstance) => {
        if (due.paid_amount !== null && due.paid_amount !== undefined) {
            return due.paid_amount;
        }
        return due.monthly_dues?.amount || 0;
    };

    // Calculate category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>();

    currentMonthDues.forEach((due) => {
        const category = due.monthly_dues?.category || "other";
        const amount = getAmount(due);
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
            amount: existing.amount + amount,
            count: existing.count + 1,
        });
    });

    const categoryBreakdown: CategoryBreakdown[] = Array.from(
        categoryMap.entries()
    )
        .map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: 0, // Will calculate after total
            count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount);

    // Calculate type breakdown (Expenses vs Savings/Investment)
    let totalExpenses = 0;
    let totalSavings = 0;
    let totalInvestment = 0;

    currentMonthDues.forEach((due) => {
        const category = due.monthly_dues?.category?.toLowerCase() || "";
        const amount = getAmount(due);

        if (category === "savings") {
            // Savings is treated as negative (reduces expenses)
            totalSavings += amount;
        } else if (category === "investment") {
            // Investment is treated as negative (reduces expenses)
            totalInvestment += amount;
        } else {
            totalExpenses += amount;
        }
    });

    const totalSavingsAndInvestment = totalSavings + totalInvestment;

    // Calculate percentages for categories
    const totalForCategories = totalExpenses + totalSavingsAndInvestment;
    categoryBreakdown.forEach((item) => {
        item.percentage =
            totalForCategories > 0
                ? (item.amount / totalForCategories) * 100
                : 0;
    });

    // Type breakdown
    const typeBreakdown: TypeBreakdown[] = [
        {
            type: "Expenses",
            amount: totalExpenses,
            percentage:
                monthlySalary && monthlySalary > 0
                    ? (totalExpenses / monthlySalary) * 100
                    : 0,
        },
        {
            type: "Savings",
            amount: totalSavings,
            percentage:
                monthlySalary && monthlySalary > 0
                    ? (totalSavings / monthlySalary) * 100
                    : 0,
        },
        {
            type: "Investment",
            amount: totalInvestment,
            percentage:
                monthlySalary && monthlySalary > 0
                    ? (totalInvestment / monthlySalary) * 100
                    : 0,
        },
    ];

    // Remaining Income = Monthly Salary - Total Expenses - Savings - Investment
    const remainingIncome =
        monthlySalary !== null
            ? monthlySalary - totalExpenses - totalSavings - totalInvestment
            : null;

    // Chart colors
    const categoryColors: Record<string, string> = {
        utilities: "#3b82f6", // blue
        loan: "#f59e0b", // amber
        cards: "#6366f1", // indigo
        savings: "#10b981", // emerald
        investment: "#14b8a6", // teal
        subscription: "#a855f7", // purple
        phone: "#22c55e", // green
        internet: "#22c55e", // green
        insurance: "#ef4444", // red
        other: "#6b7280", // gray
    };

    const getCategoryColor = (category: string) => {
        return categoryColors[category.toLowerCase()] || "#6b7280";
    };

    // Prepare data for pie chart
    const pieChartData = categoryBreakdown.map((item) => ({
        name:
            item.category.charAt(0).toUpperCase() +
            item.category.slice(1).replace(/_/g, " "),
        value: Math.abs(item.amount),
        category: item.category,
        fill: getCategoryColor(item.category),
    }));

    // Prepare data for bar chart
    const barChartData = typeBreakdown.map((item) => ({
        name: item.type,
        amount: item.amount,
        percentage: item.percentage,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Salary
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {monthlySalary !== null
                                ? formatCurrency(monthlySalary)
                                : "Not set"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {monthlySalary === null &&
                                "Set your salary in Settings"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Expenses
                        </CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {monthlySalary && monthlySalary > 0
                                ? `${(
                                      (totalExpenses / monthlySalary) *
                                      100
                                  ).toFixed(1)}% of salary`
                                : "All expenses"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Savings
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(totalSavings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {monthlySalary && monthlySalary > 0
                                ? `${(
                                      (totalSavings / monthlySalary) *
                                      100
                                  ).toFixed(1)}% of salary`
                                : "Savings this month"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Investment
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-teal-600">
                            {formatCurrency(totalInvestment)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {monthlySalary && monthlySalary > 0
                                ? `${(
                                      (totalInvestment / monthlySalary) *
                                      100
                                  ).toFixed(1)}% of salary`
                                : "Investment this month"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Remaining Income
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                remainingIncome !== null && remainingIncome < 0
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}
                        >
                            {remainingIncome !== null
                                ? formatCurrency(remainingIncome)
                                : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {remainingIncome !== null &&
                                remainingIncome < 0 &&
                                "Over budget"}
                            {remainingIncome !== null &&
                                remainingIncome >= 0 &&
                                "Available"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Category Breakdown Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pieChartData.length > 0 ? (
                            <ChartContainer
                                config={{}}
                                className="h-[300px] w-full !aspect-auto"
                            >
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(
                                                0
                                            )}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value) =>
                                                    formatCurrency(
                                                        value as number
                                                    )
                                                }
                                            />
                                        }
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data for this month
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Type Breakdown Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses vs Savings vs Investment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {barChartData.length > 0 ? (
                            <ChartContainer
                                config={{}}
                                className="h-[300px] w-full !aspect-auto"
                            >
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value) =>
                                                    formatCurrency(
                                                        value as number
                                                    )
                                                }
                                            />
                                        }
                                    />
                                    <Bar
                                        dataKey="amount"
                                        radius={[4, 4, 0, 0]}
                                        fill="#8884d8"
                                    >
                                        {barChartData.map((entry, index) => (
                                            <Cell
                                                key={`bar-cell-${index}`}
                                                fill={
                                                    entry.name === "Expenses"
                                                        ? "#ef4444"
                                                        : entry.name ===
                                                          "Savings"
                                                        ? "#10b981"
                                                        : "#14b8a6"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No data for this month
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Category List */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {categoryBreakdown.length > 0 ? (
                        <div className="space-y-4">
                            {categoryBreakdown.map((item) => (
                                <div
                                    key={item.category}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{
                                                backgroundColor:
                                                    getCategoryColor(
                                                        item.category
                                                    ),
                                            }}
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {item.category
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    item.category
                                                        .slice(1)
                                                        .replace(/_/g, " ")}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.count} due
                                                {item.count !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {formatCurrency(item.amount)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No dues for this month
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
