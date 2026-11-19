// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Escolhas de origem, classe, NEX e trilha
//  Cada mutação recebe um rascunho (cópia) do estado.
// ══════════════════════════════════════════════════════════════════

import { NEX_LEVELS } from "./data/elements";
import { CLASSES, trailIndex, type ClassKey } from "./data/classes";
import { originIndex } from "./data/origins";
import { attrIncreaseSlots, grauSlotCount, hasVersatility, nexOf, powerSlotCount } from "./core";
import { freeSkillTotal, freeSkillsUsed } from "./training";
import { blankState, type OrdemState } from "./state";

export function selectOrigin(d: OrdemState, key: string): void {
  const o = originIndex.get(key);
  if (!o || d.origin === key) return;
  const prevProfession = d.origin ? originIndex.get(d.origin)?.profession : undefined;
  d.origin = key;
  d.originSkills = [];
  d.originPara = null;
  if (o.profession && (!d.profession || d.profession === prevProfession)) d.profession = o.profession;
  else if (!o.profession && d.profession === prevProfession) d.profession = "";
  // uma perícia livre que agora vem da origem libera a vaga
  d.freeSkills = d.freeSkills.filter((x) => !o.skills.includes(x));
}

export function selectClass(d: OrdemState, key: ClassKey): void {
  if (d.classKey === key) return;
  const cls = CLASSES[key];
  d.classKey = key;
  d.trail = null;
  d.classSkills = cls.skillGroups.map(() => null);
  d.freeSkills = d.freeSkills.filter((x) => !cls.fixedSkills.includes(x));
  d.perito = [];
  d.powers = [];
  d.versatility = null;
  d.grau = [[], []];
  d.rituals = [];
  // a nova classe pode ter menos perícias à escolha
  d.freeSkills = freeSkillsUsed(d).slice(0, freeSkillTotal(d));
}

export function selectTrail(d: OrdemState, key: string): void {
  const t = trailIndex.get(key);
  if (!t || !d.classKey || t.cls !== d.classKey) return;
  d.trail = key;
  if (d.versatility?.kind === "trail" && d.versatility.trail === key) d.versatility.trail = null;
}

/** Muda o NEX e descarta escolhas de níveis que deixaram de existir. */
export function setNex(d: OrdemState, index: number): void {
  d.nexIndex = Math.max(0, Math.min(NEX_LEVELS.length - 1, index));
  d.powers = d.powers.slice(0, powerSlotCount(d));
  d.attrIncreases = d.attrIncreases.slice(0, attrIncreaseSlots(d));
  const g = grauSlotCount(d);
  d.grau = [g >= 1 ? d.grau[0] : [], g >= 2 ? d.grau[1] : []];
  if (!hasVersatility(d)) d.versatility = null;
  if (nexOf(d) < 50) d.affinity = null;
  if (nexOf(d) < 10) d.trail = null;
}

export const resetState = (): OrdemState => blankState();
