// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Núcleo: NEX, atributos, trilha e os poderes
//  efetivamente recebidos (sem validação — ver powers.ts).
// ══════════════════════════════════════════════════════════════════

import { ATTRS, nexValue, type Attr } from "./data/elements";
import {
  ATTR_INCREASE_NEX, CLASSES, GRAU_NEX, POWER_NEX, findPower, trailIndex, type ClassKey, type PowerDef, type TrailDef,
} from "./data/classes";
import { paranormalIndex } from "./data/paranormal";
import { ritualIndex } from "./data/rituals";
import type { OrdemState, ParaPick, PowerPick } from "./state";

// ── NEX ───────────────────────────────────────────────────────────

export const nexOf = (s: OrdemState): number => nexValue(s.nexIndex);
/** Quantos "níveis de exposição" o personagem tem (5% = 1; usado em "+1 por 5% de NEX"). */
export const nexSteps = (s: OrdemState): number => s.nexIndex + 1;
/** Limite de PE por turno (Tabela 1.2); Universitário soma +1. */
export const peLimit = (s: OrdemState): number => nexSteps(s) + (s.origin === "universitario" ? 1 : 0);
/** DT das habilidades: 10 + limite de PE (sem bônus que "não afetam a DT") + atributo. */
export const dtFor = (s: OrdemState, attr: Attr): number => 10 + nexSteps(s) + attrFinal(s, attr);

// ── Atributos ─────────────────────────────────────────────────────

export const ATTR_POINTS = 4;
export const ATTR_MAX_START = 3;
export const ATTR_MAX = 5;

export const pointsSpent = (s: OrdemState): number => ATTRS.reduce((t, a) => t + s.attrs[a.key] - 1, 0);
/** Pontos restantes (reduzir um atributo a 0 dá +1 ponto). */
export const pointsLeft = (s: OrdemState): number => ATTR_POINTS - pointsSpent(s);
export const zeroAttr = (s: OrdemState): Attr | null => ATTRS.find((a) => s.attrs[a.key] === 0)?.key ?? null;

export function canChangeAttr(s: OrdemState, a: Attr, delta: 1 | -1): boolean {
  const v = s.attrs[a] + delta;
  if (v < 0 || v > ATTR_MAX_START) return false;
  if (delta > 0 && pointsLeft(s) <= 0) return false;
  if (v === 0) { const z = zeroAttr(s); if (z && z !== a) return false; }
  return true;
}

export function changeAttr(d: OrdemState, a: Attr, delta: 1 | -1): boolean {
  if (!canChangeAttr(d, a, delta)) return false;
  d.attrs[a] += delta;
  return true;
}

/** Quantos aumentos de atributo o NEX atual concede (NEX 20%, 50%, 80%, 95%). */
export const attrIncreaseSlots = (s: OrdemState): number =>
  s.classKey ? ATTR_INCREASE_NEX.filter((n) => n <= nexOf(s)).length : 0;

export function attrIncreaseCount(s: OrdemState, a: Attr): number {
  return s.attrIncreases.slice(0, attrIncreaseSlots(s)).filter((x) => x === a).length;
}

export const attrFinal = (s: OrdemState, a: Attr): number => s.attrs[a] + attrIncreaseCount(s, a);

export function canIncreaseAttr(s: OrdemState, slot: number, a: Attr): boolean {
  if (slot >= attrIncreaseSlots(s)) return false;
  const current = s.attrIncreases[slot] === a ? attrFinal(s, a) - 1 : attrFinal(s, a);
  return current + 1 <= ATTR_MAX;
}

export function setAttrIncrease(d: OrdemState, slot: number, a: Attr | null): boolean {
  if (a && !canIncreaseAttr(d, slot, a)) return false;
  while (d.attrIncreases.length <= slot) d.attrIncreases.push(null);
  d.attrIncreases[slot] = a;
  return true;
}

// ── Trilhas ───────────────────────────────────────────────────────

export function currentTrail(s: OrdemState): TrailDef | null {
  if (!s.classKey || !s.trail || nexOf(s) < 10) return null;
  const t = trailIndex.get(s.trail);
  return t && t.cls === s.classKey ? t : null;
}

/** Trilha cujo primeiro poder foi recebido por Versatilidade (NEX 50%). */
export function versatilityTrail(s: OrdemState): TrailDef | null {
  if (!s.classKey || nexOf(s) < 50 || s.versatility?.kind !== "trail" || !s.versatility.trail) return null;
  const t = trailIndex.get(s.versatility.trail);
  return t && t.cls === s.classKey && t.key !== s.trail ? t : null;
}

/** O personagem tem a habilidade da trilha `key` do NEX indicado? */
export function hasTrailAbility(s: OrdemState, key: string, nex: number): boolean {
  if (currentTrail(s)?.key === key && nex <= nexOf(s)) return true;
  return nex === 10 && versatilityTrail(s)?.key === key;
}

