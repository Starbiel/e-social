export type ExtractedIdentification = {
  fonteDocumento?: string;
  fonteTipo?: "CNPJ" | "CPF";
  beneficiarioCpf?: string;
  anoCalendario?: string;
  darfBenCode?: string;
};

export function extractIdentification(doc: Document): ExtractedIdentification {
  const empregador = doc.getElementsByTagName("ideEmpregador")[0];

  const consolidado = doc.getElementsByTagName("consolidApurMen")[0];
  const darfCode = consolidado
    ?.getElementsByTagName("CRMen")[0]
    ?.textContent?.substring(0, 4);
  const trabalhador = doc.getElementsByTagName("ideTrabalhador")[0];

  const tpInsc =
    empregador?.getElementsByTagName("tpInsc")[0]?.textContent ?? "";
  const nrInsc =
    empregador?.getElementsByTagName("nrInsc")[0]?.textContent ?? "";

  const cpfBenef =
    trabalhador?.getElementsByTagName("cpfBenef")[0]?.textContent ?? "";

  // Ano calendário vem do perRef (preferencial) ou perApur
  const perRef =
    trabalhador?.getElementsByTagName("perRef")[0]?.textContent ??
    doc.getElementsByTagName("perApur")[0]?.textContent ??
    "";

  const anoCalendario = perRef ? perRef.split("-")[0] : undefined;

  return {
    fonteDocumento: nrInsc || undefined,
    fonteTipo: tpInsc === "1" ? "CNPJ" : tpInsc === "2" ? "CPF" : undefined,
    beneficiarioCpf: cpfBenef || undefined,
    anoCalendario,
    darfBenCode: darfCode || undefined,
  };
}
