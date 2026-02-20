import { ExportButton } from "../components/ExportButton";
import { FileUploader } from "../components/FileUploader";
import { SummaryDisplay } from "../components/SummaryDisplay";
import { useXmlConsolidator } from "../hooks/useXmlConsolidator";

export default function ExtratorPage() {
  const {
    totals,
    files,
    errors,
    isProcessing,
    processFiles,
    reset,
    exportPayload,
    mode,
    setMode,
  } = useXmlConsolidator();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 shadow-[0_15px_80px_-45px_rgba(15,23,42,0.8)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-300">
            S-1210 / S-5002
          </span>
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-indigo-200">
            consolApurMen
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">
            Consolidador de XML do eSocial
          </h1>
          <p className="max-w-3xl text-slate-300">
            Faça upload de múltiplos XMLs (ex.: 13 meses) e obtenha um JSON
            consolidado com a soma dos campos de renda, INSS e IRRF. O parser
            navega por múltiplos vínculos em cada arquivo usando DOMParser.
          </p>
        </div>
      </header>

      <FileUploader
        isProcessing={isProcessing}
        onFilesSelected={processFiles}
        onReset={reset}
        mode={mode}
        setMode={setMode}
      />

      <SummaryDisplay
        totals={totals}
        files={files}
        errors={errors}
        exportPayload={exportPayload}
      />

      <ExportButton
        data={exportPayload}
        disabled={!files.length || isProcessing}
      />
    </div>
  );
}
