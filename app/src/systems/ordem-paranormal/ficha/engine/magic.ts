// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Rituais conhecidos
//  Ocultista: 3 rituais de 1º círculo + 1 por NEX alcançado depois de 5%.
//  Graduado: Saber Ampliado (1 por círculo acessado) e Grimório Ritualístico.
//  Outras classes: só pelo poder paranormal Aprender Ritual.
// ══════════════════════════════════════════════════════════════════

import type { Element } from "./data/elements";
import { RITUAL_COST, ritualIndex, type RitualDef } from "./data/rituals";
import { activeParas, activePowers, attrFinal, currentTrail, hasTrailAbility, nexOf, nexSteps } from "./core";
import type { OrdemState } from "./state";

/** Maior círculo que o ocultista pode lançar (2º em 25%, 3º em 55%, 4º em 85%). */
export function maxCircle(s: OrdemState): number {
  if (s.classKey !== "ocultista") return 0;
  const n = nexOf(s);
  return n >= 85 ? 4 : n >= 55 ? 3 : n >= 25 ? 2 : 1;
}

export type RitualPool = "classe" | "graduado" | "grimorio";

export interface RitualSlot { pool: RitualPool; min: number; max: number; label: string }

export const POOL_LABEL: Record<RitualPool, string> = {
  classe: "Escolhido pelo Outro Lado",
  graduado: "Saber Ampliado",
  grimorio: "Grimório Ritualístico",
};

/** Todas as vagas de ritual escolhíveis na etapa Rituais. */
export function ritualSlots(s: OrdemState): RitualSlot[] {
  if (s.classKey !== "ocultista") return [];
  const max = maxCircle(s), nex = nexOf(s);
  const out: RitualSlot[] = [];
  for (let i = 0; i < 3 + s.nexIndex; i++) out.push({ pool: "classe", min: 1, max, label: i < 3 ? "Ritual inicial (1º círculo)" : "Novo NEX" });
  // os três rituais iniciais são de 1º círculo
  out[0].max = out[1].max = out[2].max = 1;

  // Saber Ampliado: 1º círculo ao receber a habilidade + 1 a cada novo círculo acessado depois disso
  if (hasTrailAbility(s, "graduado", 10)) {
    const since = currentTrail(s)?.key === "graduado" ? 10 : 50;
    out.push({ pool: "graduado", min: 1, max: 1, label: "Saber Ampliado (1º círculo)" });
    ([[25, 2], [55, 3], [85, 4]] as const).forEach(([access, c]) => {
      if (access >= since && access <= nex) out.push({ pool: "graduado", min: c, max: c, label: `Saber Ampliado (${c}º círculo)` });
    });
  }
  // Grimório: Intelecto rituais de 1º ou 2º círculo + 1 de cada novo círculo
  if (currentTrail(s)?.key === "graduado" && nex >= 40) {
    for (let i = 0; i < Math.max(0, attrFinal(s, "int")); i++) out.push({ pool: "grimorio", min: 1, max: 2, label: "Grimório (1º ou 2º círculo)" });
    if (nex >= 55) out.push({ pool: "grimorio", min: 3, max: 3, label: "Grimório (3º círculo)" });
    if (nex >= 85) out.push({ pool: "grimorio", min: 4, max: 4, label: "Grimório (4º círculo)" });
  }
  return out;
}

export interface RitualMatch {
  /** Vaga usada por cada ritual escolhido (mesmo índice de s.rituals); null = sem vaga. */
  slotOf: (number | null)[];
  slots: RitualSlot[];
}

/** Distribui os rituais escolhidos nas vagas (emparelhamento máximo). */
export function matchRituals(s: OrdemState): RitualMatch {
  const slots = ritualSlots(s);
  const owner: (number | null)[] = slots.map(() => null);
  const slotOf: (number | null)[] = s.rituals.map(() => null);
  const fits = (ri: number, si: number) => {
    const r = ritualIndex.get(s.rituals[ri].name);
    const sl = slots[si];
    if (!r || r.circle > maxCircle(s)) return false;
    if ((sl.pool === "grimorio") !== s.rituals[ri].grimoire) return false;
    return r.circle >= sl.min && r.circle <= sl.max;
  };
  const tryAssign = (ri: number, seen: Set<number>): boolean => {
    for (let si = 0; si < slots.length; si++) {
      if (seen.has(si) || !fits(ri, si)) continue;
      seen.add(si);
      if (owner[si] === null || tryAssign(owner[si]!, seen)) { owner[si] = ri; slotOf[ri] = si; return true; }
    }
    return false;
  };
  // rituais de círculo maior primeiro: são os mais restritos
  s.rituals.map((_, i) => i)
    .sort((a, b) => (ritualIndex.get(s.rituals[b].name)?.circle ?? 0) - (ritualIndex.get(s.rituals[a].name)?.circle ?? 0))
    .forEach((ri) => tryAssign(ri, new Set()));
  owner.forEach((ri, si) => { if (ri !== null) slotOf[ri] = si; });
  return { slotOf, slots };
}

