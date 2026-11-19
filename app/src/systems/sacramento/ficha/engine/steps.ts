// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Etapas do criador e o status de cada uma
// ══════════════════════════════════════════════════════════════════

import { ANTECEDENTS, ATTRS } from "./data/core";
import { scaleAt, skillIndex } from "./data/skills";
import { CUSTOM_TRAIL, trailIndex } from "./data/redemption";
import {
  antecedentLeft, antecedentMax, antecedentRoll, attrLeft, conditions, isRedeemed, mountLeft, mountStats, skillIssues,
  skillSlots, stepsDone,
} from "./rules";
import { damageText, fmtMoney, moneyLeft, ownedItems, packing } from "./gear";
import type { SacramentoState } from "./state";

export const STEPS = [
  { key: "conceito", label: "Conceito" },
  { key: "atributos", label: "Atributos" },
  { key: "antecedentes", label: "Antecedentes" },
  { key: "habilidades", label: "Habilidades" },
  { key: "redencao", label: "Redenção" },
  { key: "montaria", label: "Montaria" },
  { key: "equipamento", label: "Equipamento" },
  { key: "ficha", label: "Ficha final" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
export const CORE_STEPS = STEPS.slice(0, 7);
export const isStepKey = (k: unknown): k is StepKey => STEPS.some((s) => s.key === k);

export type StepState = "todo" | "partial" | "done" | "warn";
export interface Status { state: StepState; text: string }

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function stepStatus(s: SacramentoState, key: StepKey): Status {
  switch (key) {
    case "conceito":
      if (s.name.trim() && s.concept.trim()) return { state: "done", text: s.name.trim() };
      return s.name.trim() || s.concept.trim() ? { state: "partial", text: s.name.trim() || "Sem nome" } : { state: "todo", text: "Nome e conceito" };
    case "atributos": {
      const left = attrLeft(s);
      if (left < 0) return { state: "warn", text: "Acima do limite" };
      if (!left) return { state: "done", text: "Distribuídos" };
      return { state: ATTRS.some((a) => s.attrs[a.key]) ? "partial" : "todo", text: `${plural(left, "ponto")} restante${left === 1 ? "" : "s"}` };
    }
    case "antecedentes": {
      const left = antecedentLeft(s);
      if (left < 0 || ANTECEDENTS.some((a) => s.antecedents[a.key] > antecedentMax(s))) return { state: "warn", text: "Revise" };
      if (!left) return { state: "done", text: "Distribuídos" };
      return { state: ANTECEDENTS.some((a) => s.antecedents[a.key]) ? "partial" : "todo", text: `${plural(left, "ponto")} restante${left === 1 ? "" : "s"}` };
    }
    case "habilidades": {
      if (skillIssues(s).length) return { state: "warn", text: "Revise" };
      const n = s.skills.length, slots = skillSlots(s);
      return { state: n === slots ? "done" : n ? "partial" : "todo", text: `${n}/${slots}` };
    }
    case "redencao": {
      const r = s.redemption;
      if (!r.trail) return { state: "todo", text: "Escolha a trilha" };
      if (!r.premise.trim()) return { state: "partial", text: "Escreva a premissa" };
      if (isRedeemed(s)) return { state: "done", text: "Redimido!" };
      const label = r.trail === CUSTOM_TRAIL ? "Trilha própria" : trailIndex.get(r.trail)!.label;
      return { state: "done", text: `${label} · ${stepsDone(s)}/6` };
    }
    case "montaria": {
      if (!s.mount.enabled) return { state: "done", text: "A pé" };
      const left = mountLeft(s);
      if (left < 0) return { state: "warn", text: "Acima do limite" };
      return left ? { state: "partial", text: `${plural(left, "ponto")} restante${left === 1 ? "" : "s"}` } : { state: "done", text: s.mount.name.trim() || s.mount.kind };
    }
    case "equipamento": {
      const money = moneyLeft(s), p = packing(s);
      if (money < 0) return { state: "warn", text: "Sem dinheiro" };
      if (p.used > p.capacity) return { state: "warn", text: "Mochila cheia" };
      return ownedItems(s).length ? { state: "done", text: `${fmtMoney(money)} sobrando` } : { state: "todo", text: "$200 para gastar" };
    }
    case "ficha":
      return sheetReady(s) ? { state: "done", text: "Pronta" } : { state: "todo", text: "Incompleta" };
  }
}

/** A ficha pode ser vista quando Atributos e Antecedentes estão distribuídos. */
export const sheetReady = (s: SacramentoState): boolean => attrLeft(s) === 0 && antecedentLeft(s) === 0;

/** Ficha em texto simples (botão "Copiar texto"). */
export function sheetText(s: SacramentoState): string {
  const c = conditions(s);
  const lines = [
    `${s.name || "Forasteiro sem nome"} — Nível ${s.level} (${s.xp} XP)`,
    s.concept ? `Conceito: ${s.concept}` : "",
    "",
    `Vida ${c.vida} · Dor ${c.dor} · Movimentos ${c.movimentos} · Ações de Combate ${c.acoes} · Defesa ${c.defesa}${c.defesaFuria !== null ? ` (${c.defesaFuria} com Fúria)` : ""} · Iniciativa: ${c.iniciativa}`,
    `ATRIBUTOS: ${ATTRS.map((a) => `${a.label} ${s.attrs[a.key]}`).join(" · ")}`,
    `ANTECEDENTES: ${ANTECEDENTS.map((a) => `${a.label} ${antecedentRoll(s, a.key).text}`).join(" · ")}`,
    "",
    "HABILIDADES",
    ...(s.skills.length ? [...new Set(s.skills)].map((k) => {
      const def = skillIndex.get(k)!, n = s.skills.filter((x) => x === k).length;
      const sc = scaleAt(def, s.level);
      return `• ${def.name}${n > 1 ? ` ×${n}` : ""}${sc ? ` (${def.scale!.title}: ${sc})` : ""}`;
    }) : ["—"]),
  ];
  if (s.redemption.trail) {
    lines.push("", `REDENÇÃO (${s.redemption.trail === CUSTOM_TRAIL ? "trilha própria" : trailIndex.get(s.redemption.trail)!.label}): ${s.redemption.premise}`);
    s.redemption.steps.forEach((st, i) => lines.push(`${s.redemption.done[i] ? "[x]" : "[ ]"} Passo ${i + 1}: ${st}`));
  }
  if (s.mount.enabled) {
    const m = mountStats(s);
    lines.push("", `MONTARIA: ${s.mount.name || "sem nome"} (${s.mount.kind}) · Potência ${m.potencia} · Resistência ${m.resistencia} · Vida ${m.vida} · Dor ${m.dor} · Fidelidade ${s.mount.fidelidade}`);
  }
  const owned = ownedItems(s);
  if (owned.length) {
    lines.push("", "EQUIPAMENTO");
    owned.forEach((x) => lines.push(`• ${x.def.name}${x.qty > 1 ? ` ×${x.qty}` : ""}${x.def.damage ? ` — dano ${damageText(x.def.damage)}` : ""}`));
  }
  lines.push("", `Dinheiro: ${fmtMoney(moneyLeft(s))} · Recompensa pela cabeça: $0`);
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}
