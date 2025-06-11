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
import { Pencil, Calendar, DollarSign, Tag, Repeat } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DuesTableProps {
    dues: any[];
    isLoading: boolean;
}

export function DuesTable({ dues, isLoading }: DuesTableProps) {
    const getCategoryColor = (category: string) => {
        switch (category?.toLowerCase()) {
            case "utilities":
                return "bg-blue-100 text-blue-800";
            case "loan":
                return "bg-amber-100 text-amber-800";
            case "subscription":
                return "bg-purple-100 text-purple-800";
            case "phone":
            case "internet":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800";
            case "paused":
                return "bg-amber-100 text-amber-800";
            case "canceled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
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
        <div>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {dues.map((due) => (
                    <Card key={due.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                {/* Title and Amount */}
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-base">
                                        {due.title}
                                    </h3>
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(due.amount)}
                                    </span>
                                </div>

                                {/* Category and Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className={getCategoryColor(
                                            due.category
                                        )}
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {due.category}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={getStatusColor(due.status)}
                                    >
                                        {due.status || "Active"}
                                    </Badge>
                                </div>

                                {/* Due Day and Recurrence */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            Due{" "}
                                            {due.due_day ||
                                                new Date(
                                                    due.start_date
                                                ).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Repeat className="w-3 h-3" />
                                        <span>{getRecurrenceText(due)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="ml-4">
                                <Link href={`/dashboard/dues/${due.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Due Day</TableHead>
                            <TableHead>Recurrence</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dues.map((due) => (
                            <TableRow key={due.id}>
                                <TableCell className="font-medium">
                                    {due.title}
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(due.amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={getCategoryColor(
                                            due.category
                                        )}
                                    >
                                        {due.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {due.due_day ||
                                        new Date(due.start_date).getDate()}
                                </TableCell>
                                <TableCell>{getRecurrenceText(due)}</TableCell>
                                <TableCell>
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
                                            <span className="sr-only">
                                                Edit
                                            </span>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
