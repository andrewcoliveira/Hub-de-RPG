// ══════════════════════════════════════════════════════════════════
//  7º MAR — Definição das abas de Criação (fonte única de verdade)
//  Porte de SM_TABS/smVisibleTabs (scripts/setimo-mar/app.js).
//  Usado pela store (navegação) e pelo Stepper/ProgressTrack (renderização)
//  — nunca duplique esta lista em outro lugar.
// ══════════════════════════════════════════════════════════════════

import { temFeiticaria, temAcademiaDuelista } from "@/engine/derive";
import type { Ficha } from "@/engine/types";

export interface TabDef {
  id: string;
  label: string;
  /** Título curto (sem o "N · ") para o cabeçalho da folha e o stepper. */
  title: string;
  /** Legenda de uma linha exibida no stepper. */
  subtitle: string;
  cond?: (f: Ficha) => boolean;
}

export const TAB_DEFS: TabDef[] = [
  { id: "conceito", label: "1 · Conceito & Nação", title: "Conceito & Nação", subtitle: "Quem é o seu Herói?" },
  { id: "atributos", label: "2 · Atributos", title: "Atributos", subtitle: "Vigor, Finesse, Determinação…" },
  { id: "formacoes", label: "3 · Formações", title: "Formações", subtitle: "De onde vêm suas perícias" },
  { id: "pericias", label: "4 · Perícias", title: "Perícias", subtitle: "O que você sabe fazer" },
  { id: "vantagens", label: "5 · Vantagens", title: "Vantagens", subtitle: "Dons, contatos e magia" },
  { id: "arcanos", label: "6 · Arcanos", title: "Arcanos", subtitle: "Virtude & Hybris" },
  { id: "feiticaria", label: "7 · Feitiçaria", title: "Feitiçaria", subtitle: "Seu dom de sangue", cond: (f) => temFeiticaria(f) },
  { id: "duelo", label: "8 · Duelo", title: "Duelo", subtitle: "Sua escola de espada", cond: (f) => temAcademiaDuelista(f) },
  { id: "historias", label: "9 · Histórias", title: "Histórias", subtitle: "Ganchos heroicos" },
  { id: "sociedade", label: "10 · Sociedade", title: "Sociedade", subtitle: "A quem você serve" },
  { id: "toques", label: "11 · Toques Finais", title: "Toques Finais", subtitle: "Reputação, idiomas, fortuna" },
  { id: "revisao", label: "12 · Revisão", title: "Revisão", subtitle: "Confira e finalize" },
];

export function visibleTabs(f: Ficha): TabDef[] {
  return TAB_DEFS.filter((t) => !t.cond || t.cond(f));
}
