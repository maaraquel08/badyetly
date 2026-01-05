import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
        return "Varies";
    }
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export function getCategoryColor(category: string) {
    switch (category?.toLowerCase()) {
        case "utilities":
            return "bg-blue-100 text-blue-800";
        case "loan":
            return "bg-amber-100 text-amber-800";
        case "cards":
            return "bg-indigo-100 text-indigo-800";
        case "savings":
            return "bg-emerald-100 text-emerald-800";
        case "investment":
            return "bg-teal-100 text-teal-800";
        case "subscription":
            return "bg-purple-100 text-purple-800";
        case "phone":
            return "bg-green-100 text-green-800";
        case "internet":
            return "bg-green-100 text-green-800";
        case "insurance":
            return "bg-red-100 text-red-800";
        case "other":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export function getCategoryBackgroundColor(category: string) {
    if (!category) {
        return "bg-gray-50 border-gray-200";
    }

    switch (category.toLowerCase()) {
        case "utilities":
            return "bg-blue-50 border-blue-200";
        case "loan":
            return "bg-amber-50 border-amber-200";
        case "cards":
            return "bg-indigo-50 border-indigo-200";
        case "savings":
            return "bg-emerald-50 border-emerald-200";
        case "investment":
            return "bg-teal-50 border-teal-200";
        case "subscription":
            return "bg-purple-50 border-purple-200";
        case "phone":
            return "bg-green-50 border-green-200";
        case "internet":
            return "bg-green-50 border-green-200";
        case "insurance":
            return "bg-red-50 border-red-200";
        case "other":
            return "bg-gray-50 border-gray-200";
        default:
            return "bg-gray-50 border-gray-200";
    }
}

/**
 * Categories that support varying/optional amounts
 * These categories allow users to leave amount empty and enter it when marking as paid
 */
export const VARYING_AMOUNT_CATEGORIES = [
    "cards",
    "utilities",
    "savings",
    "investment",
] as const;

export function supportsVaryingAmount(category: string | null | undefined): boolean {
    if (!category) return false;
    return VARYING_AMOUNT_CATEGORIES.includes(
        category.toLowerCase() as typeof VARYING_AMOUNT_CATEGORIES[number]
    );
}
