import { Building2, User, FileSignature, FileText } from "lucide-react";

export type InformeFormData = {
  ano_calendario: string;
  fonte_cnpj: string;
  fonte_nome: string;
  beneficiario_cpf: string;
  beneficiario_nome: string;
  q7_informacoes_complementares: string; // <-- NOVO CAMPO
  q8_responsavel_nome: string;
  q8_data: string;
};

type InformeDataFormProps = {
  formData: InformeFormData;
  onChange: (field: keyof InformeFormData, value: string) => void;
};

export function InformeDataForm({ formData, onChange }: InformeDataFormProps) {
  const InputField = ({ label, field, placeholder, type = "text" }: any) => (
    <div>
      <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <input
        type={type}
        value={formData[field as keyof InformeFormData]}
        onChange={(e) =>
          onChange(field as keyof InformeFormData, e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
      />
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Bloco 1: Empresa */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-400">
          <Building2 size={18} /> Fonte Pagadora
        </div>
        <div className="space-y-4">
          <InputField
            label="Ano Calendário"
            field="ano_calendario"
            placeholder="Ex: 2025"
          />
          <InputField
            label="CNPJ"
            field="fonte_cnpj"
            placeholder="00.000.000/0000-00"
          />
          <InputField
            label="Nome Empresarial"
            field="fonte_nome"
            placeholder="Razão Social"
          />
        </div>
      </div>

      {/* Bloco 2: Colaborador */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-purple-400">
          <User size={18} /> Beneficiário
        </div>
        <div className="space-y-4">
          <InputField
            label="CPF"
            field="beneficiario_cpf"
            placeholder="000.000.000-00"
          />
          <InputField
            label="Nome Completo"
            field="beneficiario_nome"
            placeholder="Nome do Funcionário"
          />
        </div>
      </div>

      {/* Bloco 3: Informações Complementares (Quadro 7) - NOVO */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-amber-400">
          <FileText size={18} /> Informações Complementares
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Quadro 7 (Opcional)
            </label>
            <textarea
              value={formData.q7_informacoes_complementares}
              onChange={(e) =>
                onChange("q7_informacoes_complementares", e.target.value)
              }
              placeholder="Ex: Plano de saúde corporativo operadora X..."
              className="w-full h-[150px] rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none resize-none custom-scroll"
            />
          </div>
        </div>
      </div>

      {/* Bloco 4: Responsável */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <FileSignature size={18} /> Responsável
        </div>
        <div className="space-y-4">
          <InputField
            label="Nome de quem assina"
            field="q8_responsavel_nome"
            placeholder="Nome"
          />
          <InputField label="Data de Emissão" field="q8_data" type="date" />
        </div>
      </div>
    </div>
  );
}
