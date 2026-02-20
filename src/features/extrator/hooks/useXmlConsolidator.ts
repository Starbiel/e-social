import { useCallback, useMemo, useState } from "react";
import { cleanXmlString, hasParserError } from "../utils/xml";
import {
  centsToNumber,
  createEmptyTotals,
  decimalStringToCents,
  mergeTotals,
} from "../utils/format";
import type {
  ConsolidatedTotals,
  ConsolidationSummary,
  FileConsolidationResult,
} from "../types";

/* =========================
   MODOS
========================= */

export type CalculationMode =
  | "official" // Resumo do governo (líquido)
  | "accountant-dmdev"; // Soma por holerite (bruto/magnitude)

/* =========================
   LÓGICA CONTÁBIL (POR dmDev)
========================= */

function extractAccountantDmDev(doc: Document): ConsolidatedTotals {
  const totals = createEmptyTotals();
  const dmDevNodes = Array.from(doc.getElementsByTagName("dmDev"));

  for (const dmDev of dmDevNodes) {
    const totApur = dmDev.getElementsByTagName("totApurMen")[0];
    if (!totApur) continue;

    const getCents = (tag: keyof ConsolidatedTotals) => {
      const el = totApur.getElementsByTagName(tag)[0];
      return decimalStringToCents(el?.textContent);
    };

    // Rendimentos → soma normal
    totals.vlrRendTrib += getCents("vlrRendTrib");
    totals.vlrRendTrib13 += getCents("vlrRendTrib13");
    totals.vlrAbonoPec += Math.abs(getCents("vlrAbonoPec"));
    totals.vlrIndResContrato += Math.abs(getCents("vlrIndResContrato"));

    // INSS / IRRF → Soma a magnitude para bater com os R$ 1.169,52 de 02/25
    totals.vlrPrevOficial += Math.abs(getCents("vlrPrevOficial"));
    totals.vlrPrevOficial13 += Math.abs(getCents("vlrPrevOficial13"));
    totals.vlrCRMen += Math.abs(getCents("vlrCRMen"));
    totals.vlrCR13Men += Math.abs(getCents("vlrCR13Men"));
  }

  return totals;
}

/* =========================
   LÓGICA OFICIAL (consolidApurMen)
========================= */

function extractOfficial(doc: Document): ConsolidatedTotals {
  const totals = createEmptyTotals();
  const consolidNode = Array.from(doc.getElementsByTagName("*")).find(
    (el) => el.localName === "consolidApurMen",
  );

  if (!consolidNode) return totals;

  const fields = Object.keys(totals) as (keyof ConsolidatedTotals)[];

  for (const field of fields) {
    const el = consolidNode.getElementsByTagName(field)[0];
    totals[field] = decimalStringToCents(el?.textContent);
  }

  return totals;
}

/* =========================
   HOOK
========================= */

export function useXmlConsolidator() {
  const [mode, setMode] = useState<CalculationMode>("accountant-dmdev");
  const [summary, setSummary] = useState<ConsolidationSummary>({
    totals: createEmptyTotals(),
    files: [],
    errors: [],
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const processSingleFile = useCallback(
    async (
      file: File,
      currentMode: CalculationMode,
    ): Promise<FileConsolidationResult> => {
      const xmlText = await file.text();
      const cleaned = cleanXmlString(xmlText);
      const doc = new DOMParser().parseFromString(cleaned, "application/xml");

      if (hasParserError(doc)) {
        throw new Error(`Erro no XML: ${file.name}`);
      }

      const totals =
        currentMode === "official"
          ? extractOfficial(doc)
          : extractAccountantDmDev(doc);

      return {
        fileName: file.name,
        totals,
        hasData: Object.values(totals).some((v) => v !== 0),
      };
    },
    [],
  );

  const processFiles = useCallback(
    async (input: File[] | FileList, selectedMode: CalculationMode = mode) => {
      setIsProcessing(true);
      setMode(selectedMode);

      try {
        const filesArr = Array.from(input);
        const results = await Promise.allSettled(
          filesArr.map((f) => processSingleFile(f, selectedMode)),
        );

        const processedFiles: FileConsolidationResult[] = [];
        const errors: string[] = [];
        let globalTotals = createEmptyTotals();

        for (const res of results) {
          if (res.status === "fulfilled") {
            processedFiles.push(res.value);
            globalTotals = mergeTotals(globalTotals, res.value.totals);
          } else {
            errors.push(
              res.reason instanceof Error
                ? res.reason.message
                : String(res.reason),
            );
          }
        }

        setSummary({ totals: globalTotals, files: processedFiles, errors });
      } finally {
        setIsProcessing(false);
      }
    },
    [mode, processSingleFile],
  );

  const exportPayload = useMemo(() => {
    const format = (cents: number) => centsToNumber(cents);

    return {
      configuracao: { modo: mode, geradoEm: new Date().toISOString() },
      totais: {
        rendimento_tributavel: format(summary.totals.vlrRendTrib),
        rendimento_13: format(summary.totals.vlrRendTrib13),
        abono_pecuniario: format(summary.totals.vlrAbonoPec),
        rescisao_indenizada: format(summary.totals.vlrIndResContrato),
        inss_total: format(
          summary.totals.vlrPrevOficial + summary.totals.vlrPrevOficial13,
        ),
        irrf_total: format(summary.totals.vlrCRMen + summary.totals.vlrCR13Men),
      },
      arquivos: summary.files.map((f) => ({
        nome: f.fileName,
        valores: Object.fromEntries(
          Object.entries(f.totals).map(([k, v]) => [k, format(v)]),
        ),
      })),
      erros: summary.errors,
    };
  }, [summary, mode]);

  return {
    ...summary,
    isProcessing,
    processFiles,
    mode,
    setMode,
    exportPayload,
    reset: () =>
      setSummary({ totals: createEmptyTotals(), files: [], errors: [] }),
  };
}
