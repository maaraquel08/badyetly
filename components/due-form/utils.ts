import {
    format,
    addMonths,
    addWeeks,
    addYears,
    isValid,
    parseISO,
} from "date-fns";

// Helper function to safely create a date
export function safeCreateDate(dateValue: string | Date): Date {
    try {
        if (!dateValue) return new Date();
        if (dateValue instanceof Date) return dateValue;
        const date = parseISO(dateValue);
        return isValid(date) ? date : new Date();
    } catch {
        return new Date();
    }
}

// Helper function to safely set day of month
export function safeSetDayOfMonth(date: Date, day: string): Date {
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
}

// Helper function to get recurrence text
export function getRecurrenceText(
    recurrence: string,
    recurrence_frequency: string
): string {
    const frequency = Number.parseInt(recurrence_frequency) || 1;
    const baseText = frequency === 1 ? "" : `Every ${frequency} `;

    switch (recurrence) {
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
}

// Helper function to get next due dates
export function getNextDueDates(
    start_date: Date,
    recurrence: string,
    recurrence_frequency: string,
    due_day: string
): Date[] {
    try {
        const startDate = safeCreateDate(start_date);
        const frequency = Number.parseInt(recurrence_frequency) || 1;
        const dates = [];
        let currentDate = new Date(startDate);

        // Generate next 3 due dates
        for (let i = 0; i < 3; i++) {
            // Set the due day if specified and it's a monthly/quarterly recurrence
            if (
                due_day &&
                (recurrence === "monthly" || recurrence === "quarterly")
            ) {
                currentDate = safeSetDayOfMonth(currentDate, due_day);
            }

            // Only add valid dates
            if (isValid(currentDate)) {
                dates.push(new Date(currentDate));
            }

            // Calculate next date based on recurrence
            try {
                switch (recurrence) {
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
}
