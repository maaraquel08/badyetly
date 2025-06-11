import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "PHP"): string {
  const currencyMap = {
    PHP: { locale: "en-PH", currency: "PHP", symbol: "₱" },
    USD: { locale: "en-US", currency: "USD", symbol: "$" },
    EUR: { locale: "en-EU", currency: "EUR", symbol: "€" },
    GBP: { locale: "en-GB", currency: "GBP", symbol: "£" },
    JPY: { locale: "ja-JP", currency: "JPY", symbol: "¥" },
  }

  const currencyInfo = currencyMap[currency] || currencyMap.PHP

  return new Intl.NumberFormat(currencyInfo.locale, {
    style: "currency",
    currency: currencyInfo.currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}
