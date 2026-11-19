// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Estado da ficha
//  Formato salvo em localStorage["ordem-ficha-v1"] e nos arquivos exportados.
// ══════════════════════════════════════════════════════════════════

import { ATTRS, NEX_LEVELS, isAffinityElement, isAttr, type AffinityElement, type Attr } from "./data/elements";
import { isOriginKey } from "./data/origins";
import { CLASSES, isClassKey, isTrailKey, trailIndex, type ClassKey } from "./data/classes";
import { isParanormalId } from "./data/paranormal";
import { isSkill } from "./data/skills";
import { ritualIndex } from "./data/rituals";

/** Poder paranormal escolhido. `choice`: ritual (Aprender Ritual) ou "classe:poder" (Expansão de Conhecimento). */
export interface ParaPick {
  id: string;
  choice: string | null;
  /** Elemento escolhido (Resistir a Elemento; Amaldiçoar Arma via Aprender Ritual). */
  element: AffinityElement | null;
}

/** Poder de classe escolhido em um espaço de "Poder" (NEX 15%, 30%…). */
export interface PowerPick {
  id: string;
  /** Elemento (Especialista/Mestre em Elemento) ou ritual (Ritual Predileto). */
  choice: string | null;
  /** Treinamento em Perícia: as duas perícias. */
  skills: string[];
  /** Transcender: o poder paranormal recebido. */
  para: ParaPick | null;
}

export interface RitualPick {
  name: string;
  /** Elemento escolhido para Amaldiçoar Arma. */
  element: AffinityElement | null;
  /** Guardado no Grimório Ritualístico (trilha Graduado). */
  grimoire: boolean;
}

export type Versatility =
  | { kind: "power"; pick: PowerPick | null }
  | { kind: "trail"; trail: string | null };

export interface Details {
  genero: string;
  idade: string;
  aparencia: string;
  personalidade: string;
  historico: string;
  objetivo: string;
}

export interface OrdemState {
  name: string;
  concept: string;
  details: Details;
  /** Atributos iniciais (0 a 3), antes dos aumentos por NEX. */
  attrs: Record<Attr, number>;
  origin: string | null;
  /** Amnésico: as duas perícias "à escolha do mestre". */
  originSkills: string[];
  /** Cultista Arrependido: o poder paranormal de Traços do Outro Lado. */
  originPara: ParaPick | null;
  /** Especialização da perícia Profissão. */
  profession: string;
  classKey: ClassKey | null;
  /** Índice em NEX_LEVELS (0 = NEX 5%). */
  nexIndex: number;
  trail: string | null;
  /** Combatente: a escolha de cada grupo "uma das duas" (Luta/Pontaria, Fortitude/Reflexos). */
  classSkills: (string | null)[];
  freeSkills: string[];
  /** Especialista: as duas perícias da habilidade Perito. */
  perito: string[];
  /** Aumentos de atributo em NEX 20%, 50%, 80% e 95%. */
  attrIncreases: (Attr | null)[];
  /** Grau de Treinamento em NEX 35% e 70%. */
  grau: [string[], string[]];
  /** Poderes de classe em NEX 15%, 30%, 45%, 60%, 75% e 90%. */
  powers: (PowerPick | null)[];
  versatility: Versatility | null;
  /** Elemento escolhido ao atingir NEX 50%. */
  affinity: AffinityElement | null;
  rituals: RitualPick[];
}

export function blankDetails(): Details {
  return { genero: "", idade: "", aparencia: "", personalidade: "", historico: "", objetivo: "" };
}

export function blankState(): OrdemState {
  return {
    name: "",
    concept: "",
    details: blankDetails(),
    attrs: Object.fromEntries(ATTRS.map((a) => [a.key, 1])) as Record<Attr, number>,
    origin: null,
    originSkills: [],
    originPara: null,
    profession: "",
    classKey: null,
    nexIndex: 0,
    trail: null,
    classSkills: [],
    freeSkills: [],
    perito: [],
    attrIncreases: [],
    grau: [[], []],
    powers: [],
    versatility: null,
    affinity: null,
    rituals: [],
  };
}

export const blankPowerPick = (id: string): PowerPick => ({ id, choice: null, skills: [], para: null });
export const blankParaPick = (id: string): ParaPick => ({ id, choice: null, element: null });

