import { FileText } from "lucide-react";
import { useState } from "react";
import { generateInformePDF } from "../utils/pdf";
import type { InformeFormData } from "./InformeDataForm";
import type { ConsolidatedTotals } from "../types";

type GeneratePdfButtonProps = {
  formData: InformeFormData;
  totals: ConsolidatedTotals;
  disabled: boolean;
};

export function GeneratePdfButton({
  formData,
  totals,
  disabled,
}: GeneratePdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateInformePDF(formData, totals);
    setIsGenerating(false);
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <FileText size={20} className={isGenerating ? "animate-pulse" : ""} />
      {isGenerating ? "A gerar documento..." : "Gerar Informe PDF"}
    </button>
  );
}
