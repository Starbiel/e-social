import { Building2, User, FileSignature } from "lucide-react";

export type InformeFormData = {
  ano_calendario: string;
  fonte_cnpj: string;
  fonte_nome: string;
  beneficiario_nome: string;
  q8_responsavel_nome: string;
  q8_data: string;
};

type InformeDataFormProps = {
  formData: InformeFormData;
  onChange: (field: keyof InformeFormData, value: string) => void;
};

type InputFieldProps = {
  label: string;
  field: keyof InformeFormData;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  inputMode?: string;
  transformValue?: (value: string) => string;
  formData: InformeFormData;
  onChange: (field: keyof InformeFormData, value: string) => void;
};

const formatCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14),
  ];

  if (parts[3]) {
    return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`.replace(
      /[-/.]+$/g,
      "",
    );
  }
  if (parts[2]) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`.replace(/[.]+$/g, "");
  }
  if (parts[1]) {
    return `${parts[0]}.${parts[1]}`.replace(/[.]+$/g, "");
  }
  return parts[0];
};

const InputField = ({
  label,
  field,
  placeholder,
  type = "text",
  maxLength,
  inputMode,
  transformValue,
  formData,
  onChange,
}: InputFieldProps) => (
  <div>
    <label className="block mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </label>
    <input
      type={type}
      value={formData[field]}
      maxLength={maxLength}
      inputMode={inputMode}
      onChange={(e) => {
        const raw = e.target.value;
        const next = transformValue ? transformValue(raw) : raw;
        onChange(field, next);
      }}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
    />
  </div>
);

export function InformeDataForm({ formData, onChange }: InformeDataFormProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            formData={formData}
            onChange={onChange}
          />
          <InputField
            label="CNPJ"
            field="fonte_cnpj"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            maxLength={18}
            transformValue={formatCnpj}
            formData={formData}
            onChange={onChange}
          />
          <InputField
            label="Nome Empresarial"
            field="fonte_nome"
            placeholder="Razão Social"
            formData={formData}
            onChange={onChange}
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
            label="Nome Completo"
            field="beneficiario_nome"
            placeholder="Nome do Funcionário"
            formData={formData}
            onChange={onChange}
          />
        </div>
      </div>

      {/* Bloco 3: Responsável */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <FileSignature size={18} /> Responsável
        </div>
        <div className="space-y-4">
          <InputField
            label="Nome de quem assina"
            field="q8_responsavel_nome"
            placeholder="Nome"
            formData={formData}
            onChange={onChange}
          />
          <InputField
            label="Data de Emissão"
            field="q8_data"
            type="date"
            formData={formData}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}
