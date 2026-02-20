import { useState } from "react";
import { Upload, Trash2, Settings2 } from "lucide-react";

export function FileUploader({
  isProcessing = false,
  onFilesSelected,
  onReset,
  mode,
  setMode,
}: any) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar de Configuração */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 size={16} className="text-sky-400" />
            Configuração
          </div>
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
              Modo de Cálculo
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
            >
              <option value="official">Oficial eSocial (Líquido)</option>
              <option value="accountant-dmdev">Visão Contador (Bruto)</option>
            </select>
            <button
              onClick={() => onReset?.()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            >
              <Trash2 size={16} /> Limpar Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Área de Drop */}
      <div className="lg:col-span-3">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onFilesSelected(Array.from(e.dataTransfer.files));
          }}
          className={`relative flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-sky-500 bg-sky-500/10 scale-[0.99]"
              : "border-slate-800 bg-slate-900/20 hover:border-slate-600 hover:bg-slate-900/40"
          }`}
        >
          <input
            type="file"
            multiple
            accept=".xml"
            className="hidden"
            onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
          />

          <div
            className={`rounded-2xl p-4 transition-transform duration-500 ${isDragging ? "rotate-12 scale-110" : ""} bg-slate-800 text-sky-400 shadow-xl`}
          >
            <Upload size={32} />
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-white">
              Arraste seus XMLs aqui
            </p>
            <p className="text-sm text-slate-400 mt-1">
              S-1210 e S-5002 • Até 50 arquivos simultâneos
            </p>
          </div>

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-slate-950/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 font-medium text-sky-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                Processando arquivos...
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