export interface GrantedRitual { name: string; element: Element | null; source: string }

/** Rituais concedidos por trilha ou por Aprender Ritual (não ocupam vagas). */
export function grantedRituals(s: OrdemState): GrantedRitual[] {
  const out: GrantedRitual[] = [];
  if (hasTrailAbility(s, "lamina-paranormal", 10)) out.push({ name: "Amaldiçoar Arma", element: null, source: "Lâmina Maldita" });
  const t = currentTrail(s);
  if (t?.ritual99 && nexOf(s) >= 99) out.push({ name: t.ritual99, element: "medo", source: t.label });
  activeParas(s).forEach((p) => {
    if (p.pick.id === "aprender-ritual" && p.pick.choice && ritualIndex.has(p.pick.choice)) {
      out.push({ name: p.pick.choice, element: p.pick.element, source: `Aprender Ritual (NEX ${p.nex}%)` });
    }
  });
  return out;
}

/** Todos os rituais conhecidos (escolhidos + concedidos), sem repetição. */
export function knownRituals(s: OrdemState): { def: RitualDef; element: Element | null; source: string; grimoire: boolean }[] {
  const out: { def: RitualDef; element: Element | null; source: string; grimoire: boolean }[] = [];
  const seen = new Set<string>();
  const { slotOf, slots } = matchRituals(s);
  s.rituals.forEach((r, i) => {
    const def = ritualIndex.get(r.name);
    if (!def || seen.has(r.name)) return;
    seen.add(r.name);
    const si = slotOf[i];
    out.push({ def, element: r.element ?? (def.elements.length === 1 ? def.elements[0] : null), source: si === null ? "sem vaga" : POOL_LABEL[slots[si].pool], grimoire: r.grimoire });
  });
  grantedRituals(s).forEach((g) => {
    const def = ritualIndex.get(g.name);
    if (!def || seen.has(g.name)) return;
    seen.add(g.name);
    out.push({ def, element: g.element ?? (def.elements.length === 1 ? def.elements[0] : null), source: g.source, grimoire: false });
  });
  return out.sort((a, b) => a.def.circle - b.def.circle || a.def.name.localeCompare(b.def.name, "pt"));
}

export const canCastRituals = (s: OrdemState): boolean => s.classKey === "ocultista" || knownRituals(s).length > 0;

/** DT para resistir aos rituais: 10 + limite de PE + Presença (+ Rituais Eficientes, + Especialista em Elemento). */
export function ritualDT(s: OrdemState, element?: Element | null): number {
  let dt = 10 + nexSteps(s) + attrFinal(s, "pre");
  if (hasTrailAbility(s, "graduado", 65)) dt += 5;
  if (element && activePowers(s).some((p) => p.pick.id === "especialista-em-elemento" && p.pick.choice === element)) dt += 2;
  return dt;
}

/** Custo em PE de um ritual, com Mestre em Elemento e Ritual Predileto. */
export function ritualCost(s: OrdemState, def: RitualDef, element: Element | null): number {
  let cost = RITUAL_COST[def.circle];
  if (element && activePowers(s).some((p) => p.pick.id === "mestre-em-elemento" && p.pick.choice === element)) cost -= 1;
  if (activePowers(s).some((p) => p.pick.id === "ritual-predileto" && p.pick.choice === def.name)) cost -= 1;
  return Math.max(0, cost);
}

// ── Mutações ──────────────────────────────────────────────────────

export function toggleRitual(d: OrdemState, name: string): "added" | "removed" | "full" | "invalid" {
  const def = ritualIndex.get(name);
  if (!def || def.trailOnly || def.circle > maxCircle(d)) return "invalid";
  const i = d.rituals.findIndex((r) => r.name === name);
  if (i >= 0) { d.rituals.splice(i, 1); return "removed"; }
  d.rituals.push({ name, element: null, grimoire: false });
  if (matchRituals(d).slotOf.at(-1) === null) {
    // tenta no grimório antes de desistir
    d.rituals[d.rituals.length - 1].grimoire = true;
    if (matchRituals(d).slotOf.at(-1) === null) { d.rituals.pop(); return "full"; }
  }
  return "added";
}

export function ritualUsage(s: OrdemState): { pool: RitualPool; used: number; total: number }[] {
  const { slotOf, slots } = matchRituals(s);
  const pools: RitualPool[] = ["classe", "graduado", "grimorio"];
  return pools
    .map((pool) => ({
      pool,
      total: slots.filter((x) => x.pool === pool).length,
      used: slotOf.filter((si) => si !== null && slots[si].pool === pool).length,
    }))
    .filter((p) => p.total > 0);
}
