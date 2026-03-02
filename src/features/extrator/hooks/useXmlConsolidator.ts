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
  HealthPlanDep,
  HealthPlanInfo,
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

  // 1. No seu XML a tag correta é 'ideDep'
  const ideDepNodes = Array.from(doc.getElementsByTagName("ideDep"));

  ideDepNodes.forEach((node) => {
    const cpf = node.getElementsByTagName("cpfDep")[0]?.textContent || "";
    const infoIRCR = doc.getElementsByTagName("infoIRCR")[0];
    let valorDeducao = 0;

    if (infoIRCR) {
      const penNodes = Array.from(infoIRCR.getElementsByTagName("penAlim"));

      const penDoDependente = penNodes.find(
        (p) => p.getElementsByTagName("cpfDep")[0]?.textContent === cpf,
      );

      if (penDoDependente) {
        valorDeducao = decimalStringToCents(
          penDoDependente.getElementsByTagName("vlrDedPenAlim")[0]?.textContent,
        );
      }
    }

    deps.push({
      nome: node.getElementsByTagName("nome")[0]?.textContent || "",
      cpf: cpf,
      tipo: node.getElementsByTagName("tpDep")[0]?.textContent || "",
      valorDeducao: valorDeducao,
    });
  });

  return deps;
}

function extractHealthPlan(doc: Document): HealthPlanInfo | undefined {
  const planNode = doc.getElementsByTagName("planSaude")[0];
  if (!planNode) return undefined;

  const cnpjOper =
    planNode.getElementsByTagName("cnpjOper")[0]?.textContent || "";
  const vlrSaudeTit = decimalStringToCents(
    planNode.getElementsByTagName("vlrSaudeTit")[0]?.textContent,
  );

  const deps: HealthPlanDep[] = [];
  const depNodes = Array.from(planNode.getElementsByTagName("infoDepSau"));

  depNodes.forEach((node) => {
    deps.push({
      cpf: node.getElementsByTagName("cpfDep")[0]?.textContent || "",
      valor: decimalStringToCents(
        node.getElementsByTagName("vlrSaudeDep")[0]?.textContent,
      ),
    });
  });

  return { cnpjOper, vlrSaudeTit, dependents: deps };
}

function extractDetailedData(doc: Document, totals: ConsolidatedTotals) {
  // 1. Pensão Alimentícia
  const penAlimNodes = Array.from(doc.getElementsByTagName("vlrDedPenAlim"));
  penAlimNodes.forEach((node) => {
    totals.vlrDedPenAlim += decimalStringToCents(node.textContent);
  });

  // 2. Dedução por Dependente separando mensal e 13º
  const dedDepenNodes = Array.from(doc.getElementsByTagName("dedDepen"));

  dedDepenNodes.forEach((node) => {
    const tpRend = node.getElementsByTagName("tpRend")[0]?.textContent;
    const valor = decimalStringToCents(
      node.getElementsByTagName("vlrDedDep")[0]?.textContent,
    );

    if (tpRend === "12") {
      totals.vlrDedDep13 += valor;
      totals.vlrDedDep += valor;
    } else {
      totals.vlrDedDep += valor;
    }
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
    healthPlan: undefined,
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
      const healthPlan = extractHealthPlan(doc);

      return {
        fileName: file.name,
        totals,
        identification,
        dependents,
        healthPlan,
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
        let globalHealthPlan: HealthPlanInfo | undefined;

        for (const res of results) {
          if (res.status === "fulfilled") {
            const val = res.value;
            processedFiles.push(val);
            globalTotals = mergeTotals(globalTotals, val.totals);

            if (val.dependents) allDepsAcc.push(...val.dependents);
            if (!identificationGlobal && val.identification)
              identificationGlobal = val.identification;

            // Lógica de Consolidação do Plano de Saúde
            if (val.healthPlan) {
              if (!globalHealthPlan) {
                globalHealthPlan = JSON.parse(JSON.stringify(val.healthPlan));
              } else if (
                globalHealthPlan.cnpjOper === val.healthPlan.cnpjOper
              ) {
                globalHealthPlan.vlrSaudeTit += val.healthPlan.vlrSaudeTit;
                val.healthPlan.dependents.forEach((newDep) => {
                  const existing = globalHealthPlan!.dependents.find(
                    (d) => d.cpf === newDep.cpf,
                  );
                  if (existing) existing.valor += newDep.valor;
                  else globalHealthPlan!.dependents.push({ ...newDep });
                });
              }
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
          allDependents: uniqueDeps,
          healthPlan: globalHealthPlan,
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
        healthPlan: undefined,
      }),
  };
}
