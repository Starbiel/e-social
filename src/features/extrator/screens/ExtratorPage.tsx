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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header Profissional */}
        <header className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400 border border-sky-500/20">
                  S-1210 / S-5002
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  v2.0 Stable
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  Consolidador{" "}
                  <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                    eSocial
                  </span>
                </h1>
                <p className="max-w-2xl text-lg text-slate-400 leading-relaxed">
                  Transforme múltiplos XMLs em dados estratégicos. Soma
                  automatizada de rendimentos, retenções e bases de cálculo.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Grid Principal */}
        <div className="grid gap-8">
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

          {files.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
              <ExportButton
                data={exportPayload}
                disabled={!files.length || isProcessing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
