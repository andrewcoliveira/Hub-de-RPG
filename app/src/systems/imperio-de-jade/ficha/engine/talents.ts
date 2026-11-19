// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Talentos (Capítulo 2): dados, pré-requisitos,
//  talentos concedidos e escolhas por nível.
// ══════════════════════════════════════════════════════════════════

import talentsJson from "../data/talents.json";
import { ABILITIES, RACES, type AbilityKey, type RaceKey } from "./data/races";
import { CLASSES, type ClassKey } from "./data/classes";
import { classAbilities, finalValueFor } from "./rules";
import type { JadeState } from "./state";

export interface TalentData { prerequisitos?: string[]; desc?: string }

export type TalentCategory = "combate" | "pericia" | "destino" | "jutsu" | "tormenta" | "poder_concedido";

type TalentsJson = Record<Exclude<TalentCategory, "poder_concedido">, Record<string, TalentData>> & {
  poder_concedido: Record<string, Record<string, TalentData>>;
};
export const TALENTS = talentsJson as unknown as TalentsJson;

export const CATEGORY_META: Record<TalentCategory, { label: string }> = {
  combate: { label: "Combate" },
  pericia: { label: "Perícia" },
  destino: { label: "Destino" },
  jutsu: { label: "Jutsu" },
  tormenta: { label: "Tormenta" },
  poder_concedido: { label: "Poder Concedido" },
};
export const CATEGORIES = Object.keys(CATEGORY_META) as TalentCategory[];

// Poderes concedidos dependem da devoção à divindade do grupo
// ("Devotar-se a outra religião faz perder este talento e seus poderes").
const DEITY_DEVOTION: Record<string, string> = {
  "Família Celestial": "Devoto da Família Celestial",
  "Lin-Wu": "Devoto de Lin-Wu",
  "Bushintau": "Devoto do Bushintau",
};

/** Talentos que a raça concede automaticamente (ver habilidades raciais). */
const RACE_TALENTS: Partial<Record<RaceKey, string[]>> = {
  kaijin: ["Anatomia Insana", "Carapaça"],
};

/** Talentos fixos que a classe concede a partir de um nível. */
const CLASS_LEVEL_TALENTS: Partial<Record<ClassKey, [number, string][]>> = {
  wujen: [[2, "Abrir Chacra"]],   // segredos dos chacras
  yakuza: [[6, "Liderança"]],     // capangas
};

/** Habilidades de classe que dão escolhas extras de talento (contadas pela tabela de progressão). */
const CLASS_BONUS_TALENTS = [
  { re: /técnica de luta/i, label: "Técnica de luta", note: "talento de combate" },
  { re: /talento de sobrevivente/i, label: "Talento de sobrevivente", note: "da lista da habilidade" },
  { re: /poder concedido/i, label: "Poder concedido", note: "poder concedido da sua religião" },
  { re: /lições espirituais/i, label: "Lições espirituais", note: "poder concedido do Bushintau ou talento de jutsu" },
  { re: /estudos caóticos/i, label: "Estudos caóticos", note: "talento de jutsu" },
];

// ── Índice dos talentos ───────────────────────────────────────────

export interface TalentEntry {
  name: string;
  data: TalentData;
  cat: TalentCategory;
  deity: string | null;
  /** Pré-requisitos efetivos (inclui a devoção implícita dos poderes concedidos). */
  prereqs: string[];
}

function effectivePrereqs(data: TalentData, deity: string | null): string[] {
  const list = [...(data.prerequisitos ?? [])];
  const devotion = deity ? DEITY_DEVOTION[deity] : null;
  if (devotion && !list.includes(devotion)) list.unshift(devotion);
  return list;
}

const ENTRIES: Record<TalentCategory, TalentEntry[]> = Object.fromEntries(
  CATEGORIES.map((cat) => {
    if (cat === "poder_concedido") {
      return [cat, Object.entries(TALENTS.poder_concedido).flatMap(([deity, subs]) =>
        Object.entries(subs).map(([name, data]) => ({ name, data, cat, deity, prereqs: effectivePrereqs(data, deity) })))];
    }
    return [cat, Object.entries(TALENTS[cat]).map(([name, data]) => ({ name, data, cat, deity: null, prereqs: effectivePrereqs(data, null) }))];
  }),
) as Record<TalentCategory, TalentEntry[]>;

