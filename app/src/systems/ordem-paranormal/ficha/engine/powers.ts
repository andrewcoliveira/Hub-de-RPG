// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Validação de poderes de classe e paranormais
// ══════════════════════════════════════════════════════════════════

import { attrInfo, elementLabel, type Attr } from "./data/elements";
import { CLASSES, CLASS_KEYS, POWER_NEX, findPower, type ClassKey, type PowerDef, type Prereq } from "./data/classes";
import { paranormalIndex, type ParanormalDef } from "./data/paranormal";
import { ritualIndex } from "./data/rituals";
import {
  activeParas, activePowers, affinityActive, attrFinal, hasPower, hasVersatility, nexOf, paraElement, powerSlotCount,
  type ActivePara, type ActivePower,
} from "./core";
import { isTrained } from "./training";
import { blankParaPick, blankPowerPick, type OrdemState, type ParaPick, type PowerPick } from "./state";

// ── Pré-requisitos ────────────────────────────────────────────────

export interface PrereqCheck { label: string; ok: boolean }

export function checkPrereq(s: OrdemState, p: Prereq | undefined, atNex: number): PrereqCheck[] {
  if (!p) return [];
  const out: PrereqCheck[] = [];
  Object.entries(p.attr ?? {}).forEach(([a, v]) => {
    out.push({ label: `${attrInfo(a as Attr).abbr[0]}${attrInfo(a as Attr).abbr.slice(1).toLowerCase()} ${v}`, ok: attrFinal(s, a as Attr) >= v! });
  });
  p.trained?.forEach((k) => out.push({ label: `treinado em ${k}`, ok: isTrained(s, k) }));
  if (p.trainedAny) out.push({ label: `treinado em ${p.trainedAny.join(" ou ")}`, ok: p.trainedAny.some((k) => isTrained(s, k)) });
  if (p.nex) out.push({ label: `NEX ${p.nex}%`, ok: atNex >= p.nex });
  if (p.power) out.push({ label: findPower(p.power)?.name ?? p.power, ok: hasPower(s, p.power) });
  return out;
}

// ── Poderes de classe ─────────────────────────────────────────────

/** Referência a um espaço de poder: índice do espaço ou "v" (Versatilidade). */
export type PowerRef = number | "v";

export function powerAt(s: OrdemState, ref: PowerRef): PowerPick | null {
  if (ref === "v") return s.versatility?.kind === "power" ? s.versatility.pick : null;
  return s.powers[ref] ?? null;
}

export function refNex(ref: PowerRef): number {
  return ref === "v" ? 50 : POWER_NEX[ref];
}

function writePower(d: OrdemState, ref: PowerRef, pick: PowerPick | null): void {
  if (ref === "v") { d.versatility = { kind: "power", pick }; return; }
  while (d.powers.length <= ref) d.powers.push(null);
  d.powers[ref] = pick;
}

export function setPower(d: OrdemState, ref: PowerRef, id: string | null): void {
  writePower(d, ref, id ? blankPowerPick(id) : null);
}

export function updatePower(d: OrdemState, ref: PowerRef, fn: (p: PowerPick) => void): void {
  const p = powerAt(d, ref);
  if (!p) return;
  fn(p);
}

export function setVersatilityKind(d: OrdemState, kind: "power" | "trail" | null): void {
  if (!kind) d.versatility = null;
  else if (kind === "power") d.versatility = { kind: "power", pick: null };
  else d.versatility = { kind: "trail", trail: null };
}

export function powerIssues(s: OrdemState, ap: { pick: PowerPick; def: PowerDef | undefined; nex: number }): string[] {
  const { pick, def } = ap;
  if (!def) return ["poder desconhecido"];
  const issues: string[] = [];
  checkPrereq(s, def.prereq, ap.nex).filter((c) => !c.ok).forEach((c) => issues.push(`requer ${c.label}`));
  if (!def.repeatable) {
    const times = activePowers(s).filter((p) => p.pick.id === def.id).length;
    if (times > 1) issues.push("não pode ser escolhido mais de uma vez");
  }
  if (def.choice === "element") {
    if (!pick.choice) issues.push("escolha um elemento");
    if (def.id === "mestre-em-elemento" && pick.choice) {
      const esp = activePowers(s).find((p) => p.pick.id === "especialista-em-elemento");
      if (esp && esp.pick.choice !== pick.choice) issues.push("precisa ser o mesmo elemento de Especialista em Elemento");
    }
  }
  if (def.choice === "ritual") {
    if (!pick.choice) issues.push("escolha um ritual conhecido");
  }
  if (def.special === "treinamento" && pick.skills.length < 2) issues.push("escolha duas perícias");
  if (def.special === "transcender") {
    if (!pick.para) issues.push("escolha o poder paranormal");
  }
  return issues;
}

