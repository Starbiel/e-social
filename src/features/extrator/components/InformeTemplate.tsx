import { forwardRef } from "react";
import type { InformeFormData } from "./InformeDataForm";
import type { ConsolidatedTotals, DependenteInfo } from "../types";
import { formatCurrency, centsToNumber } from "../utils/format";
import { buildInformeValues } from "../utils/buildInformeValues";
import type { ExtractedIdentification } from "../utils/extractIdentification";
import { darfCodesMap } from "../config/darfCodesMap";

type Props = {
  formData: InformeFormData;
  totals: ConsolidatedTotals;
  identification: ExtractedIdentification | undefined;
  allDependents?: DependenteInfo[];
};

export const InformeTemplate = forwardRef<HTMLDivElement, Props>(
  ({ formData, totals, identification, allDependents }, ref) => {
    // Funções auxiliares mantidas para consistência dos dados
    const informe = buildInformeValues(totals);
    const formatVal = (cents: number | undefined) => {
      if (!cents) return "0,00";
      return formatCurrency(centsToNumber(cents)).replace("R$", "").trim();
    };

    const formatCpf = (cpf: string) => {
      const cleaned = cpf.replace(/\D/g, "").padStart(11, "0");
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatDate = (date: string) => {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    };

    const generateQ7Lines = () => {
      const lines: string[] = [];

      // 1. Informações sobre RRA (Quadro 1, Quadro 3)
      if (informe.q3.totalRendimentos > 0) {
        lines.push(
          "OS RENDIMENTOS SEGUINTES ESTÃO INFORMADOS NA LINHA 01, QUADRO 3:",
        );
        lines.push(
          `${identification?.darfBenCode} - ${darfCodesMap[identification?.darfBenCode || ""] || "Não identificado"} - R$ ${formatVal(informe.q3.totalRendimentos)}`,
        );
        lines.push("");
      }

      // 2. Abono Pecuniário / Indenizações
      if (totals.vlrAbonoPec > 0 || totals.vlrIndResContrato > 0) {
        lines.push(
          "OS RENDIMENTOS SEGUINTES ESTÃO INFORMADOS NA LINHA 07, QUADRO 4:",
        );
        if (totals.vlrAbonoPec > 0)
          lines.push(`ABONO PECUNIÁRIO: R$ ${formatVal(totals.vlrAbonoPec)}`);
        if (totals.vlrIndResContrato > 0)
          lines.push(
            `INDENIZAÇÃO RESCISÓRIA: R$ ${formatVal(totals.vlrIndResContrato)}`,
          );
        lines.push("");
      }

      if (totals.vlrIsenOutros > 0) {
        lines.push(
          "RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS, INFORMADOS NA LINHA 09, QUADRO 4:",
        );
        lines.push(`Outros: R$ ${formatVal(totals.vlrIsenOutros)}`);
        lines.push("");
      }

      // 3. Pensão Alimentícia Detalhada
      if (
        totals.vlrDedPenAlim > 0 ||
        totals.vlrDedPenAlimRRA > 0 ||
        (allDependents && allDependents.length > 0)
      ) {
        lines.push("BENEFICIÁRIOS DE PENSÃO ALIMENTÍCIA:");
        lines.push(
          "CPF             NOME                             VLR. NORMAL   13º SALÁRIO",
        );
        allDependents?.forEach((dep: DependenteInfo) => {
          const cpfFormatado = formatCpf(dep.cpf).padEnd(15, " ");
          const nomeFormatado = dep.nome
            .toUpperCase()
            .substring(0, 30)
            .padEnd(30, " ");
          const vlrNormal = formatVal(dep.valorDeducao).padStart(12, " ");
          const vlr13 = formatVal(0).padStart(12, " "); // Caso tenha o campo de 13º no tipo, troque o 0 por ele

          lines.push(`${cpfFormatado} ${nomeFormatado} ${vlrNormal} ${vlr13}`);
        });

        lines.push("");
      }

      return lines;
    };

    const q7Lines = generateQ7Lines();

    // Estilos baseados no modelo HTML enviado
    const labelStyle = "block text-[6.5pt] mb-[1px] text-gray-700 uppercase";
    const valStyle = "font-bold text-[9pt] min-h-[12pt] block";
    const tdNumStyle =
      "w-[20px] text-center border-r border-black font-bold text-[8pt]";
    const tdLabelStyle = "px-2 py-[2px] text-[8pt]";
    const tdValStyle =
      "w-[120px] text-right border-left border-black font-mono font-bold text-[9pt] px-2";

    return (
      <div className="hidden">
        <div
          ref={ref}
          className="bg-white text-black p-5 font-sans leading-tight w-[210mm] mx-auto print:block"
          style={{ fontSize: "8pt" }}
        >
          <div className="border border-black">
            {/* CABEÇALHO */}
            <div className="text-center border-b border-black p-2">
              <p className="m-0">MINISTÉRIO DA ECONOMIA</p>
              <p className="m-0">
                Secretaria Especial da Receita Federal do Brasil
              </p>
              <b className="text-[10pt] uppercase block mt-1">
                Comprovante de Rendimentos Pagos e de Imposto sobre a Renda
                Retido na Fonte
              </b>
              <p className="mt-1">
                Ano-Calendário de <b>{formData.ano_calendario}</b>{" "}
                &nbsp;&nbsp;&nbsp; Exercício de{" "}
                <b>{parseInt(formData.ano_calendario) + 1}</b>
              </p>
            </div>

            {/* QUADRO 1 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                1. Fonte Pagadora Pessoa Jurídica ou Pessoa Física
              </div>
              <div className="flex">
                <div className="border-r border-black p-1 w-45">
                  <span className={labelStyle}>CNPJ/CPF</span>
                  <span className={valStyle}>{formData.fonte_cnpj}</span>
                </div>
                <div className="p-1 flex-1">
                  <span className={labelStyle}>
                    Nome Empresarial/Nome Completo
                  </span>
                  <span className={valStyle}>{formData.fonte_nome}</span>
                </div>
              </div>
            </div>

            {/* QUADRO 2 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                2. Pessoa Física Beneficiária dos Rendimentos
              </div>
              <div className="flex border-b border-black">
                <div className="border-r border-black p-1 w-45">
                  <span className={labelStyle}>CPF</span>
                  <span className={valStyle}>
                    {formatCpf(identification?.beneficiarioCpf || "")}
                  </span>
                </div>
                <div className="p-1 flex-1">
                  <span className={labelStyle}>Nome</span>
                  <span className={valStyle}>{formData.beneficiario_nome}</span>
                </div>
              </div>
              <div className="p-1">
                <span className={labelStyle}>Natureza do Rendimento</span>
                <span className={valStyle}>
                  {darfCodesMap[identification?.darfBenCode || ""] ||
                    "Não identificado"}
                </span>
              </div>
            </div>

            {/* QUADRO 3 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black flex justify-between text-[7.5pt]">
                <span>
                  3. Rendimentos Tributáveis, Deduções e Imposto sobre a Renda
                  Retido na Fonte
                </span>
                <span className="font-normal uppercase">Valores em reais</span>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>1</td>
                    <td className={tdLabelStyle}>
                      Total dos Rendimentos (inclusive férias)
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q3.totalRendimentos)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>2</td>
                    <td className={tdLabelStyle}>
                      Contribuição Previdenciária Oficial
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q3.prevOficial)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>3</td>
                    <td className={tdLabelStyle}>
                      Contribuição a Entidades de Previdência Complementar e
                      FAPI
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q3.prevComplementar)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>4</td>
                    <td className={tdLabelStyle}>Pensão Alimentícia</td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q3.pensao)}
                    </td>
                  </tr>
                  <tr>
                    <td className={tdNumStyle}>5</td>
                    <td className={tdLabelStyle}>
                      Imposto sobre a Renda Retido na Fonte
                    </td>
                    <td className={tdValStyle}>{formatVal(informe.q3.irrf)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QUADRO 4 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                4. Rendimentos Isentos e Não Tributáveis
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    {
                      t: "Parcela Isenta de Aposentadoria (65 anos ou mais) - Mensal",
                      v: informe.q4.linha1,
                    },
                    {
                      t: "Parcela Isenta de Aposentadoria (65 anos ou mais) - 13º Salário",
                      v: informe.q4.linha2,
                    },
                    { t: "Diárias e Ajudas de Custo", v: informe.q4.linha3 },
                    {
                      t: "Pensão/Proventos por Moléstia Grave ou Acidente em Serviço",
                      v: informe.q4.linha4,
                    },
                    {
                      t: "Lucros e Dividendos pagos por PJ",
                      v: informe.q4.linha5,
                    },
                    {
                      t: "Valores pagos ao Titular de ME ou EPP (exceto Pró-Labore)",
                      v: informe.q4.linha6,
                    },
                  ].map((item, i) => (
                    <tr key={i} className="border-b border-black">
                      <td className={tdNumStyle}>{i + 1}</td>
                      <td className={tdLabelStyle}>{item.t}</td>
                      <td className={tdValStyle}>{formatVal(item.v)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>7</td>
                    <td className={tdLabelStyle}>
                      Indenizações por Rescisão de Contrato e Acidente de
                      Trabalho
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q4.linha7)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>8</td>
                    <td className={tdLabelStyle}>
                      Juros de Mora por Atraso de Remuneração
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q4.linha8)}
                    </td>
                  </tr>
                  <tr>
                    <td className={tdNumStyle}>9</td>
                    <td className={tdLabelStyle}>Outros:</td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q4.linha9)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QUADRO 5 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                5. Rendimentos Sujeitos à Tributação Exclusiva (Rendimento
                Líquido)
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>1</td>
                    <td className={tdLabelStyle}>
                      13º (Décimo Terceiro) Salário
                    </td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q5.decimoTerceiro)}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className={tdNumStyle}>2</td>
                    <td className={tdLabelStyle}>IRRF sobre 13º Salário</td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q5.irrfDecimo)}
                    </td>
                  </tr>
                  <tr>
                    <td className={tdNumStyle}>3</td>
                    <td className={tdLabelStyle}>Outros:</td>
                    <td className={tdValStyle}>
                      {formatVal(informe.q5.outros)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QUADRO 6 - RRA */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                6. Rendimentos Recebidos Acumuladamente (Art. 12-A da Lei nº
                7.713/1988)
              </div>
              <div className="flex border-b border-black">
                <div className="border-r border-black p-1 flex-1">
                  <span className={labelStyle}>Número do Processo</span>
                  <span className={valStyle}></span>
                </div>
                <div className="p-1 w-30">
                  <span className={labelStyle}>Qtd. Meses</span>
                  <span className={valStyle}></span>
                </div>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {[
                    {
                      t: "Total dos Rendimentos Tributáveis (inc. 13º)",
                      v: informe.q6.totalRendimentos,
                    },
                    {
                      t: "Exclusão: Despesas com Ação Judicial",
                      v: informe.q6.exclusaoDespesas,
                    },
                    {
                      t: "Dedução: Contribuição Previdenciária Oficial",
                      v: informe.q6.prevOficial,
                    },
                    { t: "Dedução: Pensão Alimentícia", v: informe.q6.pensao },
                    {
                      t: "Imposto sobre a Renda Retido na Fonte",
                      v: informe.q6.irrf,
                    },
                  ].map((item, i) => (
                    <tr
                      key={i}
                      className={i === 4 ? "" : "border-b border-black"}
                    >
                      <td className={tdNumStyle}>{i + 1}</td>
                      <td className={tdLabelStyle}>{item.t}</td>
                      <td className={tdValStyle}>{formatVal(item.v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QUADRO 7 */}
            <div className="border-b border-black">
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                7. Informações Complementares
              </div>
              <div className="p-2 min-h-25 text-[7pt] font-mono whitespace-pre-wrap uppercase leading-[1.2]">
                {q7Lines.length > 0
                  ? q7Lines.map((line, i) => <div key={i}>{line}</div>)
                  : "Nenhuma informação complementar."}
              </div>
            </div>

            {/* QUADRO 8 */}
            <div>
              <div className="bg-gray-200 font-bold px-2 py-1 border-b border-black text-[7.5pt]">
                8. Responsável pelas Informações
              </div>
              <div className="flex">
                <div className="border-r border-black p-1 flex-2">
                  <span className={labelStyle}>Nome</span>
                  <span className={valStyle}>
                    {formData.q8_responsavel_nome}
                  </span>
                </div>
                <div className="border-r border-black p-1 flex-1">
                  <span className={labelStyle}>Data</span>
                  <span className={valStyle}>
                    {formatDate(formData.q8_data)}
                  </span>
                </div>
                <div className="p-1 flex-1 text-center">
                  <span className={labelStyle}>Assinatura</span>
                  <span className="text-[7pt] italic text-gray-500 mt-2 block">
                    Dispensada (IN/RFB 1215/2011)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

InformeTemplate.displayName = "InformeTemplate";
