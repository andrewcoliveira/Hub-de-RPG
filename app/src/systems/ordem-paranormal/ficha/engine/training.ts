// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Perícias treinadas e graus de treinamento
//  Origem (2) + classe + 1 por ponto de Intelecto; depois Treinamento em
//  Perícia e Grau de Treinamento (NEX 35% e 70%) sobem os graus.
// ══════════════════════════════════════════════════════════════════

import { GRADES } from "./data/elements";
import { CLASSES, GRAU_NEX } from "./data/classes";
import { originIndex } from "./data/origins";
import { SKILLS, skillIndex } from "./data/skills";
import { activePowers, attrFinal, grauSlotCount, hasParaAffinity, hasPower, hasTrailAbility, nexOf, paraCount } from "./core";
import type { OrdemState } from "./state";

// ── Perícias de origem e de classe ────────────────────────────────

/** Perícias treinadas pela origem (Amnésico: as escolhidas). */
export function originSkills(s: OrdemState): string[] {
  if (!s.origin) return [];
  const o = originIndex.get(s.origin)!;
  return o.skills.length ? o.skills : s.originSkills;
}

/** Perícias fixas da classe e as escolhidas nos grupos "uma das duas". */
export function classSkills(s: OrdemState): string[] {
  if (!s.classKey) return [];
  const cls = CLASSES[s.classKey];
  return [...cls.fixedSkills, ...s.classSkills.filter((x): x is string => !!x)];
}

/** Perícias de classe repetidas com a origem — cada uma vira uma escolha livre extra. */
export function overlapSkills(s: OrdemState): string[] {
  const o = originSkills(s);
  return classSkills(s).filter((x) => o.includes(x));
}

/** Quantas perícias livres: base da classe + Intelecto + repetições com a origem. */
export function freeSkillTotal(s: OrdemState): number {
  if (!s.classKey) return 0;
  return CLASSES[s.classKey].freeSkills + attrFinal(s, "int") + overlapSkills(s).length;
}

export const lockedSkills = (s: OrdemState): Set<string> => new Set([...originSkills(s), ...classSkills(s)]);

export const freeSkillsUsed = (s: OrdemState): string[] => {
  const locked = lockedSkills(s);
  return s.freeSkills.filter((x) => !locked.has(x));
};

export function toggleFreeSkill(d: OrdemState, name: string): "ok" | "full" | "locked" {
  if (lockedSkills(d).has(name)) return "locked";
  if (d.freeSkills.includes(name)) {
    d.freeSkills = d.freeSkills.filter((x) => x !== name);
    return "ok";
  }
  if (freeSkillsUsed(d).length >= freeSkillTotal(d)) return "full";
  d.freeSkills.push(name);
  return "ok";
}

export function setClassSkill(d: OrdemState, group: number, name: string): void {
  if (!d.classKey) return;
  const groups = CLASSES[d.classKey].skillGroups;
  if (!groups[group]?.includes(name)) return;
  while (d.classSkills.length < groups.length) d.classSkills.push(null);
  d.classSkills[group] = name;
  d.freeSkills = d.freeSkills.filter((x) => x !== name);
}

export function setOriginSkill(d: OrdemState, index: number, name: string | null): void {
  const next = [...d.originSkills];
  while (next.length < 2) next.push("");
  next[index] = name ?? "";
  d.originSkills = next.filter(Boolean);
  if (name) d.freeSkills = d.freeSkills.filter((x) => x !== name);
}

// ── Graus de treinamento (simulação em ordem de NEX) ──────────────

export interface TrainingIssue { source: string; skill: string; reason: string }

export interface TrainingResult {
  grade: Map<string, number>;
  issues: TrainingIssue[];
}

/** Calcula o grau de cada perícia seguindo a ordem dos ganhos (NEX 5% → 99%). */
export function simulateTraining(s: OrdemState): TrainingResult {
  const grade = new Map<string, number>(SKILLS.map((k) => [k.name, 0]));
  const issues: TrainingIssue[] = [];
  const base = new Set([...originSkills(s), ...classSkills(s), ...freeSkillsUsed(s).slice(0, freeSkillTotal(s))]);
  base.forEach((k) => grade.set(k, 1));

  type Ev = { nex: number; source: string; skills: string[]; kind: "power" | "grau" };
  const events: Ev[] = [];
  activePowers(s).forEach((ap) => {
    if (ap.def?.special === "treinamento") {
      events.push({ nex: ap.nex, kind: "power", source: `Treinamento em Perícia (NEX ${ap.nex}%)`, skills: ap.pick.skills });
    }
  });
  s.grau.slice(0, grauSlotCount(s)).forEach((list, i) => {
    events.push({ nex: GRAU_NEX[i], kind: "grau", source: `Grau de Treinamento (NEX ${GRAU_NEX[i]}%)`, skills: list.slice(0, grauCount(s)) });
  });
  events.sort((a, b) => a.nex - b.nex);

  for (const ev of events) {
    for (const k of ev.skills) {
      const g = grade.get(k) ?? 0;
      if (ev.kind === "power") {
        if (g === 0) grade.set(k, 1);
        else if (g === 1 && ev.nex >= 35) grade.set(k, 2);
        else if (g === 2 && ev.nex >= 70) grade.set(k, 3);
        else issues.push({ source: ev.source, skill: k, reason: g >= 3 ? "já é expert" : `só pode subir para ${GRADES[g + 1].label.toLowerCase()} a partir de NEX ${g === 1 ? 35 : 70}%` });
      } else {
        if (g === 0) issues.push({ source: ev.source, skill: k, reason: "precisa ser treinada" });
        else if (g === 1) grade.set(k, 2);
        else if (g === 2 && ev.nex >= 70) grade.set(k, 3);
        else issues.push({ source: ev.source, skill: k, reason: g >= 3 ? "já é expert" : "só pode chegar a expert em NEX 70%" });
      }
    }
  }
  return { grade, issues };
}

