// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Estado da ficha
//  Formato salvo em localStorage["jade-ficha-v1"] e nos arquivos exportados
//  (compatível com as fichas criadas pela versão anterior do site).
// ══════════════════════════════════════════════════════════════════

import { ABILITIES, POINT_COST, isBasicAbilityKey, isRaceKey, RACES, type AbilityKey, type BasicAbilityKey, type RaceKey } from "./data/races";
import { isClassKey, type ClassKey } from "./data/classes";
import { SKILLS_DATA } from "./data/skills";

export interface Roll { dice: number[]; sum: number }
export interface SelectedSkill { name: string; specialty: string | null }
export interface SelectedTalent { name: string; category: string }

export interface JadeState {
  name: string;
  mode: "roll" | "points";
  /** Os 7 valores rolados (4d6, descarta o menor). */
  rolls: Roll[];
  /** Índice do valor rolado em cada habilidade. */
  assignments: Record<AbilityKey, number | null>;
  pointValues: Record<AbilityKey, number>;
  race: RaceKey | null;
  raceChoices: BasicAbilityKey[];
  classKey: ClassKey | null;
  level: number;
  /** Devoção escolhida pela habilidade de classe "Devoto". */
  devotion: string | null;
  /** Shugenja: soma Sabedoria ou Honra aos PM (discípulo/iniciado/adepto/mestre celestial). */
  pmChoice: "sab" | "hon";
  selectedSkills: SelectedSkill[];
  selectedTalents: SelectedTalent[];
  /** +1s em habilidades básicas comprados com as escolhas por nível. */
  abilityIncrements: Partial<Record<BasicAbilityKey, number>>;
}

export function blankState(): JadeState {
  const assignments = {} as Record<AbilityKey, number | null>;
  const pointValues = {} as Record<AbilityKey, number>;
  ABILITIES.forEach((a) => {
    assignments[a.key] = null;
    pointValues[a.key] = 10;
  });
  return {
    name: "",
    mode: "roll",
    rolls: [],
    assignments,
    pointValues,
    race: null,
    raceChoices: [],
    classKey: null,
    level: 1,
    devotion: null,
    pmChoice: "sab",
    selectedSkills: [],
    selectedTalents: [],
    abilityIncrements: {},
  };
}

type Raw = Record<string, unknown> | null | undefined;

/** Restaura um estado salvo/importado, descartando campos inválidos. */
export function sanitizeState(input: unknown): JadeState {
  const s = blankState();
  if (!input || typeof input !== "object") return s;
  const raw = input as Record<string, unknown>;

  if (typeof raw.name === "string") s.name = raw.name.slice(0, 60);
  if (raw.mode === "points" || raw.mode === "roll") s.mode = raw.mode;
  if (
    Array.isArray(raw.rolls) && raw.rolls.length === 7 &&
    raw.rolls.every((r) => r && Array.isArray(r.dice) && r.dice.length === 4 && Number.isInteger(r.sum))
  ) {
    s.rolls = (raw.rolls as Roll[]).map((r) => ({ dice: [...r.dice], sum: r.sum }));
  }

  const assignments = raw.assignments as Raw;
  const pointValues = raw.pointValues as Raw;
  const increments = raw.abilityIncrements as Raw;
  ABILITIES.forEach((a) => {
    const idx = assignments?.[a.key];
    if (Number.isInteger(idx) && (idx as number) >= 0 && (idx as number) < s.rolls.length) s.assignments[a.key] = idx as number;
    const pv = pointValues?.[a.key];
    if (typeof pv === "number" && POINT_COST[pv] !== undefined) s.pointValues[a.key] = pv;
    const inc = increments?.[a.key];
    if (isBasicAbilityKey(a.key) && Number.isInteger(inc) && (inc as number) > 0) s.abilityIncrements[a.key] = inc as number;
  });
  // um mesmo dado não pode estar em duas habilidades
  const seen = new Set<number>();
  ABILITIES.forEach((a) => {
    const idx = s.assignments[a.key];
    if (idx === null) return;
    if (seen.has(idx)) s.assignments[a.key] = null;
    else seen.add(idx);
  });

  if (isRaceKey(raw.race)) {
    s.race = raw.race;
    const max = RACES[raw.race].choiceBonus?.count ?? 0;
    if (Array.isArray(raw.raceChoices)) {
      s.raceChoices = [...new Set(raw.raceChoices.filter(isBasicAbilityKey))].slice(0, max);
    }
  }
  if (isClassKey(raw.classKey)) s.classKey = raw.classKey;
  if (Number.isInteger(raw.level) && (raw.level as number) >= 1 && (raw.level as number) <= 20) s.level = raw.level as number;
  if (raw.pmChoice === "hon" || raw.pmChoice === "sab") s.pmChoice = raw.pmChoice;
  if (typeof raw.devotion === "string" && /^Devoto d[aeo] /.test(raw.devotion)) s.devotion = raw.devotion.slice(0, 60);
  if (Array.isArray(raw.selectedSkills)) {
    s.selectedSkills = raw.selectedSkills
      .filter((x) => x && typeof x.name === "string" && SKILLS_DATA[x.name])
      .map((x) => ({ name: x.name, specialty: typeof x.specialty === "string" ? x.specialty : null }));
  }
  if (Array.isArray(raw.selectedTalents)) {
    s.selectedTalents = raw.selectedTalents
      .filter((x) => x && typeof x.name === "string" && typeof x.category === "string")
      .map((x) => ({ name: x.name, category: x.category }));
  }
  return s;
}
