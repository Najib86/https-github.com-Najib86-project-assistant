// src/lib/utils.ts
// Shared utility functions

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

/** Format a number as k/M abbreviation */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

/** Format a date for Nigerian locale */
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    ...opts,
  });
}

/** Get chapter status color */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOT_STARTED:    "#2a3a52",
    DRAFT:          "#4a8fff",
    SUBMITTED:      "#c9a84c",
    UNDER_REVIEW:   "#e8c76a",
    APPROVED:       "#2ecc8f",
    NEEDS_REVISION: "#e05252",
    IN_PROGRESS:    "#c9a84c",
    REJECTED:       "#e05252",
  };
  return colors[status] ?? "#4a5a72";
}

/** Get chapter status label */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOT_STARTED:    "Not Started",
    DRAFT:          "Draft",
    SUBMITTED:      "Submitted",
    UNDER_REVIEW:   "Under Review",
    APPROVED:       "Approved",
    NEEDS_REVISION: "Needs Revision",
    IN_PROGRESS:    "In Progress",
    REJECTED:       "Rejected",
  };
  return labels[status] ?? status;
}

/** Calculate project progress percentage */
export function calcProgress(chapters: Array<{ status: string }>): number {
  if (!chapters.length) return 0;
  const approved = chapters.filter(c => c.status === "APPROVED").length;
  return Math.round((approved / 5) * 100);
}

/** Sanitise a string for use as a filename */
export function toFilename(title: string, ext = "txt"): string {
  return title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_").slice(0, 50) + "." + ext;
}

/** Simple deep clone via JSON */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** APA citation formatter */
export function formatAPACitation({
  authors,
  year,
  title,
  journal,
  volume,
  issue,
  pages,
  doi,
  url,
  publisher,
}: {
  authors: string;
  year: string;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
}): string {
  let formatted = `${authors} (${year}). ${title}.`;
  if (journal) {
    formatted += ` *${journal}*`;
    if (volume) formatted += `, *${volume}*`;
    if (issue)  formatted += `(${issue})`;
    if (pages)  formatted += `, ${pages}`;
    formatted += ".";
  } else if (publisher) {
    formatted += ` ${publisher}.`;
  }
  if (doi)    formatted += ` https://doi.org/${doi}`;
  else if (url) formatted += ` Retrieved from ${url}`;
  return formatted;
}
