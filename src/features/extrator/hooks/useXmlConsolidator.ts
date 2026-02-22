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
  DependenteInfo,
  FileConsolidationResult,
} from "../types";
import {
  extractIdentification,
  type ExtractedIdentification,
} from "../utils/extractIdentification";

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

  // Campos que devem ser sempre positivos (módulo absoluto)
  const absoluteFields: (keyof ConsolidatedTotals)[] = [
    "vlrPrevOficial",
    "vlrPrevOficial13",
    "vlrCRMen",
    "vlrCR13Men",
    "vlrDedPenAlim",
    "vlrPrevOficialRRA",
    "vlrCRRRA",
    "vlrDedPenAlimRRA",
    "vlrAbonoPec",
    "vlrIndResContrato",
    "vlrJurosMora",
    "vlrIsenOutros",
  ];

  for (const dmDev of dmDevNodes) {
    const totApur = dmDev.getElementsByTagName("totApurMen")[0];
    const totRRA = dmDev.getElementsByTagName("totApurRRA")[0];

    const keys = Object.keys(totals) as (keyof ConsolidatedTotals)[];

    for (const key of keys) {
      // TRATAMENTO ESPECIAL: Outros Isentos (Múltiplos e Filtrados)
      if (key === "vlrIsenOutros") {
        const isenNodes = Array.from(
          totApur?.getElementsByTagName("vlrIsenOutros") || [],
        );

        isenNodes.forEach((node) => {
          // No S-5002, vlrIsenOutros e descRendimento são irmãos (geralmente dentro de <ideRend>)
          const parent = node.parentElement;
          const desc =
            parent?.getElementsByTagName("descRendimento")[0]?.textContent ||
            "";

          // Filtro profissional: ignora se contiver "adiantamento" (case-insensitive)
          if (!desc.toLowerCase().includes("adiantamento")) {
            totals.vlrIsenOutros += Math.abs(
              decimalStringToCents(node.textContent),
            );
          }
        });
        continue; // Pula para a próxima chave, pois já processamos esta
      }

      // Lógica normal para os demais campos
      let el = totApur?.getElementsByTagName(key)[0];

      if (key === "vlrRendRRA")
        el = totRRA?.getElementsByTagName("vlrRendTrib")[0];
      if (key === "vlrPrevOficialRRA")
        el = totRRA?.getElementsByTagName("vlrPrevOficial")[0];
      if (key === "vlrCRRRA") el = totRRA?.getElementsByTagName("vlrCR")[0];

      let value = decimalStringToCents(el?.textContent);
      if (absoluteFields.includes(key)) value = Math.abs(value);

      totals[key] += value;
    }
  }

  extractDetailedData(doc, totals);
  return totals;
}

function extractDependents(doc: Document): DependenteInfo[] {
  const deps: DependenteInfo[] = [];
  const depNodes = Array.from(doc.getElementsByTagName("dep"));

  depNodes.forEach((node) => {
    deps.push({
      nome: node.getElementsByTagName("nmDep")[0]?.textContent || "",
      cpf: node.getElementsByTagName("cpfDep")[0]?.textContent || "",
      tipo: node.getElementsByTagName("tpDep")[0]?.textContent || "",
      valorDeducao: decimalStringToCents(
        node.getElementsByTagName("vlrDedDep")[0]?.textContent,
      ),
    });
  });
  return deps;
}

function extractDetailedData(doc: Document, totals: ConsolidatedTotals) {
  // 1. Extração de Pensão Alimentícia (Quadro 3, Linha 4)
  const penAlimNodes = Array.from(doc.getElementsByTagName("vlrDedPenAlim"));
  penAlimNodes.forEach((node) => {
    totals.vlrDedPenAlim += decimalStringToCents(node.textContent);
  });

  // 2. Extração de Dedução por Dependente (Informativo para o Quadro 7)
  const depNodes = Array.from(doc.getElementsByTagName("vlrDedDep"));
  depNodes.forEach((node) => {
    totals.vlrDedDep += decimalStringToCents(node.textContent);
  });
}

/* =========================
   LÓGICA OFICIAL (consolidApurMen)
========================= */

function extractOfficial(doc: Document): ConsolidatedTotals {
  const totals = createEmptyTotals();
  const consolidNode = Array.from(doc.getElementsByTagName("*")).find(
    (el) => el.localName === "consolidApurMen",
  );

  if (consolidNode) {
    const fields = Object.keys(totals) as (keyof ConsolidatedTotals)[];
    for (const field of fields) {
      const el = consolidNode.getElementsByTagName(field)[0];
      totals[field] = decimalStringToCents(el?.textContent);
    }
  }

  // CHAMADA IMPORTANTE:
  extractDetailedData(doc, totals);
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
    identification: undefined,
    allDependents: [],
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
      const dependents = extractDependents(doc);
      const identification = extractIdentification(doc);

      return {
        fileName: file.name,
        totals,
        identification,
        dependents, // Agora preenchido
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
        const allDepsAcc: DependenteInfo[] = []; // CORREÇÃO: Acumulador criado
        let globalTotals = createEmptyTotals();
        let identificationGlobal: ExtractedIdentification | undefined;

        for (const res of results) {
          if (res.status === "fulfilled") {
            processedFiles.push(res.value);
            globalTotals = mergeTotals(globalTotals, res.value.totals);

            // CORREÇÃO: Acumula dependentes de todos os arquivos
            if (res.value.dependents) {
              allDepsAcc.push(...res.value.dependents);
            }

            if (!identificationGlobal && res.value.identification) {
              identificationGlobal = res.value.identification;
            }
          } else {
            errors.push(
              res.reason instanceof Error
                ? res.reason.message
                : String(res.reason),
            );
          }
        }

        // DICA: Remover dependentes duplicados (mesmo CPF)
        const uniqueDeps = Array.from(
          new Map(allDepsAcc.map((d) => [d.cpf, d])).values(),
        );

        setSummary({
          totals: globalTotals,
          files: processedFiles,
          errors,
          identification: identificationGlobal,
          allDependents: uniqueDeps, // CORREÇÃO: Agora a variável existe
        });
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
      totais: Object.fromEntries(
        Object.entries(summary.totals).map(([k, v]) => [
          k,
          format(v as number),
        ]),
      ),
      arquivos: summary.files.map((f) => ({
        nome: f.fileName,
        valores: Object.fromEntries(
          Object.entries(f.totals).map(([k, v]) => [k, format(v as number)]),
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
      setSummary({
        totals: createEmptyTotals(),
        files: [],
        errors: [],
        allDependents: [],
      }),
  };
}
