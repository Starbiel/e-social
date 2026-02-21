import { PDFDocument } from "pdf-lib";
import type { InformeFormData } from "../components/InformeDataForm";
import type { ConsolidatedTotals } from "../types";
import { centsToNumber } from "./format";

// Formata o valor de cêntimos para string no formato "1.234,56" (sem "R$")
function formatForPdf(cents: number): string {
  if (!cents || cents === 0) return ""; // Deixa o campo em branco se for zero
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToNumber(cents));
}

// Formata data YYYY-MM-DD para DD/MM/YYYY
function formatDateBR(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export async function generateInformePDF(
  formData: InformeFormData,
  totals: ConsolidatedTotals,
) {
  try {
    // 1. Carregar o template PDF da pasta public
    // Certifique-se de que o PDF está na pasta public/informe-modelo.pdf
    const url = "/informe-modelo.pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Função auxiliar para preencher sem quebrar a execução se o campo não existir
    const fillField = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        if (field) field.setText(value);
      } catch (e) {
        console.warn(`Campo "${fieldName}" não encontrado no PDF.`);
      }
    };

    // 2. Preencher Dados Cadastrais (Quadros 1, 2 e 8)
    fillField("fonte_cnpj", formData.fonte_cnpj);
    fillField("fonte_nome", formData.fonte_nome);
    fillField("beneficiario_nome", formData.beneficiario_nome);
    fillField("q8_responsavel_nome", formData.q8_responsavel_nome);
    fillField("q8_data", formatDateBR(formData.q8_data));

    // 3. Preencher Valores Extraídos do XML (Quadro 3)
    fillField("q3_total_rendimentos", formatForPdf(totals.vlrRendTrib));
    fillField("q3_prev_oficial", formatForPdf(totals.vlrPrevOficial));
    fillField("q3_irrf", formatForPdf(totals.vlrCRMen));

    // 4. Preencher Valores Extraídos do XML (Quadro 4)
    fillField(
      "q4_parcela_isenta_65",
      formatForPdf(totals.vlrParcIsenta65 + totals.vlrParcIsenta65Dec),
    );
    fillField(
      "q4_diarias_ajuda_custo",
      formatForPdf(totals.vlrDiarias + totals.vlrAjudaCusto),
    );
    fillField(
      "q4_molestia_grave",
      formatForPdf(totals.vlrRendMoleGrave + totals.vlrRendMoleGrave13),
    );
    fillField(
      "q4_indenizacoes_rescisao",
      formatForPdf(totals.vlrIndResContrato + totals.vlrAbonoPec),
    );
    fillField("q4_juros_mora", formatForPdf(totals.vlrJurosMora));

    // Agrupando "Outros" do Quadro 4 (Pode ajustar esta lógica conforme a sua regra de negócio)
    const outrosIsentos =
      totals.vlrIsenOutros +
      totals.vlrAuxMoradia +
      totals.vlrBolsaMedico +
      totals.vlrBolsaMedico13;
    if (outrosIsentos > 0) {
      fillField("q4_outros_descricao", "Auxílios, Bolsas e Outras Isenções");
      fillField("q4_outros_valor", formatForPdf(outrosIsentos));
    }

    // 5. Preencher Valores Extraídos do XML (Quadro 5 - 13º Salário)
    fillField("q5_decimo_terceiro", formatForPdf(totals.vlrRendTrib13));
    fillField("q5_irrf_decimo_terceiro", formatForPdf(totals.vlrCR13Men));

    // 6. Finalizar documento
    // form.flatten(); // Descomente esta linha se quiser "trancar" o PDF para não ser mais editável após gerado

    const pdfBytes = await pdfDoc.save();

    // 7. Disparar o download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;

    const safeName =
      formData.beneficiario_nome.trim().replace(/\s+/g, "_") || "Funcionario";
    link.download = `Informe_Rendimentos_${formData.ano_calendario}_${safeName}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert(
      "Ocorreu um erro ao gerar o PDF. Verifique a consola para mais detalhes.",
    );
  }
}
