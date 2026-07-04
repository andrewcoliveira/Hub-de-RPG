// ══════════════════════════════════════════════════════════════════
//  7º MAR — Derivações puras (núcleo)
//  Porte de scripts/setimo-mar/state.js (sm*), scripts/setimo-mar/create.js
//  (smSorceryBudget, smPowerRank, smCompleteness) e scripts/setimo-mar/app.js
//  (smTabComplete). Todas as funções são puras: recebem `Ficha` e não mutam
//  nem dependem de estado global.
// ══════════════════════════════════════════════════════════════════

import { CREATION } from "./creation";
import { TRAITS, SKILLS, BACKGROUNDS, ADVANTAGES, SORCERY } from "./data";
import type { Ficha, TraitKey, SkillKey, SchoolKey } from "./types";

// ── Atributos ─────────────────────────────────────────────────────────
export function traitFinal(f: Ficha, key: TraitKey): number {
  return f.traits[key] + (f.nationTrait === key ? CREATION.traitNation : 0);
}

export function traitFreeSpent(f: Ficha): number {
  return TRAITS.reduce((sum, t) => sum + (f.traits[t.key] - CREATION.traitBase), 0);
}

export function traitFreeLeft(f: Ficha): number {
  return CREATION.traitFree - traitFreeSpent(f);
}

// ── Perícias ──────────────────────────────────────────────────────────
export function skillBackgroundBonus(f: Ficha, key: SkillKey): number {
  let n = 0;
  f.backgrounds.forEach((bg) => {
    const b = BACKGROUNDS[bg];
    if (b && b.skills.includes(key)) n += 1; // cada Formação dá Grau 1
  });
  return n;
}

export function skillFinal(f: Ficha, key: SkillKey): number {
  return (f.skills[key] ?? 0) + skillBackgroundBonus(f, key);
}

export function skillPointsSpent(f: Ficha): number {
  return SKILLS.reduce((sum, s) => sum + (f.skills[s.key] ?? 0), 0);
}

export function skillPointsLeft(f: Ficha): number {
  return CREATION.skillPoints - skillPointsSpent(f);
}

// ── Vantagens ─────────────────────────────────────────────────────────
export function freeAdvantages(f: Ficha): Set<string> {
  const set = new Set<string>();
  f.backgrounds.forEach((bg) => {
    const b = BACKGROUNDS[bg];
    if (b && b.freeAdvantage) set.add(b.freeAdvantage);
  });
  return set;
}

export function advantagePointsSpent(f: Ficha): number {
  const free = freeAdvantages(f);
  return f.advantages.reduce((sum, key) => {
    if (free.has(key)) return sum; // grátis não custa
    const a = ADVANTAGES[key];
    return sum + (a ? a.cost : 0);
  }, 0);
}

export function advantagePointsLeft(f: Ficha): number {
  return CREATION.advantagePoints - advantagePointsSpent(f);
}

// ── Derivados v2 ────────────────────────────────────────────────────────
export function temVantagem(f: Ficha, key: string): boolean {
  return f.advantages.includes(key) || freeAdvantages(f).has(key);
}

export function temFeiticaria(f: Ficha): boolean {
  return temVantagem(f, "feiticaria");
}

export function temAcademiaDuelista(f: Ficha): boolean {
  return temVantagem(f, "academiaduelista");
}

export function numIdiomas(f: Ficha): number {
  return traitFinal(f, "argucia");
}

export function fortunaPersiste(f: Ficha): boolean {
  return temVantagem(f, "rico") || temVantagem(f, "benfeitor");
}

// ── Feitiçaria — orçamento e classificação de poderes ──────────────────
export function sorceryBudget(f: Ficha): { maiores: number; menores: number } {
  const buys = f.advantages.filter((a) => a === "feiticaria").length + (freeAdvantages(f).has("feiticaria") ? 1 : 0);
  const n = Math.max(buys, 1);
  return { maiores: 1 * n, menores: 2 * n };
}

export function powerRank(f: Ficha, key: string): "maior" | "menor" | null {
  const school = f.sorcery?.school as SchoolKey | null | undefined;
  const s = school ? SORCERY[school] : undefined;
  if (!s) return null;
  if (s.maiores.some((p) => p.key === key)) return "maior";
  if (s.menores.some((p) => p.key === key)) return "menor";
  return null;
}

// ── Completude de abas (porte de smTabComplete em app.js) ──────────────
export function tabComplete(f: Ficha, tabId: string): boolean {
  switch (tabId) {
    case "conceito":
      return !!f.concept?.name && !!f.nation && !!f.nationTrait;
    case "atributos":
      return traitFreeLeft(f) === 0;
    case "formacoes":
      return f.backgrounds.length === CREATION.backgroundsToPick;
    case "pericias":
      return skillPointsLeft(f) === 0;
    case "vantagens":
      return advantagePointsLeft(f) >= 0; // sempre ok (opcional gastar tudo)
    case "arcanos":
      return !!f.arcana?.virtude && !!f.arcana?.hubris;
    case "feiticaria":
      return !temFeiticaria(f) || !!f.sorcery?.school;
    case "duelo":
      return !temAcademiaDuelista(f) || !!f.dueling?.style;
    case "historias":
      return true; // opcional na criação
    case "sociedade":
      return true; // opcional
    case "toques":
      return true; // opcional
    case "revisao":
      return true;
    default:
      return true;
  }
}

// ── Checklist de completude (porte de smCompleteness em create.js) ─────
export function completeness(f: Ficha): string[] {
  const issues: string[] = [];
  if (!f.concept?.name) issues.push("Dê um nome ao personagem.");
  if (!f.nation) issues.push("Escolha uma Nação.");
  else if (!f.nationTrait) issues.push("Escolha onde aplicar o +1 de Nação.");
  const tl = traitFreeLeft(f);
  if (tl > 0) issues.push(`Distribua os ${tl} ponto(s) de Atributo restantes.`);
  if (f.backgrounds.length < CREATION.backgroundsToPick) issues.push("Escolha 2 Formações.");
  const sl = skillPointsLeft(f);
  if (sl > 0) issues.push(`Gaste os ${sl} ponto(s) de Perícia restantes.`);
  if (!f.arcana?.virtude) issues.push("Escolha uma Virtude (Arcano).");
  if (!f.arcana?.hubris) issues.push("Escolha uma Húbris (Arcano).");
  return issues;
}
