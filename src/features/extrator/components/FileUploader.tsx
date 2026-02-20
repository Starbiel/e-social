import { useCallback, useState } from "react";
import { Card } from "../../../core";
import type { CalculationMode } from "../hooks/useXmlConsolidator";

type FileUploaderProps = {
  isProcessing?: boolean;
  onFilesSelected: (files: File[]) => void;
  onReset?: () => void;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
};

export function FileUploader({
  isProcessing = false,
  onFilesSelected,
  onReset,
  mode,
  setMode,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      if (files.length) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <Card
      title="Upload de XMLs"
      subtitle="Arraste e solte até 13 meses ou selecione múltiplos arquivos .xml para consolidar valores."
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onReset?.()}
            className="rounded-xl border border-slate-700 px-3 py-1 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
          >
            Limpar
          </button>
        </div>
      }
    >
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as CalculationMode)}
        className="mb-4 rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <option value="official">Oficial eSocial (Líquido)</option>
        <option value="accountant-dmdev">Visão Contador (Bruto/Folha)</option>
      </select>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isDragging
            ? "border-sky-400 bg-sky-500/5"
            : "border-slate-700 bg-slate-900/40"
        } ${isProcessing ? "opacity-70" : "hover:border-slate-500 hover:bg-slate-900"}`}
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-sky-300">
            XML
          </span>
          <span className="text-sm text-slate-300">S-1210 / S-5002</span>
        </div>
        <p className="text-xl font-semibold text-slate-100">
          Solte seus arquivos aqui
        </p>
        <p className="max-w-xl text-sm text-slate-400">
          Aceitamos múltiplos XMLs com ou sem namespaces. O consolidado soma
          rendimentos, INSS e IRRF considerando múltiplos vínculos dentro de
          cada arquivo.
        </p>
        <input
          type="file"
          accept=".xml,text/xml"
          multiple
          disabled={isProcessing}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>
    </Card>
  );
}
