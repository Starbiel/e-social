import { useCallback } from "react";
import { Card } from "../../../core";

type ExportButtonProps = {
  data: unknown;
  disabled?: boolean;
  fileName?: string;
};

export function ExportButton({
  data,
  disabled = false,
  fileName = "consolidado.json",
}: ExportButtonProps) {
  const handleExport = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [data, fileName]);

  return (
    <Card className="flex items-center justify-between bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-purple-500/10">
      <div>
        <p className="text-sm font-semibold text-slate-100">
          Exportar JSON consolidado
        </p>
        <p className="text-xs text-slate-300">
          Baixe o payload pronto para importar em outros sistemas.
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={handleExport}
        className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
      >
        Exportar
      </button>
    </Card>
  );
}