/** Status de cada poder da lista para um espaço (para a tela de escolha). */
export function powerOptions(s: OrdemState, ref: PowerRef): { def: PowerDef; checks: PrereqCheck[]; taken: boolean }[] {
  if (!s.classKey) return [];
  const nex = refNex(ref);
  const current = powerAt(s, ref)?.id;
  return CLASSES[s.classKey].powers.map((def) => ({
    def,
    checks: checkPrereq(s, def.prereq, nex),
    taken: !def.repeatable && def.id !== current && activePowers(s).some((p) => p.pick.id === def.id),
  }));
}

// ── Poderes paranormais ───────────────────────────────────────────

/** Referência a um poder paranormal: o da origem ou o de um Transcender. */
export type ParaRef = "origin" | PowerRef;

export function paraAt(s: OrdemState, ref: ParaRef): ParaPick | null {
  if (ref === "origin") return s.originPara;
  return powerAt(s, ref)?.para ?? null;
}

export function setPara(d: OrdemState, ref: ParaRef, id: string | null): void {
  const pick = id ? blankParaPick(id) : null;
  if (ref === "origin") { d.originPara = pick; return; }
  const p = powerAt(d, ref);
  if (p) p.para = pick;
}

export function updatePara(d: OrdemState, ref: ParaRef, fn: (p: ParaPick) => void): void {
  const p = paraAt(d, ref);
  if (p) fn(p);
}

export const paraRefNex = (ref: ParaRef): number => (ref === "origin" ? 5 : refNex(ref));

/** Círculo máximo para Aprender Ritual no NEX em que o poder foi escolhido. */
export const aprenderRitualCircle = (nex: number): number => (nex >= 75 ? 3 : nex >= 45 ? 2 : 1);

/** Rituais aprendidos por Aprender Ritual estão limitados ao Intelecto. */
export const aprenderRitualLimit = (s: OrdemState): number => Math.max(0, attrFinal(s, "int"));

function sameElementOthers(s: OrdemState, self: ParaPick, element: string): number {
  return activeParas(s).filter((p) => p.pick !== self && paraElement(p.pick) === element).length;
}

/** Quantas vezes este poder pode ser escolhido (2 com afinidade no elemento). */
function paraMaxTimes(s: OrdemState, def: ParanormalDef, element: string | null): number {
  if (def.repeatable) return Infinity;
  return affinityActive(s) && element && element === s.affinity ? 2 : 1;
}

export function paraIssues(s: OrdemState, ap: { pick: ParaPick; nex: number }): string[] {
  const { pick } = ap;
  const def = paranormalIndex.get(pick.id);
  if (!def) return ["poder desconhecido"];
  const issues: string[] = [];
  const el = paraElement(pick);
  if (def.needs) {
    const have = el ? sameElementOthers(s, pick, el) : 0;
    if (have < def.needs) issues.push(`requer ${elementLabel(def.element!)} ${def.needs}`);
  }
  if (def.choice === "element" && !pick.element) issues.push("escolha um elemento");
  if (def.choice === "ritual") {
    const r = pick.choice ? ritualIndex.get(pick.choice) : null;
    if (!r) issues.push("escolha um ritual");
    else {
      if (r.circle > aprenderRitualCircle(ap.nex)) issues.push(`em NEX ${ap.nex}% aprende rituais até ${aprenderRitualCircle(ap.nex)}º círculo`);
      if (r.trailOnly) issues.push("ritual exclusivo de trilha");
      if (r.elements.length > 1 && !pick.element) issues.push("escolha o elemento do ritual");
    }
    const all = activeParas(s).filter((p) => p.pick.id === "aprender-ritual");
    if (all.length > aprenderRitualLimit(s) && all.indexOf(all.find((p) => p.pick === pick)!) >= aprenderRitualLimit(s)) {
      issues.push(`limite de rituais por Aprender Ritual é seu Intelecto (${aprenderRitualLimit(s)})`);
    }
  }
  if (def.choice === "class-power") {
    if (!pick.choice) issues.push("escolha um poder de outra classe");
    else {
      const [cls, id] = pick.choice.split(":") as [ClassKey, string];
      const pd = CLASSES[cls]?.powers.find((p) => p.id === id);
      if (!pd || cls === s.classKey) issues.push("escolha um poder de outra classe");
      else checkPrereq(s, pd.prereq, ap.nex).filter((c) => !c.ok).forEach((c) => issues.push(`${pd.name} requer ${c.label}`));
    }
  }
  const same = activeParas(s).filter((p) => p.pick.id === pick.id && (def.choice !== "element" || p.pick.element === pick.element));
  if (same.length > paraMaxTimes(s, def, el)) issues.push(same.length === 2 && def.element ? "repetir exige afinidade com o elemento" : "não pode ser escolhido de novo");
  return issues;
}

