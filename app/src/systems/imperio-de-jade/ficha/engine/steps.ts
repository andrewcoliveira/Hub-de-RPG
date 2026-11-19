// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Etapas do criador de fichas e o status de cada uma
// ══════════════════════════════════════════════════════════════════

import { ABILITIES, RACES, abilityMod, fmtMod } from "./data/races";
import { CLASSES } from "./data/classes";
import {
  assignedCount, classAbilities, finalValueFor, honorTier, pointsLeft, pointsSpent,
  raceChoicesComplete, sheetReady, skillBonus, skillSlotCount,
} from "./rules";
import { checkPrerequisitos, freeSlotCount, grantedTalents, talentIndex, usedFreeSlots } from "./talents";
import { currentBBA, currentDefenses, currentPM, currentPV } from "./stats";
import type { JadeState } from "./state";

export const STEPS = [
  { key: "atributos", label: "Atributos" },
  { key: "raca", label: "Raça" },
  { key: "classe", label: "Classe & Nível" },
  { key: "pericias", label: "Perícias" },
  { key: "talentos", label: "Talentos" },
  { key: "ficha", label: "Ficha final" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];
export const CORE_STEPS = STEPS.slice(0, 5);
export const isStepKey = (k: unknown): k is StepKey => STEPS.some((s) => s.key === k);

export type StepState = "todo" | "partial" | "done" | "warn";

export function stepStatus(s: JadeState, key: StepKey): { state: StepState; text: string } {
  switch (key) {
    case "atributos": {
      if (s.mode === "roll") {
        if (!s.rolls.length) return { state: "todo", text: "Role os dados" };
        const n = assignedCount(s);
        return n === 7 ? { state: "done", text: "Completo" } : { state: "partial", text: `${n}/7 atribuídos` };
      }
      const left = pointsLeft(s);
      if (left === 0) return { state: "done", text: "24/24 pontos" };
      if (left < 0) return { state: "warn", text: "Acima do limite" };
      return { state: pointsSpent(s) > 0 ? "partial" : "todo", text: `${left} pts restantes` };
    }
    case "raca":
      if (!s.race) return { state: "todo", text: "Pendente" };
      if (!raceChoicesComplete(s)) return { state: "partial", text: "Escolha os bônus" };
      return { state: "done", text: RACES[s.race].label };
    case "classe":
      if (!s.classKey) return { state: "todo", text: "Pendente" };
      return { state: "done", text: `${CLASSES[s.classKey].label} · ${s.level}º` };
    case "pericias": {
      if (!s.classKey) return { state: "todo", text: "Requer classe" };
      const used = s.selectedSkills.length, slots = skillSlotCount(s);
      if (used > slots) return { state: "warn", text: `${used}/${slots} — excesso` };
      return { state: used === slots ? "done" : used ? "partial" : "todo", text: `${used}/${slots}` };
    }
    case "talentos": {
      const used = usedFreeSlots(s), free = freeSlotCount(s);
      if (used > free) return { state: "warn", text: `${used}/${free} — excesso` };
      const unmet = s.selectedTalents.some((t) => {
        const info = talentIndex.get(t.name);
        return info && !checkPrerequisitos(s, info.prereqs, t.name).met;
      });
      if (unmet) return { state: "warn", text: "Requisito pendente" };
      return { state: used === free ? "done" : used ? "partial" : "todo", text: `${used}/${free}` };
    }
    case "ficha":
      return sheetReady(s) ? { state: "done", text: "Pronta" } : { state: "todo", text: "Incompleta" };
  }
}

/** Ficha em texto simples (botão "Copiar texto"). Requer sheetReady. */
export function sheetText(s: JadeState): string {
  const race = RACES[s.race!], cls = CLASSES[s.classKey!];
  const pv = currentPV(s)!;
  const hon = finalValueFor(s, "hon");
  const d = currentDefenses(s);
  return [
    `${s.name || "Personagem sem nome"} — ${race.label} ${cls.label} ${s.level}º nível`,
    `PV ${pv.value} · PM ${currentPM(s)} · BBA +${currentBBA(s)} · Honra ${hon} (${honorTier(hon)})`,
    `CA ${d.ca} · Fortitude ${fmtMod(d.fort)} · Reflexos ${fmtMod(d.ref)} · Vontade ${fmtMod(d.von)} (sem armadura)`,
    "",
    "ATRIBUTOS",
    ...ABILITIES.map((a) => { const v = finalValueFor(s, a.key)!; return `${a.label}: ${v} (${fmtMod(abilityMod(v))})`; }),
    "",
    "PERÍCIAS TREINADAS",
    ...(s.selectedSkills.length
      ? s.selectedSkills.map((x) => `${x.name}${x.specialty ? ` (${x.specialty})` : ""}: ${fmtMod(skillBonus(s, x.name, true)!)}`)
      : ["—"]),
    "",
    "TALENTOS",
    `Iniciais: ${cls.talentos_iniciais}`,
    ...(grantedTalents(s).size ? [`Concedidos: ${[...grantedTalents(s).keys()].join(", ")}`] : []),
    ...s.selectedTalents.map((t) => `• ${t.name}`),
    "",
    "HABILIDADES DE CLASSE",
    ...classAbilities(s).gained.map((a) => `• ${a.name}`),
  ].join("\n");
}
