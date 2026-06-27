/**
 * Browser shims for @glaze/core/utils
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function initLogging() {
  // no-op in browser
}
