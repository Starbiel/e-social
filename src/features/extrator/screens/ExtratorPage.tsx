import { useRef, useState } from "react";
import { ExportButton } from "../components/ExportButton";
import { FileUploader } from "../components/FileUploader";
import {
  InformeDataForm,
  type InformeFormData,
} from "../components/InformeDataForm";
import { SummaryDisplay } from "../components/SummaryDisplay";
import { useXmlConsolidator } from "../hooks/useXmlConsolidator";
import { Printer } from "lucide-react";
import { InformeTemplate } from "../components/InformeTemplate";
import { useReactToPrint } from "react-to-print";

export default function ExtratorPage() {
  const {
    identification,
    allDependents,
    totals,
    files,
    errors,
    isProcessing,
    processFiles,
    reset,
    exportPayload,
    mode,
    setMode,
    healthPlan,
  } = useXmlConsolidator();

  const [formData, setFormData] = useState<InformeFormData>({
    ano_calendario: new Date().getFullYear() - 1 + "",
    fonte_cnpj: "",
    fonte_nome: "",
    beneficiario_nome: "",
    q8_responsavel_nome: "",
    q8_data: new Date().toISOString().split("T")[0],
  });

  const handleFormChange = (field: keyof InformeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 1. Criamos a referência que aponta para o template oculto
  const printRef = useRef<HTMLDivElement>(null);

  // 2. Configuramos o hook do react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Informe_Rendimentos_${formData.ano_calendario}_${formData.beneficiario_nome || "Funcionario"}`,
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Seu Header existente... */}

        <div className="grid gap-8 pb-20">
          <InformeDataForm formData={formData} onChange={handleFormChange} />

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
        </div>

        {/* 3. O Componente invisível aguardando a impressão */}
        <InformeTemplate
          ref={printRef}
          formData={formData}
          totals={totals}
          identification={identification}
          allDependents={allDependents}
          healthPlan={healthPlan}
        />

        {/* Botões Inferiores */}
        {files.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 flex gap-4">
            <div className="flex-1">
              <ExportButton
                data={exportPayload}
                disabled={!files.length || isProcessing}
                fileName="dados-consolidados.json"
              />
            </div>
            <div className="flex-1">
              <button
                onClick={() => handlePrint()}
                disabled={!files.length || isProcessing}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Printer size={20} />
                Gerar PDF (Print)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
