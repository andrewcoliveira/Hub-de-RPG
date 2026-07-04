// ══════════════════════════════════════════════════════════════════
//  7º MAR — Export/Import/Imprimir (helpers de I/O)
//  exportFicha: baixa a ficha como .json.
//  importFichaFromFile: lê um File, faz JSON.parse e entrega ao chamador
//    (a TopBar liga isso a `useFicha.getState().importFicha`, que usa
//    `mergeDefaults` para nunca perder sub-objetos).
//  printSheet: dispara window.print() (o CSS @media print cuida do resto).
// ══════════════════════════════════════════════════════════════════

import type { Ficha } from "@/engine/types";

function safeFileName(name: string): string {
  const base = (name || "ficha-7omar").trim() || "ficha-7omar";
  return base.replace(/[^\w-]+/g, "_");
}

/** Gera um Blob JSON da ficha e dispara o download no navegador. */
export function exportFicha(f: Ficha): void {
  try {
    const json = JSON.stringify(f, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const fileName = `${safeFileName(f?.concept?.name)}.7omar.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Falha ao exportar ficha:", err);
    alert("Não foi possível exportar a ficha.");
  }
}

/**
 * Lê um File (JSON exportado anteriormente) e entrega os dados brutos
 * (unknown) para `onLoaded` — normalmente `useFicha.getState().importFicha`,
 * que aplica `mergeDefaults` para preencher sub-objetos ausentes.
 */
export function importFichaFromFile(file: File, onLoaded: (data: unknown) => void): void {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = typeof reader.result === "string" ? reader.result : "";
      const data = JSON.parse(text);
      onLoaded(data);
    } catch (err) {
      console.error("Falha ao importar ficha:", err);
      alert("Arquivo inválido: não foi possível ler a ficha.");
    }
  };
  reader.onerror = () => {
    console.error("Falha ao ler o arquivo:", reader.error);
    alert("Não foi possível ler o arquivo selecionado.");
  };
  reader.readAsText(file);
}

/** Dispara a impressão do navegador (o CSS @media print mostra só a ficha). */
export function printSheet(): void {
  if (typeof window !== "undefined" && typeof window.print === "function") {
    window.print();
  }
}
