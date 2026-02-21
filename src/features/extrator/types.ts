import type { ExtractedIdentification } from "./utils/extractIdentification";

// Representa um dependente encontrado nos XMLs
export type DependenteInfo = {
  nome: string;
  cpf: string;
  tipo: string;
  valorDeducao: number;
};

export type ConsolidatedTotals = {
  // Rendimentos e Retenções Base
  vlrRendTrib: number;
  vlrPrevOficial: number;
  vlrPrevCompl: number; // Novo
  vlrCRMen: number;

  // 13º Salário
  vlrRendTrib13: number;
  vlrPrevOficial13: number;
  vlrCR13Men: number;

  // Isentos
  vlrParcIsenta65: number;
  vlrParcIsenta65Dec: number;
  vlrDiarias: number;
  vlrAjudaCusto: number;
  vlrIndResContrato: number;
  vlrAbonoPec: number;
  vlrRendMoleGrave: number;
  vlrRendMoleGrave13: number;
  vlrAuxMoradia: number;
  vlrBolsaMedico: number;
  vlrBolsaMedico13: number;
  vlrJurosMora: number;
  vlrIsenOutros: number;

  // Deduções
  vlrDedDep: number;
  vlrDedPenAlim: number;

  // RRA (Quadro 6) - Novos campos
  vlrRendRRA: number;
  vlrPrevOficialRRA: number;
  vlrDedPenAlimRRA: number;
  vlrCRRRA: number;
  vlrDespJudRRA: number;
  qtdMesesRRA: number;
};

export type FileConsolidationResult = {
  fileName: string;
  totals: ConsolidatedTotals;
  hasData: boolean;
  identification?: ExtractedIdentification;
  dependents: DependenteInfo[];
};

export type ConsolidationSummary = {
  totals: ConsolidatedTotals;
  files: FileConsolidationResult[];
  errors: string[];
  identification?: ExtractedIdentification;
  allDependents: DependenteInfo[];
};
