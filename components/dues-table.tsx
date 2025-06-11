"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DuesTableProps {
    dues: any[];
    isLoading: boolean;
}

export function DuesTable({ dues, isLoading }: DuesTableProps) {
    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case "utilities":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "loan":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            case "subscription":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
            case "phone":
            case "internet":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "paused":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            case "canceled":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getRecurrenceText = (due: any) => {
        const frequency = due.recurrence_frequency || 1;
        const frequencyText = frequency > 1 ? `Every ${frequency} ` : "";

        switch (due.recurrence?.toLowerCase()) {
            case "weekly":
                return `${frequencyText}${frequency > 1 ? "weeks" : "Weekly"}`;
            case "biweekly":
                return `${frequencyText}${
                    frequency > 1 ? "bi-weeks" : "Bi-weekly"
                }`;
            case "monthly":
                return `${frequencyText}${
                    frequency > 1 ? "months" : "Monthly"
                }`;
            case "quarterly":
                return `${frequencyText}${
                    frequency > 1 ? "quarters" : "Quarterly"
                }`;
            case "annually":
                return `${frequencyText}${
                    frequency > 1 ? "years" : "Annually"
                }`;
            default:
                return "Monthly";
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                        Loading monthly dues...
                    </p>
                </div>
            </Card>
        );
    }

    if (dues.length === 0) {
        return (
            <Card className="p-6">
                <div className="flex flex-col items-center justify-center h-32 space-y-4">
                    <p className="text-muted-foreground">
                        You don't have any monthly dues yet.
                    </p>
                    <Link href="/dashboard/dues/new">
                        <Button>Add Your First Due</Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">
                            Category
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Due Day
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Recurrence
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                            Status
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dues.map((due) => (
                        <TableRow key={due.id}>
                            <TableCell className="font-medium">
                                {due.title}
                            </TableCell>
                            <TableCell>{formatCurrency(due.amount)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge
                                    variant="outline"
                                    className={getCategoryColor(due.category)}
                                >
                                    {due.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {due.due_day ||
                                    new Date(due.start_date).getDate()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {getRecurrenceText(due)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge
                                    variant="outline"
                                    className={getStatusColor(due.status)}
                                >
                                    {due.status || "Active"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/dashboard/dues/${due.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
