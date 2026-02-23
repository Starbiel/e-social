import { Download } from "lucide-react";

export function ExportButton({
  data,
  disabled,
  fileName = "consolidado.json",
}: any) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-sky-500 px-8 py-4 font-bold text-white shadow-[0_20px_50px_-10px_rgba(14,165,233,0.5)] transition-all hover:scale-[1.02] hover:bg-sky-400 active:scale-95 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <Download size={20} />
      Exportar Consolidado
    </button>
  );
}
