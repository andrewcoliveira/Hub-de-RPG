// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Regras do personagem: nível, atributos, condições,
//  Antecedentes, Habilidades, Redenção e montaria.
// ══════════════════════════════════════════════════════════════════

import {
  ANTECEDENTS, ANTECEDENT_MAX, ANTECEDENT_MAX_L1, ATTRS, LEVELS, MAX_LEVEL, START, type Antecedent, type Attr,
} from "./data/core";
import { skillIndex } from "./data/skills";
import { CUSTOM_TRAIL, trailIndex } from "./data/redemption";
import type { SacramentoState } from "./state";

// ── Nível ─────────────────────────────────────────────────────────

export const levelsUpTo = (s: SacramentoState) => LEVELS.filter((l) => l.level <= s.level);
/** Nível que o XP atual permite (tabela de Experiência). */
export const levelForXp = (xp: number): number => LEVELS.filter((l) => xp >= l.xp).at(-1)!.level;

export function setLevel(d: SacramentoState, level: number): void {
  d.level = Math.max(1, Math.min(MAX_LEVEL, level));
}

// ── Atributos ─────────────────────────────────────────────────────

export const attrPoints = (s: SacramentoState): number =>
  START.atributos + levelsUpTo(s).reduce((t, l) => t + (l.atributo ?? 0), 0);
export const attrSpent = (s: SacramentoState): number => ATTRS.reduce((t, a) => t + s.attrs[a.key], 0);
export const attrLeft = (s: SacramentoState): number => attrPoints(s) - attrSpent(s);

export function canChangeAttr(s: SacramentoState, a: Attr, delta: 1 | -1): boolean {
  const v = s.attrs[a] + delta;
  return v >= 0 && (delta < 0 || attrLeft(s) > 0);
}
export function changeAttr(d: SacramentoState, a: Attr, delta: 1 | -1): boolean {
  if (!canChangeAttr(d, a, delta)) return false;
  d.attrs[a] += delta;
  return true;
}

// ── Antecedentes ──────────────────────────────────────────────────

/** 4 pontos + 1 por ponto de Intelecto (+1 no nível 2). */
export const antecedentPoints = (s: SacramentoState): number =>
  START.antecedentes + s.attrs.intelecto + levelsUpTo(s).reduce((t, l) => t + (l.antecedente ?? 0), 0);
export const antecedentSpent = (s: SacramentoState): number => ANTECEDENTS.reduce((t, a) => t + s.antecedents[a.key], 0);
export const antecedentLeft = (s: SacramentoState): number => antecedentPoints(s) - antecedentSpent(s);
/** Máximo de 2 pontos no mesmo Antecedente no nível 1 (a ficha tem 5 círculos). */
export const antecedentMax = (s: SacramentoState): number => (s.level === 1 ? ANTECEDENT_MAX_L1 : ANTECEDENT_MAX);

export function canChangeAntecedent(s: SacramentoState, a: Antecedent, delta: 1 | -1): boolean {
  const v = s.antecedents[a] + delta;
  if (v < 0) return false;
  if (delta > 0) return v <= antecedentMax(s) && antecedentLeft(s) > 0;
  return true;
}
export function changeAntecedent(d: SacramentoState, a: Antecedent, delta: 1 | -1): boolean {
  if (!canChangeAntecedent(d, a, delta)) return false;
  d.antecedents[a] += delta;
  return true;
}

/** Habilidades que fazem rolar 2d6 (fica com o melhor) em um Antecedente. */
const TWO_DICE: Record<string, { ant: Antecedent; when: string }> = {
  "boca-na-botija": { ant: "atencao", when: "sempre" },
  "natural-da-natureza": { ant: "suor", when: "sempre" },
  "sabia-imperatriz": { ant: "negocios", when: "sempre" },
  "nao-vai-doer-nadinha": { ant: "medicina", when: "sempre" },
  "fumaca-na-agua": { ant: "roubo", when: "para afanar, se esconder ou andar em silêncio" },
  "zoi-de-coruja": { ant: "tradicao", when: "para lembrar de conhecimentos" },
  "galope-certeiro": { ant: "montaria", when: "no próprio cavalo" },
};

export function antecedentRoll(s: SacramentoState, a: Antecedent): { text: string; best: { skill: string; when: string }[] } {
  const v = s.antecedents[a];
  const best = [...new Set(s.skills)]
    .filter((k) => TWO_DICE[k]?.ant === a)
    .map((k) => ({ skill: skillIndex.get(k)!.name, when: TWO_DICE[k].when }));
  return { text: `1d6${v ? `+${v}` : ""}`, best };
}

// ── Habilidades ───────────────────────────────────────────────────

export const isRedeemed = (s: SacramentoState): boolean => !!s.redemption.trail && s.redemption.done.every(Boolean);

/** 2 no nível 1, +1 nos níveis 2, 3, 4 e 6, +1 ao alcançar a Redenção. */
export const skillSlots = (s: SacramentoState): number =>
  2 + levelsUpTo(s).reduce((t, l) => t + (l.habilidade ?? 0), 0) + (isRedeemed(s) ? 1 : 0);

export const skillCount = (s: SacramentoState, key: string): number => s.skills.filter((k) => k === key).length;

export function addSkill(d: SacramentoState, key: string): "ok" | "full" | "taken" {
  const def = skillIndex.get(key);
  if (!def) return "taken";
  if (!def.repeatable && d.skills.includes(key)) return "taken";
  if (d.skills.length >= skillSlots(d)) return "full";
  d.skills.push(key);
  return "ok";
}

