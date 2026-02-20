export type ConsolidatedTotals = {
  vlrRendTrib: number; // cents
  vlrRendTrib13: number; // cents
  vlrPrevOficial: number; // cents
  vlrPrevOficial13: number; // cents
  vlrCRMen: number; // cents
  vlrCR13Men: number; // cents
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
