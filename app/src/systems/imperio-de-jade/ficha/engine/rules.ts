// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Regras da ficha: habilidades, raça, classe, perícias
//  Funções de consulta recebem o estado e não o alteram. Funções marcadas
//  como "altera o rascunho" mudam o objeto recebido — a store sempre passa
//  uma cópia (ver store.ts), então o estado anterior nunca é tocado.
// ══════════════════════════════════════════════════════════════════

import {
  ABILITIES, BASIC_ABILITIES, POINT_BUDGET, POINT_COST, POINT_LEVELS, RACES,
  abilityMod, isBasicAbilityKey, type AbilityKey, type RaceKey,
} from "./data/races";
import { CLASSES, type ClassKey } from "./data/classes";
import { CLASS_SKILLS, SKILLS_DATA, type AttrAbbr } from "./data/skills";
import type { JadeState, Roll } from "./state";

export type Rng = () => number;

// ── Rolagem (4d6, descarta o menor, sete vezes) ───────────────────

export function roll4d6dropLowest(rng: Rng = Math.random): Roll {
  const dice = Array.from({ length: 4 }, () => Math.floor(rng() * 6) + 1);
  const sorted = [...dice].sort((a, b) => a - b);
  return { dice, sum: sorted[1] + sorted[2] + sorted[3] };
}

/** Altera o rascunho: rola os sete valores e limpa as atribuições. */
export function generateRolls(s: JadeState, rng: Rng = Math.random): void {
  s.rolls = Array.from({ length: 7 }, () => roll4d6dropLowest(rng));
  ABILITIES.forEach((a) => { s.assignments[a.key] = null; });
}

/** Índice do dado descartado (o primeiro menor valor). */
export const droppedDieIndex = (dice: number[]) => dice.indexOf(Math.min(...dice));

/** Pode rolar de novo se a soma dos modificadores for menor que +4 ou não houver valor 14+. */
export function rollQuality(s: JadeState) {
  if (s.rolls.length !== 7) return null;
  const modSum = s.rolls.reduce((t, r) => t + abilityMod(r.sum), 0);
  const hasHigh = s.rolls.some((r) => r.sum >= 14);
  return { modSum, hasHigh, ok: modSum >= 4 && hasHigh };
}

/** Altera o rascunho: põe o valor `idx` na habilidade, trocando com quem já o tinha. */
export function assignRoll(s: JadeState, idx: number, key: AbilityKey): void {
  const prevOwner = (Object.keys(s.assignments) as AbilityKey[]).find((k) => s.assignments[k] === idx);
  if (prevOwner === key) return;
  if (prevOwner) s.assignments[prevOwner] = null;
  const displaced = s.assignments[key];
  if (displaced !== null && prevOwner) s.assignments[prevOwner] = displaced;
  s.assignments[key] = idx;
}

export const assignedCount = (s: JadeState) => ABILITIES.filter((a) => s.assignments[a.key] !== null).length;

/** Altera o rascunho: zera só a base das habilidades (ao trocar de método). */
export function resetAbilityBase(s: JadeState): void {
  s.rolls = [];
  ABILITIES.forEach((a) => {
    s.assignments[a.key] = null;
    s.pointValues[a.key] = 10;
  });
}

// ── Compra de pontos (24 pontos) ──────────────────────────────────

export const pointsSpent = (s: JadeState) => ABILITIES.reduce((t, a) => t + (POINT_COST[s.pointValues[a.key]] ?? 0), 0);
export const pointsLeft = (s: JadeState) => POINT_BUDGET - pointsSpent(s);

export function canIncreasePoint(s: JadeState, key: AbilityKey): boolean {
  const cur = s.pointValues[key];
  const next = POINT_LEVELS[POINT_LEVELS.indexOf(cur) + 1];
  if (next === undefined) return false;
  return pointsLeft(s) >= POINT_COST[next] - POINT_COST[cur];
}

/** Altera o rascunho. Retorna true se mudou. */
export function changePointValue(s: JadeState, key: AbilityKey, delta: number): boolean {
  const cur = s.pointValues[key];
  const newIdx = POINT_LEVELS.indexOf(cur) + delta;
  if (newIdx < 0 || newIdx >= POINT_LEVELS.length) return false;
  const next = POINT_LEVELS[newIdx];
  const diff = (POINT_COST[next] ?? 0) - (POINT_COST[cur] ?? 0);
  if (diff > 0 && pointsLeft(s) < diff) return false;
  s.pointValues[key] = next;
  return true;
}

// ── Valores das habilidades ───────────────────────────────────────