export function removeSkill(d: SacramentoState, key: string): void {
  const i = d.skills.lastIndexOf(key);
  if (i >= 0) d.skills.splice(i, 1);
}

/** Avisos das Habilidades (Sorte dos Covardes deixa de funcionar). */
export function skillIssues(s: SacramentoState): string[] {
  const out: string[] = [];
  if (s.skills.includes("sorte-dos-covardes") && (s.attrs.intelecto > 1 || s.antecedents.violencia > 2)) {
    out.push("Sorte dos Covardes não funciona com mais de 1 em Intelecto ou 2 em Violência.");
  }
  if (s.skills.length > skillSlots(s)) out.push(`Habilidades além do limite (${s.skills.length}/${skillSlots(s)}).`);
  return out;
}

// ── Condições ─────────────────────────────────────────────────────

export interface Part { label: string; value: number }
const sum = (p: Part[]) => p.reduce((t, x) => t + x.value, 0);

/** Círculos de Vida: 6 + Físico, ganhos por nível, Parrudeza e Redenção. */
export function vidaParts(s: SacramentoState): Part[] {
  const fis = s.attrs.fisico;
  const parts: Part[] = [{ label: "Condição inicial", value: START.vida }];
  if (fis) parts.push({ label: "Físico", value: fis });
  levelsUpTo(s).forEach((l) => {
    if (l.vidaPorFisico) parts.push({ label: `Nível ${l.level} (Físico, mín. 1)`, value: Math.max(1, fis) });
    if (l.vidaFixa) parts.push({ label: `Nível ${l.level}`, value: l.vidaFixa });
  });
  const parr = skillCount(s, "parrudeza");
  if (parr) parts.push({ label: `Parrudeza${parr > 1 ? ` ×${parr}` : ""}`, value: 2 * parr });
  if (isRedeemed(s)) parts.push({ label: "Redenção", value: 2 });
  return parts;
}

export interface Conditions {
  vida: number;
  dor: number;
  movimentos: number;
  acoes: number;
  defesa: number;
  /** Defesa em combate com Fúria dos Aflitos. */
  defesaFuria: number | null;
  /** Cartas puxadas na Iniciativa. */
  iniciativa: string;
}

export function conditions(s: SacramentoState): Conditions {
  const cards = 1 + (isRedeemed(s) ? 1 : 0) + (s.skills.includes("coldre-de-sabao") ? 1 : 0);
  const notes: string[] = [];
  if (s.skills.includes("coldre-de-sabao")) notes.push("escolha a maior ou a menor");
  else if (cards > 1) notes.push("fique com a melhor");
  return {
    vida: sum(vidaParts(s)),
    dor: START.dor,
    movimentos: START.movimentos + s.attrs.velocidade,
    acoes: START.acoes + s.attrs.coragem,
    defesa: START.defesa,
    defesaFuria: s.skills.includes("furia-dos-aflitos") ? START.defesa - 1 : null,
    iniciativa: `${cards} carta${cards > 1 ? "s" : ""}${notes.length ? ` (${notes.join("; ")})` : ""}`,
  };
}

// ── Redenção ──────────────────────────────────────────────────────

export function selectTrail(d: SacramentoState, key: string): void {
  if (d.redemption.trail === key) return;
  d.redemption.trail = key;
  d.redemption.done = [false, false, false, false, false, false];
  if (key === CUSTOM_TRAIL) {
    d.redemption.premise = "";
    d.redemption.steps = ["", "", "", "", "", ""];
  } else {
    const t = trailIndex.get(key)!;
    d.redemption.premise = t.premise;
    d.redemption.steps = [...t.steps];
  }
}

export const stepsDone = (s: SacramentoState): number => s.redemption.done.filter(Boolean).length;

// ── Montaria ──────────────────────────────────────────────────────

export const MOUNT_POINTS = 3;
export const mountLeft = (s: SacramentoState): number => MOUNT_POINTS - s.mount.potencia - s.mount.resistencia;

/** Bônus de Fidelidade nos níveis 2 e 5 (+1 em Potência ou Resistência). */
export function mountAttr(s: SacramentoState, a: "potencia" | "resistencia"): number {
  const bonus = s.mount.fidelityBonus.filter((b, i) => b === a && s.mount.fidelidade >= (i === 0 ? 2 : 5)).length;
  return s.mount[a] + bonus;
}

export function mountStats(s: SacramentoState) {
  const pot = mountAttr(s, "potencia"), res = mountAttr(s, "resistencia");
  return {
    potencia: pot,
    resistencia: res,
    vida: 6 + res,
    dor: 6,
    teste: `1d6+${pot + s.antecedents.montaria} contra NA 6`,
  };
}

export const FIDELITY = [
  "Montaria estranha: sem bônus.",
  "Atende quando chamada pelo nome.",
  "Ganha +1 ponto em um dos dois Atributos à sua escolha.",
  "Quando chamada, vai até você se estiver dentro de 500m de raio.",
  "Sem penalidades para saltar obstáculos perigosos.",
  "Ganha +1 ponto em um dos dois Atributos à sua escolha.",
];

/** Rótulo de um Atributo. */
export const attrLabel = (a: Attr) => ATTRS.find((x) => x.key === a)!.label;
