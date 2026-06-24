// src/mcp/tools/utils.ts
import prisma from "@/lib/prisma";

export interface CustomerResolutionResult {
  customer?: {
    id: number;
    name: string;
    mobile: string;
  };
  error?: "AMBIGUOUS_NAME" | "NOT_FOUND" | "DATABASE_ERROR";
  message?: string;
  matches?: Array<{
    id: number;
    name: string;
    mobile: string;
  }>;
}

/**
 * Resolves a customer from a name string or customerId.
 * If multiple matches are found, returns AMBIGUOUS_NAME with candidate matches.
 */
export async function resolveCustomer(
  name: string,
  customerId?: number
): Promise<CustomerResolutionResult> {
  if (customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        isDeleted: false,
      },
    });
    if (!customer) {
      return {
        error: "NOT_FOUND",
        message: `Customer with ID '${customerId}' not found.`,
      };
    }
    return { customer };
  }

  if (!name) {
    return {
      error: "NOT_FOUND",
      message: "Customer name or customer ID is required.",
    };
  }

  // Find customers containing the name
  const matches = await prisma.customer.findMany({
    where: {
      name: {
        contains: name,
      },
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      mobile: true,
    },
  });

  if (matches.length === 0) {
    return {
      error: "NOT_FOUND",
      message: `Customer '${name}' not found.`,
    };
  }

  if (matches.length > 1) {
    // Check if there is an exact case-insensitive match to avoid false ambiguity alerts
    const exactMatch = matches.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exactMatch) {
      return { customer: exactMatch };
    }

    return {
      error: "AMBIGUOUS_NAME",
      message: `Multiple customers match the name '${name}'. Please specify which one.`,
      matches,
    };
  }

  return { customer: matches[0] };
}

/**
 * Normalizes date input. Defaults the year to the current system year (e.g. 2026) if missing.
 */
export function parseDateInput(dateInput: string): string {
  if (!dateInput) return "";
  const trimmed = dateInput.trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  const currentYear = new Date().getFullYear();
  
  // DD-MM or DD/MM or DD.MM
  const dmMatch = trimmed.match(/^(\d{1,2})[-/\.](\d{1,2})$/);
  if (dmMatch) {
    const day = dmMatch[1].padStart(2, '0');
    const month = dmMatch[2].padStart(2, '0');
    return `${currentYear}-${month}-${day}`;
  }
  
  // Fallback to JS Date parsing
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      let year = parsed.getFullYear();
      if (!/\d{4}/.test(trimmed)) {
        year = currentYear;
      }
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  
  return trimmed;
}

/**
 * Normalizes a month-year string input to YYYY-MM. Defaults year to current year if omitted.
 */
export function parseMonthYearInput(monthYearInput: string): string {
  if (!monthYearInput) return "";
  const trimmed = monthYearInput.trim();
  
  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  const currentYear = new Date().getFullYear();
  
  // MM
  if (/^\d{1,2}$/.test(trimmed)) {
    const month = trimmed.padStart(2, '0');
    return `${currentYear}-${month}`;
  }
  
  // Month names
  const monthsMap: Record<string, string> = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12"
  };
  
  const cleanStr = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(monthsMap)) {
    if (cleanStr.includes(key)) {
      return `${currentYear}-${val}`;
    }
  }
  
  return trimmed;
}
