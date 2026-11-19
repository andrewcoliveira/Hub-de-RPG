// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Estatísticas derivadas: BBA, PV, PM, CA e resistências
// ══════════════════════════════════════════════════════════════════

import { ABILITIES, abilityMod, type AbilityKey } from "./data/races";
import { CLASSES, type ClassKey } from "./data/classes";
import { finalValueFor, modOf } from "./rules";
import { talentCount } from "./talents";
import type { JadeState } from "./state";

export function currentBBA(s: JadeState): number | null {
  return s.classKey ? CLASSES[s.classKey].tabela[s.level - 1].bba : null;
}

/** `partial` = Constituição ainda não definida (PV sem o modificador). */
export function currentPV(s: JadeState): { value: number; partial: boolean } | null {
  if (!s.classKey) return null;
  const cls = CLASSES[s.classKey];
  const lvl = s.level;
  const con = finalValueFor(s, "con");
  if (con === null) return { value: cls.pv_base + cls.pv_nivel * (lvl - 1), partial: true };
  const conMod = abilityMod(con);
  const vit = talentCount(s, "Vitalidade") * lvl; // Vitalidade: +1 PV por nível (cumulativo)
  return { value: cls.pv_base + conMod + (lvl - 1) * (cls.pv_nivel + conMod) + vit, partial: false };
}

// Habilidades de classe que somam o bônus de uma habilidade ao total de PM
// (abrir/elevar o chacra correspondente). O shugenja escolhe Sabedoria ou Honra.
const CLASS_PM_CHACRAS: Partial<Record<ClassKey, { levels: number[]; attr: (s: JadeState) => AbilityKey }>> = {
  wujen: { levels: [1, 3, 6, 10, 15], attr: () => "int" },   // aprendiz/discípulo/iniciado/adepto/mestre da mente
  shinkan: { levels: [3, 6, 10, 15], attr: () => "sab" },    // discípulo/iniciado/adepto/mestre dos espíritos
  shugenja: { levels: [3, 6, 10, 15], attr: (s) => (s.pmChoice === "hon" ? "hon" : "sab") },
};

/** Parcelas do total de PM. */
export function pmBreakdown(s: JadeState): { label: string; value: number }[] {
  if (!s.classKey) return [];
  const cls = CLASSES[s.classKey];
  const abbr = (k: AbilityKey) => ABILITIES.find((a) => a.key === k)!.abbr;
  const parts = [{ label: `${cls.label} ${s.level}º nível`, value: cls.pm_base + cls.pm_nivel * (s.level - 1) }];
  if (s.race === "hanyo") parts.push({ label: "Car (brincar com os sentimentos)", value: modOf(s, "car") });
  const ch = CLASS_PM_CHACRAS[s.classKey];
  if (ch) {
    const times = ch.levels.filter((l) => l <= s.level).length;
    if (times) {
      const k = ch.attr(s);
      parts.push({ label: `${abbr(k)} ×${times} (habilidades de classe)`, value: modOf(s, k) * times });
    }
  }
  return parts;
}

export function currentPM(s: JadeState): number | null {
  if (!s.classKey) return null;
  return Math.max(0, pmBreakdown(s).reduce((t, p) => t + p.value, 0));
}

/**
 * CA e resistências: metade do nível + modificador (Capítulo 1, "Benefícios por
 * Nível"), mais traços raciais e talentos. Sem armadura, escudo nem habilidades de classe.
 */
export function currentDefenses(s: JadeState) {
  const half = Math.floor(s.level / 2);
  const raceSave = s.race === "ryuujin" ? 2 : 0; // sorte ancestral
  return {
    ca: 10 + half + modOf(s, "des") + (s.race === "nezumi" ? 1 : 0) + talentCount(s, "Esquiva"),
    fort: half + modOf(s, "con") + raceSave + 2 * talentCount(s, "Fortitude Maior"),
    ref: half + modOf(s, "des") + raceSave + 2 * talentCount(s, "Reflexos Rápidos"),
    von: half + modOf(s, "sab") + raceSave + 2 * talentCount(s, "Vontade de Ferro"),
  };
}
