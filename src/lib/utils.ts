import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a quantity number to avoid floating point display issues
 * Rounds to 2 decimal places and removes trailing zeros
 */
export function formatQuantity(qty: number | undefined): string {
  if (!qty) return '';
  
  // Round to 2 decimal places
  const rounded = Math.round(qty * 100) / 100;
  
  // Convert to string and remove trailing zeros
  return rounded.toString().replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}