/** Status de cada poder paranormal para uma escolha (tela de escolha). */
export function paraOptions(s: OrdemState, ref: ParaRef): { def: ParanormalDef; ok: boolean; note: string | null }[] {
  const self = paraAt(s, ref);
  const others = activeParas(s).filter((p) => p.pick !== self);
  return [...paranormalIndex.values()].map((def) => {
    let ok = true, note: string | null = null;
    if (def.needs && def.element) {
      const have = others.filter((p) => paraElement(p.pick) === def.element).length;
      if (have < def.needs) { ok = false; note = `requer ${elementLabel(def.element)} ${def.needs}`; }
    }
    if (ok && !def.repeatable && def.choice !== "element") {
      const times = others.filter((p) => p.pick.id === def.id).length;
      if (times >= paraMaxTimes(s, def, def.element)) { ok = false; note = times ? "já escolhido" : null; }
      else if (times === 1) note = "afinidade";
    }
    if (ok && def.id === "aprender-ritual") {
      const n = others.filter((p) => p.pick.id === "aprender-ritual").length;
      if (n >= aprenderRitualLimit(s)) { ok = false; note = `limite = Intelecto (${aprenderRitualLimit(s)})`; }
    }
    return { def, ok, note };
  });
}

/** Poderes de outras classes para Expansão de Conhecimento. */
export function expansionOptions(s: OrdemState): { cls: ClassKey; def: PowerDef }[] {
  return CLASS_KEYS.filter((k) => k !== s.classKey).flatMap((cls) =>
    CLASSES[cls].powers.filter((p) => !p.special).map((def) => ({ cls, def })));
}

// ── Resumo de pendências ──────────────────────────────────────────

export interface PowerSlotInfo { ref: PowerRef; nex: number; pick: PowerPick | null; issues: string[] }

export function powerSlots(s: OrdemState): PowerSlotInfo[] {
  const out: PowerSlotInfo[] = [];
  const actives = activePowers(s);
  for (let i = 0; i < powerSlotCount(s); i++) {
    const ap = actives.find((a) => a.source === "slot" && a.slot === i);
    out.push({ ref: i, nex: POWER_NEX[i], pick: s.powers[i] ?? null, issues: ap ? fullPowerIssues(s, ap) : [] });
  }
  return out;
}

/** Pendências de um poder de classe, incluindo o poder paranormal do Transcender. */
export function fullPowerIssues(s: OrdemState, ap: ActivePower): string[] {
  const issues = powerIssues(s, ap);
  if (ap.def?.special === "transcender" && ap.pick.para) {
    paraIssues(s, { pick: ap.pick.para, nex: ap.nex }).forEach((i) => issues.push(`${paranormalIndex.get(ap.pick.para!.id)?.name}: ${i}`));
  }
  return issues;
}

export function allParaIssues(s: OrdemState): { ap: ActivePara; issues: string[] }[] {
  return activeParas(s).map((ap) => ({ ap, issues: paraIssues(s, ap) }));
}

export function versatilityIssues(s: OrdemState): string[] {
  if (!hasVersatility(s)) return [];
  const v = s.versatility;
  if (!v) return ["escolha um poder ou uma trilha"];
  if (v.kind === "trail") {
    if (!v.trail) return ["escolha a trilha"];
    if (v.trail === s.trail) return ["escolha uma trilha diferente da sua"];
    return [];
  }
  if (!v.pick) return ["escolha o poder"];
  const ap = activePowers(s).find((p) => p.source === "versatility");
  return ap ? fullPowerIssues(s, ap) : [];
}

export function nexReachedForAffinity(s: OrdemState): boolean {
  return nexOf(s) >= 50;
}
