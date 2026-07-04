// ══════════════════════════════════════════════════════════════════
//  7º MAR — Definição das abas de Criação (fonte única de verdade)
//  Porte de SM_TABS/smVisibleTabs (scripts/setimo-mar/app.js).
//  Usado pela store (navegação) e pela TabBar (renderização) — nunca
//  duplique esta lista em outro lugar.
// ══════════════════════════════════════════════════════════════════

import { temFeiticaria, temAcademiaDuelista } from "@/engine/derive";
import type { Ficha } from "@/engine/types";

export interface TabDef {
  id: string;
  label: string;
  cond?: (f: Ficha) => boolean;
}

export const TAB_DEFS: TabDef[] = [
  { id: "conceito", label: "1 · Conceito & Nação" },
  { id: "atributos", label: "2 · Atributos" },
  { id: "formacoes", label: "3 · Formações" },
  { id: "pericias", label: "4 · Perícias" },
  { id: "vantagens", label: "5 · Vantagens" },
  { id: "arcanos", label: "6 · Arcanos" },
  { id: "feiticaria", label: "7 · Feitiçaria", cond: (f) => temFeiticaria(f) },
  { id: "duelo", label: "8 · Duelo", cond: (f) => temAcademiaDuelista(f) },
  { id: "historias", label: "9 · Histórias" },
  { id: "sociedade", label: "10 · Sociedade" },
  { id: "toques", label: "11 · Toques Finais" },
  { id: "revisao", label: "12 · Revisão" },
];

export function visibleTabs(f: Ficha): TabDef[] {
  return TAB_DEFS.filter((t) => !t.cond || t.cond(f));
}
