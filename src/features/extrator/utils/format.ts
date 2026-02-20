import type { ConsolidatedTotals } from "../types";

export function decimalStringToCents(value: string | null | undefined): number {
  if (!value) return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const sanitized = trimmed.replace(/\s+/g, "").replace(/,/g, ".");
  const parts = sanitized.split(".");

  let normalized = sanitized;
  if (parts.length > 1) {
    const decimalsCandidate = parts[parts.length - 1] ?? "";
    const treatAsDecimals =
      decimalsCandidate.length > 0 && decimalsCandidate.length <= 2;
    if (treatAsDecimals) {
      const decimals = parts.pop();
      const integerPart = parts.join("");
      normalized = decimals ? `${integerPart}.${decimals}` : integerPart;
    } else {
      normalized = parts.join("");
    }
  }

  const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/);

  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const integerPart = match[2] ?? "0";
  const decimalPart = (match[3] ?? "").padEnd(2, "0").slice(0, 2);
  const cents =
    Number.parseInt(integerPart, 10) * 100 +
    Number.parseInt(decimalPart || "0", 10);

  return sign * cents;
}

export function centsToNumber(cents: number): number {
  return Math.round(cents) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function createEmptyTotals(): ConsolidatedTotals {
  return {
    vlrRendTrib: 0,
    vlrRendTrib13: 0,
    vlrPrevOficial: 0,
    vlrPrevOficial13: 0,
    vlrCRMen: 0,
    vlrCR13Men: 0,
  };
}

export function mergeTotals(
  base: ConsolidatedTotals,
  delta: ConsolidatedTotals,
): ConsolidatedTotals {
  return {
    vlrRendTrib: base.vlrRendTrib + delta.vlrRendTrib,
    vlrRendTrib13: base.vlrRendTrib13 + delta.vlrRendTrib13,
    vlrPrevOficial: base.vlrPrevOficial + delta.vlrPrevOficial,
    vlrPrevOficial13: base.vlrPrevOficial13 + delta.vlrPrevOficial13,
    vlrCRMen: base.vlrCRMen + delta.vlrCRMen,
    vlrCR13Men: base.vlrCR13Men + delta.vlrCR13Men,
  };
}