export function raceBonusFor(s: JadeState, key: AbilityKey): number {
  if (!s.race) return 0;
  const race = RACES[s.race];
  let bonus = race.bonuses[key] ?? 0;
  if (race.choiceBonus && isBasicAbilityKey(key)) bonus += s.raceChoices.filter((k) => k === key).length * race.choiceBonus.amount;
  return bonus;
}

export function baseValueFor(s: JadeState, key: AbilityKey): number | null {
  if (s.mode === "roll") {
    const idx = s.assignments[key];
    return idx !== null && s.rolls[idx] ? s.rolls[idx].sum : null;
  }
  return s.pointValues[key];
}

/** Honra inicial ajustada pela classe (Capítulo 1, "Ajustes de Honra"). */
export const CLASS_HONOR: Record<ClassKey, number> = { samurai: 2, shugenja: 2, monge: 1, bushi: 0, kensei: 0, shinkan: 0, wujen: -1, onimusha: -2, yakuza: -2, ninja: -4 };

/** Ajuste de Honra da classe: modificador + 1 por nível avançado na classe do 1º nível. */
export function classHonorFor(s: JadeState, key: AbilityKey): number {
  if (key !== "hon" || !s.classKey) return 0;
  return CLASS_HONOR[s.classKey] + (s.level - 1);
}

export function finalValueFor(s: JadeState, key: AbilityKey): number | null {
  const base = baseValueFor(s, key);
  if (base === null) return null;
  if (key === "hon") return Math.max(0, base + raceBonusFor(s, "hon") + classHonorFor(s, "hon"));
  return base + raceBonusFor(s, key) + (s.abilityIncrements[key] ?? 0);
}

/** Modificador da habilidade (10 se ainda não definida). */
export const modOf = (s: JadeState, key: AbilityKey) => abilityMod(finalValueFor(s, key) ?? 10);

/** Faixa de Honra (Capítulo 1). */
export function honorTier(v: number | null): string | null {
  if (v === null) return null;
  if (v >= 22) return "Digníssimo";
  if (v >= 16) return "Honrado";
  if (v >= 10) return "Honesto";
  if (v >= 6) return "Desonrado";
  if (v >= 1) return "Sórdido";
  return "Desumano";
}

// ── Raça ──────────────────────────────────────────────────────────

/** Altera o rascunho. */
export function selectRace(s: JadeState, key: RaceKey): void {
  if (s.race !== key) s.raceChoices = [];
  s.race = key;
}

/** Altera o rascunho. Retorna true se mudou. */
export function toggleRaceChoice(s: JadeState, key: AbilityKey): boolean {
  const race = s.race ? RACES[s.race] : null;
  if (!race?.choiceBonus || !isBasicAbilityKey(key)) return false;
  const idx = s.raceChoices.indexOf(key);
  if (idx >= 0) { s.raceChoices.splice(idx, 1); return true; }
  if (s.raceChoices.length >= race.choiceBonus.count) return false;
  s.raceChoices.push(key);
  return true;
}

export function raceChoicesComplete(s: JadeState): boolean {
  if (!s.race) return false;
  const race = RACES[s.race];
  return !race.choiceBonus || s.raceChoices.length === race.choiceBonus.count;
}

// ── Classe e nível ────────────────────────────────────────────────

/** Altera o rascunho: trocar de classe limpa perícias e devoção. */
export function selectClass(s: JadeState, key: ClassKey): void {
  if (s.classKey !== key) {
    s.selectedSkills = [];
    s.devotion = null;
  }
  s.classKey = key;
}

/** Altera o rascunho. */
export function setLevel(s: JadeState, lvl: number | string): void {
  s.level = Math.min(20, Math.max(1, parseInt(String(lvl), 10) || 1));
}

export interface ClassAbility { name: string; desc: string; level: number }

/** Habilidades de classe já obtidas no nível atual / ainda bloqueadas. */
export function classAbilities(s: JadeState): { gained: ClassAbility[]; locked: ClassAbility[] } {
  if (!s.classKey) return { gained: [], locked: [] };
  const cls = CLASSES[s.classKey];
  const gained: ClassAbility[] = [], locked: ClassAbility[] = [];
  Object.entries(cls.habilidades).forEach(([name, desc]) => {
    const level = cls.nivel_inicial[name];
    if (level === undefined) return;
    (level <= s.level ? gained : locked).push({ name, desc, level });
  });
  gained.sort((a, b) => a.level - b.level);
  locked.sort((a, b) => a.level - b.level);
  return { gained, locked };
}

// ── Validação geral ───────────────────────────────────────────────

