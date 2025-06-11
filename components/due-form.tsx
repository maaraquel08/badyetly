"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Repeat, Info } from "lucide-react";
import {
    format,
    addMonths,
    addWeeks,
    addYears,
    isValid,
    parseISO,
} from "date-fns";

interface DueFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    initialData?: any;
    isEditing?: boolean;
}

export function DueForm({
    onSubmit,
    isSubmitting,
    initialData,
    isEditing = false,
}: DueFormProps) {
    const searchParams = useSearchParams();
    const preselectedDate = searchParams.get("date");

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        start_date: preselectedDate || format(new Date(), "yyyy-MM-dd"),
        recurrence: "monthly",
        recurrence_frequency: "1",
        due_day: "",
        status: "active",
        notes: "",
        end_type: "never", // "never", "after_date", "after_occurrences"
        end_date: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
        occurrences: "12",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                start_date: initialData.start_date
                    ? format(new Date(initialData.start_date), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd"),
                end_date: initialData.end_date
                    ? format(new Date(initialData.end_date), "yyyy-MM-dd")
                    : format(addMonths(new Date(), 12), "yyyy-MM-dd"),
                amount: initialData.amount?.toString() || "",
                due_day: initialData.due_day?.toString() || "",
                recurrence_frequency:
                    initialData.recurrence_frequency?.toString() || "1",
                occurrences: initialData.occurrences?.toString() || "12",
                end_type: initialData.end_type || "never",
            });
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format the data
        const formattedData = {
            ...formData,
            amount: Number.parseFloat(formData.amount),
            due_day: formData.due_day
                ? Number.parseInt(formData.due_day)
                : new Date(formData.start_date).getDate(),
            recurrence_frequency: Number.parseInt(
                formData.recurrence_frequency
            ),
            occurrences:
                formData.end_type === "after_occurrences"
                    ? Number.parseInt(formData.occurrences)
                    : undefined,
            end_date:
                formData.end_type === "after_date"
                    ? formData.end_date
                    : undefined,
        };

        onSubmit(formattedData);
    };

    // Helper function to safely create a date
    const safeCreateDate = (dateString: string) => {
        try {
            if (!dateString) return new Date();
            const date = parseISO(dateString);
            return isValid(date) ? date : new Date();
        } catch {
            return new Date();
        }
    };

    // Helper function to safely set day of month
    const safeSetDayOfMonth = (date: Date, day: string) => {
        try {
            const newDate = new Date(date);
            const targetDay = Number.parseInt(day);

            if (targetDay < 1 || targetDay > 31) return newDate;

            // Get the last day of the month
            const lastDayOfMonth = new Date(
                newDate.getFullYear(),
                newDate.getMonth() + 1,
                0
            ).getDate();

            // Use the minimum of target day and last day of month
            newDate.setDate(Math.min(targetDay, lastDayOfMonth));

            return isValid(newDate) ? newDate : date;
        } catch {
            return date;
        }
    };

    // Helper functions for recurrence preview
    const getRecurrenceText = () => {
        const frequency = Number.parseInt(formData.recurrence_frequency) || 1;
        const baseText = frequency === 1 ? "" : `Every ${frequency} `;

        switch (formData.recurrence) {
            case "weekly":
                return `${baseText}${frequency === 1 ? "Weekly" : "weeks"}`;
            case "biweekly":
                return `${baseText}${
                    frequency === 1 ? "Every 2 weeks" : "bi-weeks"
                }`;
            case "monthly":
                return `${baseText}${frequency === 1 ? "Monthly" : "months"}`;
            case "quarterly":
                return `${baseText}${
                    frequency === 1 ? "Every 3 months" : "quarters"
                }`;
            case "annually":
                return `${baseText}${frequency === 1 ? "Yearly" : "years"}`;
            default:
                return "Monthly";
        }
    };

    const getNextDueDates = () => {
        try {
            const startDate = safeCreateDate(formData.start_date);
            const frequency =
                Number.parseInt(formData.recurrence_frequency) || 1;
            const dates = [];
            let currentDate = new Date(startDate);

            // Generate next 3 due dates
            for (let i = 0; i < 3; i++) {
                // Set the due day if specified and it's a monthly/quarterly recurrence
                if (
                    formData.due_day &&
                    (formData.recurrence === "monthly" ||
                        formData.recurrence === "quarterly")
                ) {
                    currentDate = safeSetDayOfMonth(
                        currentDate,
                        formData.due_day
                    );
                }

                // Only add valid dates
                if (isValid(currentDate)) {
                    dates.push(new Date(currentDate));
                }

                // Calculate next date based on recurrence
                try {
                    switch (formData.recurrence) {
                        case "weekly":
                            currentDate = addWeeks(currentDate, frequency);
                            break;
                        case "biweekly":
                            currentDate = addWeeks(currentDate, 2 * frequency);
                            break;
                        case "monthly":
                            currentDate = addMonths(currentDate, frequency);
                            break;
                        case "quarterly":
                            currentDate = addMonths(currentDate, 3 * frequency);
                            break;
                        case "annually":
                            currentDate = addYears(currentDate, frequency);
                            break;
                        default:
                            currentDate = addMonths(currentDate, frequency);
                    }
                } catch {
                    // If date calculation fails, break the loop
                    break;
                }

                // Safety check to prevent infinite loops
                if (!isValid(currentDate)) {
                    break;
                }
            }

            return dates;
        } catch (error) {
            console.error("Error generating due dates:", error);
            return [];
        }
    };

    const showCustomFrequency = formData.recurrence !== "biweekly";
    const showDueDay =
        formData.recurrence === "monthly" ||
        formData.recurrence === "quarterly";

    // Safe format function
    const safeFormat = (date: Date, formatString: string) => {
        try {
            if (!date || !isValid(date)) return "Invalid date";
            return format(date, formatString);
        } catch {
            return "Invalid date";
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Bill Name</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g., Electricity Bill, Netflix Subscription"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (PHP)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    handleSelectChange("category", value)
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="utilities">
                                        🔌 Utilities
                                    </SelectItem>
                                    <SelectItem value="loan">
                                        💰 Loan
                                    </SelectItem>
                                    <SelectItem value="subscription">
                                        📺 Subscription
                                    </SelectItem>
                                    <SelectItem value="phone">
                                        📱 Phone
                                    </SelectItem>
                                    <SelectItem value="internet">
                                        🌐 Internet
                                    </SelectItem>
                                    <SelectItem value="insurance">
                                        🛡️ Insurance
                                    </SelectItem>
                                    <SelectItem value="other">
                                        📋 Other
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* First Due Date */}
                    <div className="space-y-2">
                        <Label htmlFor="start_date">First Due Date</Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Recurrence Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5" />
                        Recurrence Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Recurrence */}
                    <div className="space-y-2">
                        <Label htmlFor="recurrence">
                            How often does this bill repeat?
                        </Label>
                        <Select
                            value={formData.recurrence}
                            onValueChange={(value) =>
                                handleSelectChange("recurrence", value)
                            }
                        >
                            <SelectTrigger id="recurrence">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">
                                    📅 Weekly
                                </SelectItem>
                                <SelectItem value="biweekly">
                                    📅 Every 2 weeks
                                </SelectItem>
                                <SelectItem value="monthly">
                                    📅 Monthly
                                </SelectItem>
                                <SelectItem value="quarterly">
                                    📅 Every 3 months
                                </SelectItem>
                                <SelectItem value="annually">
                                    📅 Yearly
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Frequency - Progressive Disclosure */}
                    {showCustomFrequency && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="recurrence_frequency">
                                Custom frequency (optional)
                            </Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                    Every
                                </span>
                                <Input
                                    id="recurrence_frequency"
                                    name="recurrence_frequency"
                                    type="number"
                                    min="1"
                                    max="99"
                                    className="w-20"
                                    value={formData.recurrence_frequency}
                                    onChange={handleChange}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {formData.recurrence === "weekly"
                                        ? Number.parseInt(
                                              formData.recurrence_frequency ||
                                                  "1"
                                          ) === 1
                                            ? "week"
                                            : "weeks"
                                        : formData.recurrence === "monthly"
                                        ? Number.parseInt(
                                              formData.recurrence_frequency ||
                                                  "1"
                                          ) === 1
                                            ? "month"
                                            : "months"
                                        : formData.recurrence === "quarterly"
                                        ? Number.parseInt(
                                              formData.recurrence_frequency ||
                                                  "1"
                                          ) === 1
                                            ? "quarter"
                                            : "quarters"
                                        : Number.parseInt(
                                              formData.recurrence_frequency ||
                                                  "1"
                                          ) === 1
                                        ? "year"
                                        : "years"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Due Day - Progressive Disclosure */}
                    {showDueDay && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="due_day">
                                Specific day of the month (optional)
                            </Label>
                            <Input
                                id="due_day"
                                name="due_day"
                                type="number"
                                min="1"
                                max="31"
                                placeholder="e.g., 15 for the 15th of each month"
                                value={formData.due_day}
                                onChange={handleChange}
                                className="w-full md:w-48"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave blank to use the day from your first due
                                date (
                                {safeCreateDate(formData.start_date).getDate()})
                            </p>
                        </div>
                    )}

                    {/* Recurrence Preview */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Recurrence Preview
                            </span>
                        </div>
                        <div className="space-y-2">
                            <Badge variant="outline" className="text-sm">
                                {getRecurrenceText()}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium mb-1">
                                    Next 3 due dates:
                                </p>
                                <div className="space-y-1">
                                    {getNextDueDates().map((date, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {safeFormat(
                                                    date,
                                                    "MMMM d, yyyy"
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                    {getNextDueDates().length === 0 && (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                Unable to calculate dates -
                                                please check your settings
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* End Options */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">
                            When should this bill stop?
                        </Label>

                        <div className="space-y-3">
                            {/* Never End */}
                            <div
                                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                                    formData.end_type === "never"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                    handleSelectChange("end_type", "never")
                                }
                            >
                                <input
                                    type="radio"
                                    id="end_never"
                                    name="end_type"
                                    value="never"
                                    checked={formData.end_type === "never"}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                            formData.end_type === "never"
                                                ? "border-black bg-black"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {formData.end_type === "never" && (
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            Never (ongoing bill)
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            This bill will continue indefinitely
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* End on Date */}
                            <div
                                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                                    formData.end_type === "after_date"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                    handleSelectChange("end_type", "after_date")
                                }
                            >
                                <input
                                    type="radio"
                                    id="end_after_date"
                                    name="end_type"
                                    value="after_date"
                                    checked={formData.end_type === "after_date"}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                                formData.end_type ===
                                                "after_date"
                                                    ? "border-black bg-black"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {formData.end_type ===
                                                "after_date" && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">
                                                End on a specific date
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Choose when this bill should
                                                stop
                                            </p>
                                        </div>
                                    </div>
                                    {formData.end_type === "after_date" && (
                                        <div
                                            className="ml-9 animate-in slide-in-from-top-2 duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Input
                                                id="end_date"
                                                name="end_date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                className="w-full max-w-[200px] border-gray-300 focus:border-black focus:ring-black"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* End after Occurrences */}
                            <div
                                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                                    formData.end_type === "after_occurrences"
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                    handleSelectChange(
                                        "end_type",
                                        "after_occurrences"
                                    )
                                }
                            >
                                <input
                                    type="radio"
                                    id="end_after_occurrences"
                                    name="end_type"
                                    value="after_occurrences"
                                    checked={
                                        formData.end_type ===
                                        "after_occurrences"
                                    }
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                                formData.end_type ===
                                                "after_occurrences"
                                                    ? "border-black bg-black"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {formData.end_type ===
                                                "after_occurrences" && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">
                                                End after a number of payments
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Set a specific number of
                                                payments
                                            </p>
                                        </div>
                                    </div>
                                    {formData.end_type ===
                                        "after_occurrences" && (
                                        <div
                                            className="ml-9 animate-in slide-in-from-top-2 duration-200"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">
                                                    After
                                                </span>
                                                <Input
                                                    id="occurrences"
                                                    name="occurrences"
                                                    type="number"
                                                    min="1"
                                                    max="999"
                                                    value={formData.occurrences}
                                                    onChange={handleChange}
                                                    className="w-20 border-gray-300 focus:border-black focus:ring-black"
                                                />
                                                <span className="text-sm text-gray-600">
                                                    payments
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="e.g., Pay via GCash, Account number: 123456"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Saving..."
                        : isEditing
                        ? "Update Due"
                        : "Create Due"}
                </Button>
            </div>
        </form>
    );
}
