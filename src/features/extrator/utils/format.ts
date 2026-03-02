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
    vlrPrevOficial: 0,
    vlrPrevCompl: 0,
    vlrCRMen: 0,
    vlrRendTrib13: 0,
    vlrPrevOficial13: 0,
    vlrCR13Men: 0,
    vlrParcIsenta65: 0,
    vlrParcIsenta65Dec: 0,
    vlrDiarias: 0,
    vlrAjudaCusto: 0,
    vlrIndResContrato: 0,
    vlrAbonoPec: 0,
    vlrRendMoleGrave: 0,
    vlrRendMoleGrave13: 0,
    vlrAuxMoradia: 0,
    vlrBolsaMedico: 0,
    vlrBolsaMedico13: 0,
    vlrJurosMora: 0,
    vlrIsenOutros: 0,
    vlrDedDep: 0,
    vlrDedPenAlim: 0,
    vlrRendRRA: 0,
    vlrPrevOficialRRA: 0,
    vlrDedPenAlimRRA: 0,
    vlrCRRRA: 0,
    vlrDespJudRRA: 0,
    qtdMesesRRA: 0,
    vlrDedDep13: 0,
  };
}

export function mergeTotals(
  base: ConsolidatedTotals,
  delta: ConsolidatedTotals,
): ConsolidatedTotals {
  const merged = { ...base };
  for (const key in base) {
    const k = key as keyof ConsolidatedTotals;
    merged[k] = base[k] + delta[k];
  }
  return merged;
}

export function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "").padStart(14, "0");
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}