export const talentEntries = (cat: TalentCategory) => ENTRIES[cat];
export const talentIndex = new Map<string, TalentEntry>(CATEGORIES.flatMap((c) => ENTRIES[c].map((e) => [e.name, e] as const)));
export const allTalentNames = new Set(talentIndex.keys());
export const talentPrereqs = (name: string) => talentIndex.get(name)?.prereqs ?? [];

// ── Talentos concedidos (classe / raça) ───────────────────────────

/** "Usar Armaduras (leves, médias e pesadas), Fortitude Maior." → nomes de talento existentes. */
export function parseTalentList(text: string): string[] {
  const parts: string[] = [];
  let depth = 0, cur = "";
  for (const ch of String(text || "").replace(/\.\s*$/, "")) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());

  const out: string[] = [];
  for (const p of parts) {
    if (allTalentNames.has(p)) { out.push(p); continue; }
    const m = p.match(/^(.+?)\s*\((.+)\)$/);
    if (!m) continue;
    const base = m[1].trim();
    let found = false;
    m[2].split(/,\s*|\s+e\s+/).forEach((q) => {
      q = q.trim();
      const name = `${base} ${q.charAt(0).toUpperCase()}${q.slice(1)}`;
      if (allTalentNames.has(name)) { out.push(name); found = true; }
    });
    if (!found && allTalentNames.has(base)) out.push(base);
  }
  return out;
}

/** Opções de devoção num texto como "Escolhe entre Devoto de Lin-Wu ou Devoto da Família Celestial". */
function devotionOptions(text: string): string[] {
  const opts = String(text || "").match(/Devoto d[aeo] [A-ZÀ-Ú][\wÀ-ú'-]*(?: [A-ZÀ-Ú][\wÀ-ú'-]*)*/g) || [];
  return [...new Set(opts)].filter((n) => allTalentNames.has(n));
}

/** Habilidade de classe "Devoto" (escolha livre de devoção), se já obtida. */
export function classDevotionChoice(s: JadeState): { options: string[]; desc: string } | null {
  const ab = classAbilities(s).gained.find((a) => a.name === "Devoto");
  if (!ab) return null;
  const options = devotionOptions(ab.desc);
  return options.length ? { options, desc: ab.desc } : null;
}

// Cache por estado, invalidado se os campos que definem os talentos concedidos mudarem
const grantedCache = new WeakMap<JadeState, { key: string; map: Map<string, string> }>();

/** Nome → origem ("Samurai", "Kaijin"…) dos talentos que o personagem tem sem gastar escolhas. */
export function grantedTalents(s: JadeState): Map<string, string> {
  const key = [s.classKey, s.level, s.race, s.devotion].join("|");
  const cached = grantedCache.get(s);
  if (cached?.key === key) return cached.map;
  const out = new Map<string, string>();
  if (s.classKey) {
    const cls = CLASSES[s.classKey];
    parseTalentList(cls.talentos_iniciais).forEach((n) => out.set(n, cls.label));
    classAbilities(s).gained.forEach((a) => { if (allTalentNames.has(a.name)) out.set(a.name, cls.label); });
    (CLASS_LEVEL_TALENTS[s.classKey] ?? []).forEach(([lvl, n]) => {
      if (s.level >= lvl && allTalentNames.has(n)) out.set(n, cls.label);
    });
    const choice = classDevotionChoice(s);
    if (choice && s.devotion && choice.options.includes(s.devotion)) out.set(s.devotion, cls.label);
  }
  if (s.race) (RACE_TALENTS[s.race] ?? []).forEach((n) => { if (allTalentNames.has(n)) out.set(n, RACES[s.race!].label); });
  grantedCache.set(s, { key, map: out });
  return out;
}

export const isTalentSelected = (s: JadeState, name: string) => s.selectedTalents.some((t) => t.name === name);
export const hasTalent = (s: JadeState, name: string) => isTalentSelected(s, name) || grantedTalents(s).has(name);

/** Quantas vezes o personagem tem um talento (escolhido e/ou concedido). */
export const talentCount = (s: JadeState, name: string) =>
  s.selectedTalents.filter((t) => t.name === name).length + (grantedTalents(s).has(name) ? 1 : 0);

// ── Pré-requisitos ────────────────────────────────────────────────

