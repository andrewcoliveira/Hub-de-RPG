// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Características derivadas (Toques Finais)
//  PV, PE, SAN, Defesa, deslocamento, carga, proficiências e resistências.
// ══════════════════════════════════════════════════════════════════

import { elementLabel, type AffinityElement } from "./data/elements";
import { CLASSES } from "./data/classes";
import {
  activeParas, attrFinal, hasParaAffinity, hasPower, hasTrailAbility, nexOf, nexSteps, paraCount, peLimit, transcendCount,
} from "./core";
import type { OrdemState } from "./state";

export interface Part { label: string; value: number }
const sum = (parts: Part[]) => parts.reduce((t, p) => t + p.value, 0);

/** PV: inicial + Vigor, e a cada NEX seguinte o valor da classe + Vigor (retroativo). */
export function pvParts(s: OrdemState): Part[] {
  if (!s.classKey) return [];
  const cls = CLASSES[s.classKey], vig = attrFinal(s, "vig"), n = s.nexIndex;
  const parts: Part[] = [{ label: `${cls.label}: ${cls.pv[0]} + Vig`, value: cls.pv[0] + vig }];
  if (n) parts.push({ label: `${n} × (${cls.pv[1]} + Vig) por NEX`, value: n * (cls.pv[1] + vig) });
  if (s.origin === "desgarrado") parts.push({ label: "Calejado (+1 por 5% de NEX)", value: nexSteps(s) });
  if (hasTrailAbility(s, "tropa-de-choque", 10)) parts.push({ label: "Casca Grossa (+1 por 5% de NEX)", value: nexSteps(s) });
  if (paraCount(s, "sangue-de-ferro")) parts.push({ label: "Sangue de Ferro (+2 por NEX)", value: 2 * nexSteps(s) });
  return parts;
}

export function peParts(s: OrdemState): Part[] {
  if (!s.classKey) return [];
  const cls = CLASSES[s.classKey], pre = attrFinal(s, "pre"), n = s.nexIndex;
  const parts: Part[] = [{ label: `${cls.label}: ${cls.pe[0]} + Pre`, value: cls.pe[0] + pre }];
  if (n) parts.push({ label: `${n} × (${cls.pe[1]} + Pre) por NEX`, value: n * (cls.pe[1] + pre) });
  if (s.origin === "universitario") {
    const odd = [15, 25, 35, 45, 55, 65, 75, 85, 95].filter((x) => x <= nexOf(s)).length;
    parts.push({ label: "Dedicação (+1, +1 por NEX ímpar)", value: 1 + odd });
  }
  if (paraCount(s, "potencial-aprimorado")) {
    const aff = hasParaAffinity(s, "potencial-aprimorado");
    parts.push({ label: `Potencial Aprimorado (+${aff ? 2 : 1} por NEX)`, value: (aff ? 2 : 1) * nexSteps(s) });
  }
  return parts;
}

export function sanParts(s: OrdemState): Part[] {
  if (!s.classKey) return [];
  const cls = CLASSES[s.classKey], n = s.nexIndex;
  const cultist = s.origin === "cultista-arrependido";
  const parts: Part[] = [{ label: cultist ? `${cls.label}: ${cls.san[0]} ÷ 2 (Traços do Outro Lado)` : `${cls.label}: inicial`, value: cultist ? Math.floor(cls.san[0] / 2) : cls.san[0] }];
  if (n) parts.push({ label: `${n} × ${cls.san[1]} por NEX`, value: n * cls.san[1] });
  const t = transcendCount(s);
  if (t) parts.push({ label: `Transcender ×${t} (sem SAN nesses NEX)`, value: -t * cls.san[1] });
  if (s.origin === "vitima") parts.push({ label: "Cicatrizes Psicológicas (+1 por 5% de NEX)", value: nexSteps(s) });
  return parts;
}

export const currentPV = (s: OrdemState): number | null => (s.classKey ? Math.max(1, sum(pvParts(s))) : null);
export const currentPE = (s: OrdemState): number | null => (s.classKey ? Math.max(0, sum(peParts(s))) : null);
export const currentSAN = (s: OrdemState): number | null => (s.classKey ? Math.max(0, sum(sanParts(s))) : null);

export function defenseParts(s: OrdemState): Part[] {
  const parts: Part[] = [{ label: "Base", value: 10 }, { label: "Agilidade", value: attrFinal(s, "agi") }];
  if (s.origin === "policial") parts.push({ label: "Patrulha", value: 2 });
  if (hasPower(s, "reflexos-defensivos")) parts.push({ label: "Reflexos Defensivos", value: 2 });
  if (paraCount(s, "precognicao")) parts.push({ label: "Precognição", value: 2 });
  return parts;
}
export const currentDefense = (s: OrdemState): number => sum(defenseParts(s));

/** Capacidade de carga: 5 espaços por Força (2 com Força 0). Técnico soma o Intelecto. */
export function carryCapacity(s: OrdemState): number {
  const base = attrFinal(s, "for") + (hasTrailAbility(s, "tecnico", 10) ? attrFinal(s, "int") : 0);
  return base <= 0 ? 2 : base * 5;
}

export function proficiencies(s: OrdemState): string[] {
  if (!s.classKey) return [];
  const out = [...CLASSES[s.classKey].proficiencies];
  if (hasPower(s, "armamento-pesado")) out.push("Armas pesadas");
  if (hasPower(s, "protecao-pesada")) out.push("Proteções pesadas");
  if (hasPower(s, "balistica-avancada")) out.push("Armas táticas de fogo");
  if (hasPower(s, "ninja-urbano")) out.push("Armas táticas corpo a corpo e de disparo (exceto de fogo)");
  if (hasTrailAbility(s, "atirador-de-elite", 10)) out.push("Armas de fogo de balas longas");
  return [...new Set(out)];
}

/** Resistências e imunidades permanentes vindas de origem, trilha e poderes. */
export function resistances(s: OrdemState): string[] {
  const out: string[] = [];
  if (s.origin === "teorico-da-conspiracao") out.push(`Dano mental ${attrFinal(s, "int")} (Eu Já Sabia)`);
  if (hasTrailAbility(s, "intuitivo", 10)) out.push("Resistência paranormal +5 (Mente Sã)");
  if (hasTrailAbility(s, "intuitivo", 65)) out.push("Dano mental e paranormal 10 (Inabalável)");
  const resist = new Map<AffinityElement, number>();
  activeParas(s).forEach((p) => {
    if (p.pick.id === "resistir-a-elemento" && p.pick.element) resist.set(p.pick.element, (resist.get(p.pick.element) ?? 0) + 1);
  });
  resist.forEach((times, el) => out.push(`${elementLabel(el)} ${times >= 2 && hasParaAffinity(s, "resistir-a-elemento", el) ? 20 : 10} (Resistir a ${elementLabel(el)})`));
  if (hasParaAffinity(s, "sangue-de-ferro")) out.push("Imune a venenos e doenças (Sangue de Ferro)");
  if (hasParaAffinity(s, "precognicao")) out.push("Imune a desprevenido (Precognição)");
  return out;
}

export interface Vitals { pv: number; pe: number; san: number; defense: number; peLimit: number; nex: number }

export function vitals(s: OrdemState): Vitals | null {
  if (!s.classKey) return null;
  return { pv: currentPV(s)!, pe: currentPE(s)!, san: currentSAN(s)!, defense: currentDefense(s), peLimit: peLimit(s), nex: nexOf(s) };
}
