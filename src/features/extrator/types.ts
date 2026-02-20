export type ConsolidatedTotals = {
  vlrRendTrib: number;
  vlrRendTrib13: number;
  vlrPrevOficial: number;
  vlrPrevOficial13: number;
  vlrCRMen: number;
  vlrCR13Men: number;
  vlrAbonoPec: number; // Novo: Abono Pecuniário
  vlrIndResContrato: number; // Novo: Indenização Rescisória
};

export type FileConsolidationResult = {
  fileName: string;
  totals: ConsolidatedTotals;
  hasData: boolean;
};

export type ConsolidationSummary = {
  totals: ConsolidatedTotals;
  files: FileConsolidationResult[];
  errors: string[];
};
