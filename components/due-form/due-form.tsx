"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { format, addMonths } from "date-fns";
import { DueFormData, DueFormProps } from "./types";
import { BasicInformationSection } from "./basic-information-section";
import { RecurrenceSection } from "./recurrence-section";
import { EndOptionsSection } from "./end-options-section";
import { NotesSection } from "./notes-section";
import { FormActions } from "./form-actions";
import { safeCreateDate, getRecurrenceText, getNextDueDates } from "./utils";

export function DueForm({
    onSubmit,
    isSubmitting,
    initialData,
    isEditing = false,
}: DueFormProps) {
    const searchParams = useSearchParams();
    const preselectedDate = searchParams.get("date");

    const [formData, setFormData] = useState<DueFormData>({
        title: "",
        amount: "",
        category: "",
        start_date: preselectedDate ? new Date(preselectedDate) : new Date(),
        recurrence: "monthly",
        recurrence_frequency: "1",
        due_day: "",
        status: "active",
        notes: "",
        end_type: "never",
        end_date: addMonths(new Date(), 12),
        occurrences: "12",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                start_date: initialData.start_date
                    ? new Date(initialData.start_date)
                    : new Date(),
                end_date: initialData.end_date
                    ? new Date(initialData.end_date)
                    : addMonths(new Date(), 12),
                amount: initialData.amount?.toString() || "",
                due_day: initialData.due_day?.toString() || "",
                recurrence_frequency:
                    initialData.recurrence_frequency?.toString() || "1",
                occurrences: initialData.occurrences?.toString() || "12",
                end_type: initialData.end_type || "never",
                notes: initialData.notes ?? "",
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

    const handleDateChange = (name: string, date: Date | undefined) => {
        if (date) {
            setFormData((prev) => ({ ...prev, [name]: date }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Format the data
        const formattedData = {
            ...formData,
            start_date: format(formData.start_date, "yyyy-MM-dd"),
            amount: formData.amount && formData.amount.trim() !== ""
                ? Number.parseFloat(formData.amount)
                : null,
            due_day: formData.due_day
                ? Number.parseInt(formData.due_day)
                : formData.start_date.getDate(),
            recurrence_frequency: Number.parseInt(
                formData.recurrence_frequency
            ),
            occurrences:
                formData.end_type === "after_occurrences"
                    ? Number.parseInt(formData.occurrences)
                    : undefined,
            end_date:
                formData.end_type === "after_date"
                    ? format(formData.end_date, "yyyy-MM-dd")
                    : undefined,
        };

        onSubmit(formattedData);
    };

    const handleCancel = () => {
        window.history.back();
    };

    // Helper functions for recurrence section
    const getRecurrenceTextWrapper = () =>
        getRecurrenceText(formData.recurrence, formData.recurrence_frequency);

    const getNextDueDatesWrapper = () =>
        getNextDueDates(
            formData.start_date,
            formData.recurrence,
            formData.recurrence_frequency,
            formData.due_day
        );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <BasicInformationSection
                formData={formData}
                onInputChange={handleChange}
                onSelectChange={handleSelectChange}
                onDateChange={handleDateChange}
            />

            <RecurrenceSection
                formData={formData}
                onInputChange={handleChange}
                onSelectChange={handleSelectChange}
                getRecurrenceText={getRecurrenceTextWrapper}
                getNextDueDates={getNextDueDatesWrapper}
                safeCreateDate={safeCreateDate}
            />

            <Card>
                <CardContent className="space-y-6 pt-6">
                    <EndOptionsSection
                        formData={formData}
                        onInputChange={handleChange}
                        onSelectChange={handleSelectChange}
                        onDateChange={handleDateChange}
                    />
                </CardContent>
            </Card>

            <NotesSection notes={formData.notes} onInputChange={handleChange} />

            <FormActions
                isSubmitting={isSubmitting}
                isEditing={isEditing}
                onCancel={handleCancel}
            />
        </form>
    );
}
