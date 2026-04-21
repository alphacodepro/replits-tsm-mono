import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (!value || value === 0) return "₹0";
  if (value >= 10_000_000) {
    return `₹${parseFloat((value / 10_000_000).toFixed(2))}Cr`;
  }
  if (value >= 100_000) {
    return `₹${parseFloat((value / 100_000).toFixed(2))}L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatCurrencyFull(value: number | null | undefined): string {
  if (!value || value === 0) return "₹0";
  return `₹${value.toLocaleString("en-IN")}`;
}