// ── Poderes de classe e paranormais recebidos ─────────────────────

export const powerSlotCount = (s: OrdemState): number =>
  s.classKey ? POWER_NEX.filter((n) => n <= nexOf(s)).length : 0;

export const grauSlotCount = (s: OrdemState): number =>
  s.classKey ? GRAU_NEX.filter((n) => n <= nexOf(s)).length : 0;

export const hasVersatility = (s: OrdemState): boolean => !!s.classKey && nexOf(s) >= 50;

export interface ActivePower {
  pick: PowerPick;
  def: PowerDef | undefined;
  /** NEX em que o poder foi recebido. */
  nex: number;
  source: "slot" | "versatility";
  slot: number;
}

/** Poderes de classe escolhidos nos espaços já alcançados (inclui Versatilidade). */
export function activePowers(s: OrdemState): ActivePower[] {
  if (!s.classKey) return [];
  const out: ActivePower[] = [];
  s.powers.slice(0, powerSlotCount(s)).forEach((p, i) => {
    if (p) out.push({ pick: p, def: findPower(p.id, s.classKey), nex: POWER_NEX[i], source: "slot", slot: i });
  });
  if (hasVersatility(s) && s.versatility?.kind === "power" && s.versatility.pick) {
    const p = s.versatility.pick;
    out.push({ pick: p, def: findPower(p.id, s.classKey), nex: 50, source: "versatility", slot: -1 });
  }
  return out;
}

export interface ActivePara {
  pick: ParaPick;
  nex: number;
  source: "origin" | "transcender";
  /** Índice do espaço de poder (-1 = Versatilidade, -2 = origem). */
  slot: number;
}

/** Poderes paranormais recebidos: Traços do Outro Lado e cada Transcender. */
export function activeParas(s: OrdemState): ActivePara[] {
  const out: ActivePara[] = [];
  if (s.origin === "cultista-arrependido" && s.originPara) out.push({ pick: s.originPara, nex: 5, source: "origin", slot: -2 });
  activePowers(s).forEach((ap) => {
    if (ap.def?.special === "transcender" && ap.pick.para) out.push({ pick: ap.pick.para, nex: ap.nex, source: "transcender", slot: ap.slot });
  });
  return out;
}

/** Poderes de outra classe recebidos por Expansão de Conhecimento ("classe:id"). */
export function expansionPowers(s: OrdemState): { cls: ClassKey; def: PowerDef }[] {
  return activeParas(s)
    .filter((p) => p.pick.id === "expansao-de-conhecimento" && p.pick.choice)
    .map((p) => {
      const [cls, id] = p.pick.choice!.split(":") as [ClassKey, string];
      const def = CLASSES[cls]?.powers.find((x) => x.id === id);
      return def ? { cls, def } : null;
    })
    .filter((x): x is { cls: ClassKey; def: PowerDef } => !!x);
}

/** Possui o poder de classe `id` (escolhido ou por Expansão de Conhecimento)? */
export function hasPower(s: OrdemState, id: string): boolean {
  return activePowers(s).some((p) => p.pick.id === id) || expansionPowers(s).some((p) => p.def.id === id);
}

export function paraCount(s: OrdemState, id: string): number {
  return activeParas(s).filter((p) => p.pick.id === id).length;
}

/** Elemento de um poder paranormal escolhido (o do ritual para Aprender Ritual). */
export function paraElement(p: ParaPick): string | null {
  const def = paranormalIndex.get(p.id);
  if (!def) return null;
  if (def.element) return def.element;
  if (p.id === "resistir-a-elemento") return p.element;
  if (p.id === "aprender-ritual" && p.choice) {
    const r = ritualIndex.get(p.choice);
    if (!r) return null;
    return r.elements.length > 1 ? p.element : r.elements[0];
  }
  return null;
}

/**
 * Afinidade: conectado a um elemento em NEX 50% e transcendido depois disso
 * (Capítulo 5, Afinidade Elemental).
 */
export function affinityActive(s: OrdemState): boolean {
  return !!s.affinity && nexOf(s) >= 50 && activeParas(s).some((p) => p.source === "transcender" && p.nex >= 50);
}

/** Possui a versão "Afinidade" do poder paranormal (escolhido duas vezes com afinidade no elemento)? */
export function hasParaAffinity(s: OrdemState, id: string, element?: string): boolean {
  if (!affinityActive(s)) return false;
  const picks = activeParas(s).filter((p) => p.pick.id === id && (element === undefined || paraElement(p.pick) === element));
  return picks.length >= 2 && picks.every((p) => paraElement(p.pick) === s.affinity);
}

/** Número de poderes paranormais recebidos ao Transcender (cada um custa a SAN daquele NEX). */
export const transcendCount = (s: OrdemState): number => activeParas(s).filter((p) => p.source === "transcender").length;