/** true = atendido, false = não atendido, null = não verificável (o mestre confere). */
export function checkSinglePrereq(s: JadeState, req: string, self: string | null = null): boolean | null {
  const raw = req.trim();
  const r = raw.toLowerCase();

  const attrMatch = raw.match(/^(For|Des|Con|Int|Sab|Car|Hon)\s+(\d+)$/i);
  if (attrMatch) {
    const val = finalValueFor(s, attrMatch[1].toLowerCase() as AbilityKey);
    return val !== null && val >= parseInt(attrMatch[2], 10);
  }

  const bbaMatch = raw.match(/bônus base de ataque \+(\d+)/i);
  if (bbaMatch) return !!s.classKey && CLASSES[s.classKey].tabela[s.level - 1].bba >= parseInt(bbaMatch[1], 10);

  const lvlMatch = raw.match(/personagem\s+(?:de\s+)?(\d+)[ºo°]\s+n[íi]vel/i);
  if (lvlMatch) return s.level >= parseInt(lvlMatch[1], 10);

  // Classe + nível: "kensei 4º nível", "wu-jen 4º nível"
  const classLvlMatch = raw.match(/^(\w[\w-]*)\s+(\d+)[ºo°]\s+n[íi]vel$/i);
  if (classLvlMatch) {
    const reqClass = classLvlMatch[1].toLowerCase().replace(/-/g, "");
    return s.classKey === reqClass && s.level >= parseInt(classLvlMatch[2], 10);
  }

  // Alternativas: "hanyô ou vanara"
  if (r.includes(" ou ")) {
    const results = raw.split(/\s+ou\s+/i).map((part) => checkSinglePrereq(s, part.trim(), self));
    if (results.includes(true)) return true;
    if (results.every((x) => x === false)) return false;
    return null;
  }

  const raceNames: Record<string, RaceKey> = {
    "hanyô": "hanyo", henge: "henge", mashin: "mashin", nezumi: "nezumi",
    ryuujin: "ryuujin", vanara: "vanara", kaijin: "kaijin", humano: "humano",
  };
  if (raceNames[r]) return s.race === raceNames[r];

  if (r === "treinado na perícia escolhida") return s.selectedSkills.length > 0;
  const trainedMatch = raw.match(/^treinado em (.+)$/i);
  if (trainedMatch) {
    const skill = trainedMatch[1].trim().toLowerCase();
    return s.selectedSkills.some((x) => x.name.toLowerCase() === skill);
  }

  if (allTalentNames.has(raw)) return hasTalent(s, raw);

  // Talento com qualificador: "Foco em Arma com a arma escolhida", "Foco em Perícia (Ofício)"
  let prefix: string | null = null;
  for (const name of allTalentNames) {
    const n = name.toLowerCase();
    if ((r.startsWith(`${n} `) || r.startsWith(`${n}(`)) && (!prefix || name.length > prefix.length)) prefix = name;
  }
  if (prefix) return hasTalent(s, prefix);

  // "outro talento da Tormenta", "dois outros talentos da Tormenta"…
  const tormentaMatch = raw.match(/^(?:(um|outro|dois|três|\d+)\s+)?outros?\s+talentos?\s+da\s+tormenta/i);
  if (tormentaMatch) {
    const word = (tormentaMatch[1] || "outro").toLowerCase();
    const needed = word === "um" || word === "outro" ? 1 : word === "dois" ? 2 : word === "três" ? 3 : parseInt(word, 10);
    const owned = new Set([...s.selectedTalents.map((t) => t.name), ...grantedTalents(s).keys()]);
    if (self) owned.delete(self);
    return [...owned].filter((n) => talentIndex.get(n)?.cat === "tormenta").length >= needed;
  }

  const canalMatch = raw.match(/canalizar energia\s+(\d+)d6/i);
  if (canalMatch) return maxCanalizarDice(s) >= parseInt(canalMatch[1], 10);
  if (r === "canalizar energia") return hasCanalizarEnergia(s);

  const habMatch = raw.match(/habilidade\s+(?:do chacra\s+)?escolhid[oa]\s+(\d+)/i);
  if (habMatch) {
    const needed = parseInt(habMatch[1], 10);
    return ABILITIES.some((a) => (finalValueFor(s, a.key) ?? 0) >= needed);
  }

  // Proficiências escolhidas no momento — assume atendido
  if (r.includes("saber usar a arma") || r.includes("saber usar o tipo de armadura")) return true;

  if (r === "visão no escuro") return ["kaijin", "mashin", "ryuujin"].includes(s.race ?? "");

  return null;
}

