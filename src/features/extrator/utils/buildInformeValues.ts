import type { ConsolidatedTotals } from "../types";

export function buildInformeValues(totals: ConsolidatedTotals) {
  const outrosIsentos = (totals.vlrAbonoPec || 0) + (totals.vlrIsenOutros || 0);

  const decimoTerceiroCalc =
    (totals.vlrRendTrib13 || 0) -
    (totals.vlrPrevOficial13 || 0) -
    (totals.vlrDedDep13 || 0) -
    (totals.vlrCR13Men || 0);

  let infoComp = "";
  if (totals.vlrDedDep > 0) {
    infoComp += `DEDUCAO POR DEPENDENTES: R$ ${((totals.vlrDedDep || 0) / 100).toFixed(2)}\n`;
  }
  if (totals.vlrDedPenAlim > 0) {
    infoComp += `PENSAO ALIMENTICIA PAGA: R$ ${((totals.vlrDedPenAlim || 0) / 100).toFixed(2)}\n`;
  }

  return {
    q3: {
      totalRendimentos: totals.vlrRendTrib || 0,
      prevOficial: totals.vlrPrevOficial || 0,
      prevComplementar: totals.vlrPrevCompl || 0,
      pensao: totals.vlrDedPenAlim || 0, // Mapeado
      irrf: totals.vlrCRMen || 0,
    },

    q4: {
      linha1: totals.vlrParcIsenta65 || 0,
      linha2: totals.vlrParcIsenta65Dec || 0,
      linha3: (totals.vlrDiarias || 0) + (totals.vlrAjudaCusto || 0),
      linha4: (totals.vlrRendMoleGrave || 0) + (totals.vlrRendMoleGrave13 || 0),
      linha5: 0, // Lucros e Dividendos
      linha6: 0, // ME / EPP
      linha7: totals.vlrIndResContrato || 0,
      linha8: totals.vlrJurosMora || 0,
      linha9: outrosIsentos,
    },

    q5: {
      decimoTerceiro: (decimoTerceiroCalc > 0 ? decimoTerceiroCalc : 0) || 0,
      irrfDecimo: totals.vlrCR13Men || 0,
      outros: 0,
    },

    q6: {
      // Rendimentos Recebidos Acumuladamente
      totalRendimentos: totals.vlrRendRRA || 0,
      exclusaoDespesas: totals.vlrDespJudRRA || 0,
      prevOficial: totals.vlrPrevOficialRRA || 0,
      pensao: totals.vlrDedPenAlimRRA || 0,
      irrf: totals.vlrCRRRA || 0,
      qtdMeses: totals.qtdMesesRRA || 0,
    },

    autoInfo7: infoComp,
  };
}
