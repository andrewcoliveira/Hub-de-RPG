// ══════════════════════════════════════════════════════════════════
//  7º MAR — Acentos por nação (fonte de verdade compartilhada com
//  src/theme/tokens.css). Mesmos valores hex, usados por legendas/testes.
// ══════════════════════════════════════════════════════════════════

import type { NationKey } from "@/engine/types";

export const NATION_ACCENTS: Record<NationKey, { accent: string; accentInk: string }> = {
  avalon: { accent: "#2c7a7b", accentInk: "#eafcfb" },
  castilha: { accent: "#a3341f", accentInk: "#ffe9e2" },
  sarmacia: { accent: "#b0872f", accentInk: "#241a06" },
  eisen: { accent: "#6b6f76", accentInk: "#f2f3f5" },
  inismore: { accent: "#2f7d4f", accentInk: "#e8fbef" },
  montaigne: { accent: "#3f5fb0", accentInk: "#eaefff" },
  terrasaltas: { accent: "#5a6e3a", accentInk: "#f0f5e4" },
  ussura: { accent: "#4a7fa5", accentInk: "#eaf4fb" },
  vesten: { accent: "#7a5aa0", accentInk: "#f3ecff" },
  vodacce: { accent: "#8c2f57", accentInk: "#ffe9f1" },
};