// ── Restauração de fichas salvas/importadas ───────────────────────

type Raw = Record<string, unknown>;
const isObj = (x: unknown): x is Raw => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown, max = 2000) => (typeof x === "string" ? x.slice(0, max) : "");
const skillList = (x: unknown, max: number) =>
  Array.isArray(x) ? [...new Set(x.filter(isSkill))].slice(0, max) : [];

function sanitizePara(x: unknown): ParaPick | null {
  if (!isObj(x) || !isParanormalId(x.id)) return null;
  return {
    id: x.id,
    choice: typeof x.choice === "string" ? x.choice.slice(0, 80) : null,
    element: isAffinityElement(x.element) ? x.element : null,
  };
}

function sanitizePower(x: unknown): PowerPick | null {
  if (!isObj(x) || typeof x.id !== "string") return null;
  return {
    id: x.id.slice(0, 60),
    choice: typeof x.choice === "string" ? x.choice.slice(0, 80) : null,
    skills: skillList(x.skills, 2),
    para: sanitizePara(x.para),
  };
}

/** Restaura um estado salvo/importado, descartando campos inválidos. */
export function sanitizeState(input: unknown): OrdemState {
  const s = blankState();
  if (!isObj(input)) return s;
  const raw = input;

  s.name = str(raw.name, 60);
  s.concept = str(raw.concept, 300);
  if (isObj(raw.details)) {
    (Object.keys(s.details) as (keyof Details)[]).forEach((k) => { s.details[k] = str((raw.details as Raw)[k]); });
  }
  if (isObj(raw.attrs)) {
    ATTRS.forEach((a) => {
      const v = (raw.attrs as Raw)[a.key];
      if (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3) s.attrs[a.key] = v as number;
    });
    // no máximo um atributo reduzido a 0
    let zero = false;
    ATTRS.forEach((a) => { if (s.attrs[a.key] === 0) { if (zero) s.attrs[a.key] = 1; zero = true; } });
  }
  if (isOriginKey(raw.origin)) s.origin = raw.origin;
  s.originSkills = skillList(raw.originSkills, 2);
  s.originPara = sanitizePara(raw.originPara);
  s.profession = str(raw.profession, 40);
  if (isClassKey(raw.classKey)) s.classKey = raw.classKey;
  if (Number.isInteger(raw.nexIndex) && (raw.nexIndex as number) >= 0 && (raw.nexIndex as number) < NEX_LEVELS.length) s.nexIndex = raw.nexIndex as number;
  if (isTrailKey(raw.trail) && s.classKey && trailIndex.get(raw.trail)!.cls === s.classKey) s.trail = raw.trail;
  if (Array.isArray(raw.classSkills) && s.classKey) {
    s.classSkills = CLASSES[s.classKey].skillGroups.map((g, i) => {
      const v = (raw.classSkills as unknown[])[i];
      return typeof v === "string" && g.includes(v) ? v : null;
    });
  }
  s.freeSkills = skillList(raw.freeSkills, 40);
  s.perito = skillList(raw.perito, 2);
  if (Array.isArray(raw.attrIncreases)) s.attrIncreases = raw.attrIncreases.slice(0, 4).map((a) => (isAttr(a) ? a : null));
  if (Array.isArray(raw.grau)) s.grau = [skillList(raw.grau[0], 40), skillList(raw.grau[1], 40)];
  if (Array.isArray(raw.powers)) s.powers = raw.powers.slice(0, 6).map(sanitizePower);
  if (isObj(raw.versatility)) {
    const v = raw.versatility;
    if (v.kind === "power") s.versatility = { kind: "power", pick: sanitizePower(v.pick) };
    else if (v.kind === "trail") s.versatility = { kind: "trail", trail: isTrailKey(v.trail) ? v.trail : null };
  }
  if (isAffinityElement(raw.affinity)) s.affinity = raw.affinity;
  if (Array.isArray(raw.rituals)) {
    const seen = new Set<string>();
    s.rituals = raw.rituals
      .filter((r): r is Raw => isObj(r) && typeof r.name === "string" && ritualIndex.has(r.name))
      .filter((r) => !seen.has(r.name as string) && !!seen.add(r.name as string))
      .map((r) => ({ name: r.name as string, element: isAffinityElement(r.element) ? r.element : null, grimoire: r.grimoire === true }));
  }
  return s;
}
