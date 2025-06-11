"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnalyticsCardsProps {
    dueInstances: any[];
}

export function AnalyticsCards({ dueInstances }: AnalyticsCardsProps) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filter dues for current month only
    const currentMonthDues = dueInstances.filter((due) => {
        const dueDate = new Date(due.due_date);
        return (
            dueDate.getMonth() === currentMonth &&
            dueDate.getFullYear() === currentYear
        );
    });

    // Calculate analytics
    const analytics = {
        totalMonthlyAmount: currentMonthDues.reduce(
            (sum, due) => sum + due.monthly_dues.amount,
            0
        ),

        paidAmount: currentMonthDues
            .filter((due) => due.is_paid)
            .reduce((sum, due) => sum + due.monthly_dues.amount, 0),

        overdueCount: dueInstances.filter((due) => {
            const dueDate = new Date(due.due_date);
            return dueDate < today && !due.is_paid;
        }).length,

        overdueAmount: dueInstances
            .filter((due) => {
                const dueDate = new Date(due.due_date);
                return dueDate < today && !due.is_paid;
            })
            .reduce((sum, due) => sum + due.monthly_dues.amount, 0),

        upcomingThisWeek: dueInstances.filter((due) => {
            const dueDate = new Date(due.due_date);
            const weekFromNow = new Date(
                today.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            return dueDate >= today && dueDate <= weekFromNow && !due.is_paid;
        }).length,
    };

    const paymentRate =
        analytics.totalMonthlyAmount > 0
            ? (analytics.paidAmount / analytics.totalMonthlyAmount) * 100
            : 0;

    const remainingAmount = analytics.totalMonthlyAmount - analytics.paidAmount;

    // Count of bills for current month
    const totalBillsThisMonth = currentMonthDues.length;
    const paidBillsThisMonth = currentMonthDues.filter(
        (due) => due.is_paid
    ).length;

    return (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {/* Total Monthly Bills - Takes 2 columns on mobile for prominence */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">
                        Total This Month
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3 md:pb-6">
                    <div className="text-lg md:text-2xl font-bold">
                        {formatCurrency(analytics.totalMonthlyAmount)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className="block md:inline">
                            {formatCurrency(analytics.paidAmount)} paid
                        </span>
                        <span className="hidden md:inline"> • </span>
                        <span className="block md:inline">
                            {formatCurrency(remainingAmount)} remaining
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Payment Progress - Compact on mobile */}
            <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">
                        Progress
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3 md:pb-6">
                    <div className="text-lg md:text-2xl font-bold">
                        {paymentRate.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mt-1 md:mt-2">
                        <div
                            className="bg-green-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(paymentRate, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                        {paidBillsThisMonth} of {totalBillsThisMonth} bills paid
                    </p>
                </CardContent>
            </Card>

            {/* Overdue Bills - Compact */}
            <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">
                        Overdue
                    </CardTitle>
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                </CardHeader>
                <CardContent className="pb-3 md:pb-6">
                    <div className="text-lg md:text-2xl font-bold text-red-600">
                        {analytics.overdueCount}
                    </div>
                    <p className="text-xs text-muted-foreground hidden md:block">
                        {formatCurrency(analytics.overdueAmount)} total
                    </p>
                    <p className="text-xs text-muted-foreground md:hidden">
                        {analytics.overdueAmount > 0
                            ? formatCurrency(analytics.overdueAmount)
                            : "None"}
                    </p>
                </CardContent>
            </Card>

            {/* Upcoming This Week - Spans 2 columns on mobile for balance */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">
                        Due This Week
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3 md:pb-6">
                    <div className="text-lg md:text-2xl font-bold text-amber-600">
                        {analytics.upcomingThisWeek}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="md:hidden">
                            {analytics.upcomingThisWeek === 0
                                ? "All caught up!"
                                : "bills coming up"}
                        </span>
                        <span className="hidden md:inline">
                            Bills due in the next 7 days
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