export function allAbilitiesSet(s: JadeState): boolean {
  return s.mode === "roll" ? assignedCount(s) === ABILITIES.length : pointsLeft(s) >= 0;
}

export const sheetReady = (s: JadeState) => allAbilitiesSet(s) && !!s.race && raceChoicesComplete(s) && !!s.classKey;

// ── Perícias ──────────────────────────────────────────────────────

const ATTR_TO_KEY: Record<AttrAbbr, AbilityKey> = { For: "for", Des: "des", Con: "con", Int: "int", Sab: "sab", Car: "car", Hon: "hon" };

/** Traços raciais que mudam perícias. */
export const RACE_SKILL_BONUS: Partial<Record<RaceKey, Record<string, number>>> = {
  hanyo: { "Identificar Magia": 4 },                              // arcano
  henge: { "Percepção": 4 },                                      // faro
  nezumi: { "Furtividade": 4, "Intimidação": 4, "Percepção": 4 }, // tamanho pequeno, amedrontador, faro
  ryuujin: { "Diplomacia": 4 },                                   // digno
};
export const RACE_SKILL_ATTR: Partial<Record<RaceKey, Record<string, AttrAbbr>>> = {
  henge: { "Atletismo": "Des" },     // agilidade animal
  kaijin: { "Intimidação": "For" },  // ameaçador
};

export const skillAttr = (s: JadeState, name: string): AttrAbbr =>
  (s.race && RACE_SKILL_ATTR[s.race]?.[name]) || SKILLS_DATA[name].attr;

export const raceSkillBonus = (s: JadeState, name: string) => (s.race && RACE_SKILL_BONUS[s.race]?.[name]) || 0;

/** Pode usar sem treino? (vanara: "Culto" permite Conhecimento sem treinamento) */
export function canUseUntrained(s: JadeState, name: string): boolean {
  const skill = SKILLS_DATA[name];
  if (!skill) return false;
  return !skill.trained || (s.race === "vanara" && name === "Conhecimento");
}

/** Nº de perícias treinadas: base da classe + mod. Int (mín. 1), +2 se humano. */
export function skillSlotCount(s: JadeState): number {
  if (!s.classKey) return 0;
  const base = parseInt(CLASSES[s.classKey].pericias_treinadas.match(/^(\d+)/)?.[1] ?? "2", 10);
  return Math.max(1, base + modOf(s, "int")) + (s.race === "humano" ? 2 : 0);
}

export const isSkillSelected = (s: JadeState, name: string) => s.selectedSkills.some((x) => x.name === name);

/** Treinada = 3 + nível + mod; sem treino = ½ nível + mod (+ traços raciais). */
export function skillBonus(s: JadeState, name: string, trained: boolean): number | null {
  if (!SKILLS_DATA[name]) return null;
  const attr = finalValueFor(s, ATTR_TO_KEY[skillAttr(s, name)]);
  if (attr === null) return null;
  const base = trained ? 3 + s.level : Math.floor(s.level / 2);
  return base + abilityMod(attr) + raceSkillBonus(s, name);
}

/** Altera o rascunho. */
export function toggleSkill(s: JadeState, name: string): "added" | "removed" | "full" {
  const idx = s.selectedSkills.findIndex((x) => x.name === name);
  if (idx >= 0) { s.selectedSkills.splice(idx, 1); return "removed"; }
  if (s.selectedSkills.length >= skillSlotCount(s)) return "full";
  s.selectedSkills.push({ name, specialty: SKILLS_DATA[name]?.specialties?.[0] ?? null });
  return "added";
}

/** Altera o rascunho. */
export function setSkillSpecialty(s: JadeState, name: string, value: string): void {
  const entry = s.selectedSkills.find((x) => x.name === name);
  if (entry) entry.specialty = value;
}

export const isClassSkill = (s: JadeState, name: string) => !!s.classKey && CLASS_SKILLS[s.classKey].includes(name);

export function skillWarnings(s: JadeState, name: string): { type: "armor" | "honor" | "outclass"; label: string }[] {
  if (!s.classKey) return [];
  const skill = SKILLS_DATA[name];
  const out: { type: "armor" | "honor" | "outclass"; label: string }[] = [];
  if (skill?.armor) out.push({ type: "armor", label: "Penalidade de armadura" });
  if (skill?.honor) out.push({ type: "honor", label: `Violação de honra ${skill.honor}` });
  if (!isClassSkill(s, name)) out.push({ type: "outclass", label: "Fora da classe (violação de honra leve)" });
  return out;
}

export { BASIC_ABILITIES };