export const skillGrade = (s: OrdemState, name: string): number => simulateTraining(s).grade.get(name) ?? 0;
export const isTrained = (s: OrdemState, name: string): boolean => skillGrade(s, name) >= 1;

/** Grau de Treinamento: 2/5/3 (combatente/especialista/ocultista) + Intelecto. */
export const grauCount = (s: OrdemState): number => (s.classKey ? Math.max(0, CLASSES[s.classKey].grauBase + attrFinal(s, "int")) : 0);

export function toggleGrau(d: OrdemState, slot: 0 | 1, name: string): "ok" | "full" {
  const list = d.grau[slot];
  if (list.includes(name)) { d.grau[slot] = list.filter((x) => x !== name); return "ok"; }
  if (list.length >= grauCount(d)) return "full";
  d.grau[slot] = [...list, name];
  return "ok";
}

export function togglePerito(d: OrdemState, name: string): "ok" | "full" | "invalid" {
  if (name === "Luta" || name === "Pontaria") return "invalid";
  if (d.perito.includes(name)) { d.perito = d.perito.filter((x) => x !== name); return "ok"; }
  if (d.perito.length >= 2) return "full";
  d.perito = [...d.perito, name];
  return "ok";
}

// ── Bônus de perícia ──────────────────────────────────────────────

/** Bônus fixos de poderes e trilhas que valem sempre (não situacionais). */
export function skillMiscBonuses(s: OrdemState, name: string): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = [];
  const resist = name === "Fortitude" || name === "Reflexos" || name === "Vontade";
  if (resist && hasPower(s, "reflexos-defensivos")) out.push({ label: "Reflexos Defensivos", value: 2 });
  if (resist && paraCount(s, "precognicao")) out.push({ label: "Precognição", value: 2 });
  if (name === "Fortitude" && hasParaAffinity(s, "sangue-de-ferro")) out.push({ label: "Sangue de Ferro (afinidade)", value: 5 });
  if ((name === "Diplomacia" || name === "Intimidação" || name === "Intuição") && paraCount(s, "sensitivo")) out.push({ label: "Sensitivo", value: 5 });
  if (name === "Percepção" && paraCount(s, "visao-do-oculto")) out.push({ label: "Visão do Oculto", value: 5 });
  if (name === "Iniciativa" && hasTrailAbility(s, "operacoes-especiais", 10)) out.push({ label: "Iniciativa Aprimorada", value: 5 });
  if ((name === "Atletismo" || name === "Crime") && hasTrailAbility(s, "infiltrador", 40)) out.push({ label: "Gatuno", value: 5 });
  return out;
}

export interface SkillLine {
  name: string;
  attr: string;
  /** Dados rolados: atributo (0 = 2d20, fica com o pior). */
  dice: number;
  grade: number;
  bonus: number;
  usable: boolean;
}

export function skillLine(s: OrdemState, name: string, grade = skillGrade(s, name)): SkillLine {
  const def = skillIndex.get(name)!;
  const misc = skillMiscBonuses(s, name).reduce((t, b) => t + b.value, 0);
  return {
    name,
    attr: def.attr,
    dice: attrFinal(s, def.attr),
    grade,
    bonus: GRADES[grade].bonus + misc,
    usable: !def.trainedOnly || grade > 0,
  };
}

/** "2d20+5", "1d20", "2d20 (pior)+5". */
export function diceText(dice: number, bonus: number): string {
  const d = dice <= 0 ? "2d20 (pior)" : `${dice}d20`;
  return bonus ? `${d}${bonus > 0 ? "+" : ""}${bonus}` : d;
}

/** Grau máximo possível no NEX atual: veterano exige NEX 35% e expert, NEX 70%. */
export const maxGradeAt = (s: OrdemState): number => (nexOf(s) >= 70 ? 3 : nexOf(s) >= 35 ? 2 : 1);
