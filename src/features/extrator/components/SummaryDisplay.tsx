import { formatCurrency, centsToNumber } from "../utils/format";
import {
  TrendingUp,
  Calendar,
  ShieldCheck,
  Wallet,
  FileCheck,
  AlertCircle,
  Code2,
  Layers,
  Receipt,
  Landmark,
} from "lucide-react";
import type { ConsolidatedTotals, FileConsolidationResult } from "../types";

type SummaryDisplayProps = {
  totals: ConsolidatedTotals;
  files: FileConsolidationResult[];
  errors: string[];
  exportPayload: any;
};

export function SummaryDisplay({
  totals,
  files,
  errors,
  exportPayload,
}: SummaryDisplayProps) {
  const hasData = files.length > 0;

  // Lista exata das 8 métricas definidas no sistema
  const metrics = [
    {
      key: "vlrRendTrib",
      label: "Rend. Tributáveis",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      key: "vlrRendTrib13",
      label: "Rend. 13º",
      icon: Calendar,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      key: "vlrPrevOficial",
      label: "INSS Mensal",
      icon: ShieldCheck,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      key: "vlrPrevOficial13",
      label: "INSS 13º",
      icon: Landmark,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      key: "vlrCRMen",
      label: "IRRF Mensal",
      icon: Wallet,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      key: "vlrCR13Men",
      label: "IRRF 13º",
      icon: Receipt,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      key: "vlrAbonoPec",
      label: "Abono Pecuniário",
      icon: Layers,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
    {
      key: "vlrIndResContrato",
      label: "Indenização",
      icon: FileCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  if (!hasData) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Cards de Métricas - Ajustado para grid de 4 colunas em telas médias para caber os 8 cards */}
      <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.key}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 p-5 transition-all hover:bg-slate-800/60"
          >
            <div
              className={`mb-3 inline-flex rounded-xl ${m.bg} ${m.color} p-2.5`}
            >
              <m.icon size={18} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {m.label}
            </p>
            <p className="mt-1 text-xl font-bold text-white leading-none">
              {formatCurrency(
                centsToNumber(totals[m.key as keyof ConsolidatedTotals] || 0),
              )}
            </p>
            <div className="absolute -right-2 -bottom-2 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:opacity-[0.07]">
              <m.icon size={80} />
            </div>
          </div>
        ))}

        {/* Lista de Arquivos Processados */}
        <div className="sm:col-span-2 md:col-span-4 mt-2 rounded-3xl border border-white/5 bg-slate-900/20 p-6">
          <h3 className="flex items-center gap-2 font-bold text-slate-200 mb-4 text-sm">
            <FileCheck size={16} className="text-emerald-400" />
            Documentos Analisados ({files.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 max-h-[180px] overflow-y-auto pr-2 custom-scroll">
            {files.map((file) => (
              <div
                key={file.fileName}
                className="flex items-center justify-between rounded-xl bg-slate-950/50 p-3 border border-white/5"
              >
                <span className="text-xs font-medium text-slate-400 truncate max-w-[160px]">
                  {file.fileName}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-md ${file.hasData ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                >
                  {file.hasData ? "COMPLETO" : "SEM DADOS"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel Lateral: JSON e Alertas */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-[2rem] border border-white/5 bg-slate-950 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Code2 size={14} className="text-sky-400" /> Output Estruturado
            </span>
          </div>
          <pre className="h-[430px] overflow-auto rounded-2xl bg-black/40 p-5 text-[11px] font-mono leading-relaxed text-sky-300/70 custom-scroll border border-white/5">
            {JSON.stringify(exportPayload, null, 2)}
          </pre>
        </div>

        {errors.length > 0 && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-md">
            <h3 className="flex items-center gap-2 text-xs font-bold text-red-400 mb-3 uppercase tracking-widest">
              <AlertCircle size={14} /> Inconsistências ({errors.length})
            </h3>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <p
                  key={i}
                  className="text-[11px] text-red-300/60 leading-relaxed bg-red-500/10 p-2 rounded-lg border border-red-500/10"
                >
                  {err}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
