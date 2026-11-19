// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Etapas do criador ("Passo a passo para criar seu
//  agente", Capítulo 1) e o status de cada uma.
// ══════════════════════════════════════════════════════════════════

import { ATTRS, attrInfo, elementLabel } from "./data/elements";
import { CLASSES } from "./data/classes";
import { originIndex } from "./data/origins";
import { paranormalIndex } from "./data/paranormal";
import { SKILLS } from "./data/skills";
import {
  activeParas, attrFinal, attrIncreaseSlots, currentTrail, grauSlotCount, hasVersatility, nexOf, peLimit, pointsLeft,
  powerSlotCount, versatilityTrail,
} from "./core";
import { allParaIssues, powerSlots, versatilityIssues } from "./powers";
import { canCastRituals, knownRituals, matchRituals, ritualDT, ritualSlots } from "./magic";
import { classSkills, diceText, freeSkillTotal, freeSkillsUsed, grauCount, originSkills, simulateTraining, skillLine } from "./training";
import { carryCapacity, currentDefense, currentPE, currentPV, currentSAN, proficiencies, resistances } from "./stats";
import { GRADES } from "./data/elements";
import type { OrdemState } from "./state";

export const STEPS = [
  { key: "conceito", label: "Conceito" },
  { key: "atributos", label: "Atributos" },
  { key: "origem", label: "Origem" },
  { key: "classe", label: "Classe & NEX" },
  { key: "pericias", label: "Perícias" },
  { key: "poderes", label: "Poderes" },
  { key: "rituais", label: "Rituais" },
  { key: "ficha", label: "Ficha final" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
export const CORE_STEPS = STEPS.slice(0, 7);
export const isStepKey = (k: unknown): k is StepKey => STEPS.some((s) => s.key === k);

export type StepState = "todo" | "partial" | "done" | "warn";
export interface Status { state: StepState; text: string }

// ── Pendências de cada etapa ──────────────────────────────────────

export function originPending(s: OrdemState): string[] {
  if (!s.origin) return ["Escolha uma origem"];
  const out: string[] = [];
  if (s.origin === "amnesico" && s.originSkills.length < 2) out.push("Escolha as duas perícias do Amnésico");
  if (s.origin === "cultista-arrependido") {
    if (!s.originPara) out.push("Escolha o poder paranormal de Traços do Outro Lado");
    else {
      const issue = allParaIssues(s).find((x) => x.ap.source === "origin");
      if (issue?.issues.length) out.push(`${paranormalIndex.get(s.originPara.id)?.name}: ${issue.issues[0]}`);
    }
  }
  return out;
}

export function skillsPending(s: OrdemState): string[] {
  if (!s.classKey) return ["Escolha uma classe"];
  const out: string[] = [];
  const cls = CLASSES[s.classKey];
  if (cls.skillGroups.length && s.classSkills.filter(Boolean).length < cls.skillGroups.length) out.push("Escolha as perícias de classe");
  const used = freeSkillsUsed(s).length, total = freeSkillTotal(s);
  if (used < total) out.push(`Escolha mais ${total - used} perícia${total - used > 1 ? "s" : ""}`);
  if (s.classKey === "especialista" && s.perito.length < 2) out.push("Escolha as duas perícias de Perito");
  for (let i = 0; i < grauSlotCount(s); i++) {
    if (s.grau[i].length < grauCount(s)) out.push(`Grau de Treinamento (NEX ${i ? 70 : 35}%): ${s.grau[i].length}/${grauCount(s)}`);
  }
  return out;
}

export function skillsWarnings(s: OrdemState): string[] {
  const out = simulateTraining(s).issues.map((i) => `${i.skill}: ${i.reason} (${i.source})`);
  if (freeSkillsUsed(s).length > freeSkillTotal(s)) out.push("Perícias além do limite");
  if (s.classKey === "especialista") {
    const g = simulateTraining(s).grade;
    s.perito.filter((k) => !g.get(k)).forEach((k) => out.push(`Perito: ${k} não é treinada`));
  }
  return out;
}

export function powersPending(s: OrdemState): { pending: string[]; warnings: string[] } {
  const pending: string[] = [], warnings: string[] = [];
  const inc = attrIncreaseSlots(s);
  const filledInc = s.attrIncreases.slice(0, inc).filter(Boolean).length;
  if (filledInc < inc) pending.push(`Aumento de atributo: ${filledInc}/${inc}`);
  powerSlots(s).forEach((p) => {
    if (!p.pick) pending.push(`Poder de NEX ${p.nex}%`);
    else if (p.issues.length) (p.issues.some((i) => i.startsWith("escolha")) ? pending : warnings).push(`NEX ${p.nex}%: ${p.issues[0]}`);
  });
  if (hasVersatility(s)) {
    const v = versatilityIssues(s);
    if (v.length) (v[0].startsWith("escolha") ? pending : warnings).push(`Versatilidade: ${v[0]}`);
    if (!s.affinity) pending.push("Escolha o elemento de afinidade (NEX 50%)");
  }
  return { pending, warnings };
}

export function trailPending(s: OrdemState): string | null {
  if (!s.classKey || nexOf(s) < 10) return null;
  if (!currentTrail(s)) return "Escolha a trilha";
  const t = currentTrail(s)!;
  if (t.requires && !simulateTraining(s).grade.get(t.requires.trained)) return `${t.label} exige treinamento em ${t.requires.trained}`;
  return null;
}

export function stepStatus(s: OrdemState, key: StepKey): Status {
  switch (key) {
    case "conceito":
      if (s.name.trim() && s.concept.trim()) return { state: "done", text: s.name.trim() };
      return s.name.trim() || s.concept.trim() ? { state: "partial", text: s.name.trim() || "Sem nome" } : { state: "todo", text: "Nome e conceito" };
    case "atributos": {
      const left = pointsLeft(s);
      if (left === 0) return { state: "done", text: "4/4 pontos" };
      if (left < 0) return { state: "warn", text: "Acima do limite" };
      return { state: left < 4 || ATTRS.some((a) => s.attrs[a.key] !== 1) ? "partial" : "todo", text: `${left} pt${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}` };
    }
    case "origem": {
      if (!s.origin) return { state: "todo", text: "Pendente" };
      const p = originPending(s);
      return p.length ? { state: "partial", text: "Escolhas pendentes" } : { state: "done", text: originIndex.get(s.origin)!.label };
    }
    case "classe": {
      if (!s.classKey) return { state: "todo", text: "Pendente" };
      const t = trailPending(s);
      if (t) return { state: t.startsWith("Escolha") ? "partial" : "warn", text: t.startsWith("Escolha") ? "Escolha a trilha" : "Requisito da trilha" };
      return { state: "done", text: `${CLASSES[s.classKey].label} · NEX ${nexOf(s)}%` };
    }
    case "pericias": {
      if (!s.classKey) return { state: "todo", text: "Requer classe" };
      if (skillsWarnings(s).length) return { state: "warn", text: "Revise" };
      const p = skillsPending(s);
      const used = freeSkillsUsed(s).length + classSkills(s).length + originSkills(s).length;
      return p.length ? { state: used ? "partial" : "todo", text: p[0].startsWith("Escolha mais") ? p[0].replace("Escolha mais ", "Faltam ") : "Escolhas pendentes" } : { state: "done", text: "Completo" };
    }
    case "poderes": {
      if (!s.classKey) return { state: "todo", text: "Requer classe" };
      const { pending, warnings } = powersPending(s);
      const paraWarn = allParaIssues(s).some((x) => x.ap.source === "origin" && x.issues.length && !x.issues[0].startsWith("escolha"));
      if (warnings.length || paraWarn) return { state: "warn", text: "Requisito pendente" };
      if (!attrIncreaseSlots(s) && !powerSlotCount(s) && !hasVersatility(s)) return { state: "done", text: "Nenhum neste NEX" };
      return pending.length ? { state: "partial", text: `${pending.length} pendente${pending.length > 1 ? "s" : ""}` } : { state: "done", text: "Completo" };
    }
    case "rituais": {
      if (!s.classKey) return { state: "todo", text: "Requer classe" };
      const slots = ritualSlots(s).length;
      if (!slots) return { state: "done", text: knownRituals(s).length ? `${knownRituals(s).length} conhecido${knownRituals(s).length > 1 ? "s" : ""}` : "Nenhum" };
      const m = matchRituals(s);
      if (m.slotOf.some((x) => x === null)) return { state: "warn", text: "Ritual sem vaga" };
      const used = m.slotOf.length;
      return { state: used === slots ? "done" : used ? "partial" : "todo", text: `${used}/${slots}` };
    }
    case "ficha":
      return sheetReady(s) ? { state: "done", text: "Pronta" } : { state: "todo", text: "Incompleta" };
  }
}

export const sheetReady = (s: OrdemState): boolean => pointsLeft(s) === 0 && !!s.origin && !!s.classKey;

/** Ficha em texto simples (botão "Copiar texto"). Requer sheetReady. */
export function sheetText(s: OrdemState): string {
  const cls = CLASSES[s.classKey!], origin = originIndex.get(s.origin!)!;
  const trail = currentTrail(s), vt = versatilityTrail(s);
  const { grade } = simulateTraining(s);
  const trained = SKILLS.filter((k) => (grade.get(k.name) ?? 0) > 0);
  const lines = [
    `${s.name || "Agente sem nome"} — ${cls.label}${trail ? ` (${trail.label})` : ""} · NEX ${nexOf(s)}%`,
    `${origin.label}${s.concept ? ` · ${s.concept}` : ""}`,
    `PV ${currentPV(s)} · PE ${currentPE(s)} (limite ${peLimit(s)}/turno) · SAN ${currentSAN(s)} · Defesa ${currentDefense(s)} · Deslocamento 9m · Carga ${carryCapacity(s)} espaços`,
    "",
    "ATRIBUTOS",
    ATTRS.map((a) => `${attrInfo(a.key).abbr} ${attrFinal(s, a.key)}`).join(" · "),
    "",
    "PERÍCIAS TREINADAS",
    ...(trained.length ? trained.map((k) => {
      const l = skillLine(s, k.name, grade.get(k.name));
      const prof = k.name === "Profissão" && s.profession ? ` (${s.profession})` : "";
      return `${k.name}${prof} [${GRADES[l.grade].label}]: ${diceText(l.dice, l.bonus)}`;
    }) : ["—"]),
    "",
    "PODERES",
    `Origem — ${origin.power.name}`,
    ...[...(trail ? trail.abilities.filter((a) => a.nex <= nexOf(s)) : []), ...(vt ? [vt.abilities[0]] : [])].map((a) => `Trilha — ${a.name}`),
    ...powerSlots(s).filter((p) => p.pick).map((p) => {
      const def = CLASSES[s.classKey!].powers.find((x) => x.id === p.pick!.id);
      return `NEX ${p.nex}% — ${def?.name ?? p.pick!.id}`;
    }),
    ...activeParas(s).map((p) => `Paranormal — ${paranormalIndex.get(p.pick.id)?.name}${p.pick.element ? ` (${elementLabel(p.pick.element)})` : ""}${p.pick.id === "aprender-ritual" && p.pick.choice ? `: ${p.pick.choice}` : ""}`),
    ...(s.affinity ? [`Afinidade: ${elementLabel(s.affinity)}`] : []),
    "",
    `Proficiências: ${proficiencies(s).join(", ")}`,
    ...(resistances(s).length ? [`Resistências: ${resistances(s).join("; ")}`] : []),
  ];
  if (canCastRituals(s)) {
    lines.push("", `RITUAIS (DT ${ritualDT(s)})`);
    knownRituals(s).forEach((r) => lines.push(`${r.def.circle}º · ${r.def.name}${r.element ? ` (${elementLabel(r.element)})` : ""}`));
  }
  return lines.join("\n");
}
