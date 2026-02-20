export function cleanXmlString(xml: string): string {
  if (!xml) return "";
  return xml.replace(/\uFEFF/g, "").trim();
}

export function findConsolidApurNodes(doc: Document): Element[] {
  const allNodes = Array.from(doc.getElementsByTagName("*"));
  return allNodes.filter((node) => node.localName === "consolidApurMen");
}

export function hasParserError(doc: Document): boolean {
  return doc.getElementsByTagName("parsererror").length > 0;
}