function maxCanalizarDice(s: JadeState): number {
  if (!s.classKey) return 0;
  let max = 0;
  CLASSES[s.classKey].tabela.filter((row) => row.nivel <= s.level).forEach((row) => {
    row.hab.forEach((h) => {
      const m = h.match(/canalizar energia (\d+)d6/i);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
  });
  return max;
}

function hasCanalizarEnergia(s: JadeState): boolean {
  return !!s.classKey && CLASSES[s.classKey].tabela.slice(0, s.level).some((row) => row.hab.some((h) => /canalizar energia/i.test(h)));
}

export function checkPrerequisitos(s: JadeState, prereqs: string[], self: string | null = null) {
  const unmet: string[] = [], unknown: string[] = [];
  for (const req of prereqs) {
    const r = checkSinglePrereq(s, req, self);
    if (r === false) unmet.push(req);
    else if (r === null) unknown.push(req);
  }
  // Requisitos não verificáveis não bloqueiam: ficam sinalizados para o mestre
  return { met: unmet.length === 0, unmet, unknown };
}

// ── Escolhas por nível ────────────────────────────────────────────
//  Nível N = N escolhas (talento ou +1 em habilidade básica), mais os talentos
//  extras da raça (humano, kaijin) e das habilidades de classe.

export interface BonusSource { label: string; count: number; note: string }

export function bonusTalentSources(s: JadeState): BonusSource[] {
  const out: BonusSource[] = [];
  if (s.race === "humano") out.push({ label: "Humano", count: 2, note: "talentos extras" });
  if (s.race === "kaijin") out.push({ label: "Kaijin", count: 2, note: "talentos da Tormenta, sem dano de Honra" });
  if (s.classKey) {
    const rows = CLASSES[s.classKey].tabela.filter((r) => r.nivel <= s.level);
    CLASS_BONUS_TALENTS.forEach((b) => {
      const count = rows.filter((r) => r.hab.some((h) => b.re.test(h))).length;
      if (count) out.push({ label: b.label, count, note: b.note });
    });
  }
  return out;
}

export const freeSlotCount = (s: JadeState) => s.level + bonusTalentSources(s).reduce((t, b) => t + b.count, 0);
export const totalAbilityIncrements = (s: JadeState) => Object.values(s.abilityIncrements).reduce((t, v) => t + (v || 0), 0);
export const usedFreeSlots = (s: JadeState) => s.selectedTalents.length + totalAbilityIncrements(s);
export const slotsLeft = (s: JadeState) => freeSlotCount(s) - usedFreeSlots(s);

/** Só as escolhas "1 por nível" viram +1 em habilidade básica (nunca Honra). */
export const canIncrementAbility = (s: JadeState, key: AbilityKey) =>
  key !== "hon" && slotsLeft(s) > 0 && totalAbilityIncrements(s) < s.level;

/** Altera o rascunho. */
export function incrementAbility(s: JadeState, key: AbilityKey): boolean {
  if (!canIncrementAbility(s, key) || key === "hon") return false;
  s.abilityIncrements[key] = (s.abilityIncrements[key] ?? 0) + 1;
  return true;
}

/** Altera o rascunho. */
export function decrementAbility(s: JadeState, key: AbilityKey): boolean {
  if (key === "hon" || !s.abilityIncrements[key]) return false;
  s.abilityIncrements[key]! -= 1;
  if (!s.abilityIncrements[key]) delete s.abilityIncrements[key];
  return true;
}

/** Altera o rascunho. */
export function toggleTalent(s: JadeState, name: string, cat: string): "added" | "removed" | "full" | "locked" | "granted" {
  const idx = s.selectedTalents.findIndex((t) => t.name === name);
  if (idx >= 0) { s.selectedTalents.splice(idx, 1); return "removed"; }
  if (grantedTalents(s).has(name)) return "granted";
  if (slotsLeft(s) <= 0) return "full";
  if (!checkPrerequisitos(s, talentPrereqs(name), name).met) return "locked";
  s.selectedTalents.push({ name, category: cat });
  return "added";
}
