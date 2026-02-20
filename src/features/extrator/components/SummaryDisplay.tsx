import { Card } from "../../../core";
import { centsToNumber, formatCurrency } from "../utils/format";
import type { ConsolidatedTotals, FileConsolidationResult } from "../types";

type SummaryDisplayProps = {
  totals: ConsolidatedTotals;
  files: FileConsolidationResult[];
  errors: string[];
  exportPayload: unknown;
};

const metricLabels: {
  key: keyof ConsolidatedTotals;
  label: string;
  hint: string;
}[] = [
  { key: "vlrRendTrib", label: "Rendimentos Tributáveis", hint: "vlrRendTrib" },
  { key: "vlrRendTrib13", label: "Rend. 13º", hint: "vlrRendTrib13" },
  { key: "vlrPrevOficial", label: "INSS", hint: "vlrPrevOficial" },
  { key: "vlrPrevOficial13", label: "INSS 13º", hint: "vlrPrevOficial13" },
  { key: "vlrCRMen", label: "IRRF Mensal", hint: "vlrCRMen" },
  { key: "vlrCR13Men", label: "IRRF 13º", hint: "vlrCR13Men" },
];

export function SummaryDisplay({
  totals,
  files,
  errors,
  exportPayload,
}: SummaryDisplayProps) {
  const hasData = files.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card
        title="Consolidado"
        subtitle="Soma de todos os XMLs em centavos convertidos para BRL"
        className="lg:col-span-2"
      >
        {!hasData && (
          <p className="text-sm text-slate-400">
            Carregue arquivos para ver o consolidado.
          </p>
        )}
        {hasData && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricLabels.map((metric) => {
              const value = totals[metric.key];
              return (
                <div
                  key={metric.key}
                  className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                      {metric.label}
                    </p>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                      {metric.hint}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">
                    {formatCurrency(centsToNumber(value))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card
        title="Arquivos Processados"
        subtitle={
          hasData ? `${files.length} arquivo(s)` : "Nenhum arquivo processado"
        }
      >
        {!hasData && (
          <p className="text-sm text-slate-400">
            Liste de arquivos aparecerá aqui.
          </p>
        )}
        {hasData && (
          <div className="flex flex-col gap-3">
            {files.map((file) => (
              <div
                key={file.fileName}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {file.fileName}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      file.hasData
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-200"
                    }`}
                  >
                    {file.hasData ? "OK" : "Sem consolidApurMen"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {file.hasData
                    ? "Valores somados considerando vínculos internos."
                    : "Nenhuma tag consolidApurMen encontrada."}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="JSON consolidado"
        subtitle="Pré-visualização (exporta o mesmo conteúdo)"
      >
        {hasData ? (
          <pre className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200">
            {JSON.stringify(exportPayload, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-400">
            Faça o upload para gerar o JSON consolidado.
          </p>
        )}
      </Card>

      {errors.length > 0 && (
        <Card
          title="Alertas"
          subtitle="Arquivos ignorados ou inválidos"
          className="lg:col-span-3"
        >
          <ul className="space-y-2 text-sm text-amber-200">
            {errors.map((message, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
