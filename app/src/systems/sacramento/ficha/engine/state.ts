// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Estado da ficha
//  Formato salvo em localStorage["sacramento-ficha-v1"] e nos arquivos exportados.
// ══════════════════════════════════════════════════════════════════

import { ANTECEDENTS, ATTRS, MAX_LEVEL, type Antecedent, type Attr } from "./data/core";
import { isSkillKey } from "./data/skills";
import { CUSTOM_TRAIL, isTrailKey, trailIndex } from "./data/redemption";
import { isItemKey } from "./data/equipment";

export interface Mount {
  enabled: boolean;
  name: string;
  kind: string;
  potencia: number;
  resistencia: number;
  fidelidade: number;
  /** Atributos escolhidos nos bônus de Fidelidade 2 e 5. */
  fidelityBonus: ("potencia" | "resistencia" | null)[];
}

export interface Redemption {
  trail: string | null;
  premise: string;
  steps: string[];
  done: boolean[];
}

export interface Details {
  aparencia: string;
  historia: string;
  notas: string;
}

export interface SacramentoState {
  name: string;
  concept: string;
  details: Details;
  level: number;
  xp: number;
  attrs: Record<Attr, number>;
  antecedents: Record<Antecedent, number>;
  /** Habilidades escolhidas (Parrudeza pode repetir). */
  skills: string[];
  redemption: Redemption;
  mount: Mount;
  /** Itens comprados: chave → quantidade. */
  items: Record<string, number>;
  /** Dinheiro extra (ganho em jogo) somado aos $200 iniciais. */
  extraMoney: number;
}

export const blankMount = (): Mount => ({
  enabled: false, name: "", kind: "Cavalo", potencia: 0, resistencia: 0, fidelidade: 0, fidelityBonus: [null, null],
});

export function blankState(): SacramentoState {
  return {
    name: "",
    concept: "",
    details: { aparencia: "", historia: "", notas: "" },
    level: 1,
    xp: 0,
    attrs: Object.fromEntries(ATTRS.map((a) => [a.key, 0])) as Record<Attr, number>,
    antecedents: Object.fromEntries(ANTECEDENTS.map((a) => [a.key, 0])) as Record<Antecedent, number>,
    skills: [],
    redemption: { trail: null, premise: "", steps: ["", "", "", "", "", ""], done: [false, false, false, false, false, false] },
    mount: blankMount(),
    items: {},
    extraMoney: 0,
  };
}

// ── Restauração de fichas salvas/importadas ───────────────────────

type Raw = Record<string, unknown>;
const isObj = (x: unknown): x is Raw => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown, max = 3000) => (typeof x === "string" ? x.slice(0, max) : "");
const int = (x: unknown, min: number, max: number, fb: number) =>
  Number.isInteger(x) && (x as number) >= min && (x as number) <= max ? (x as number) : fb;

/** Restaura um estado salvo/importado, descartando campos inválidos. */
export function sanitizeState(input: unknown): SacramentoState {
  const s = blankState();
  if (!isObj(input)) return s;
  const raw = input;
  s.name = str(raw.name, 60);
  s.concept = str(raw.concept, 300);
  if (isObj(raw.details)) (Object.keys(s.details) as (keyof Details)[]).forEach((k) => { s.details[k] = str((raw.details as Raw)[k]); });
  s.level = int(raw.level, 1, MAX_LEVEL, 1);
  s.xp = int(raw.xp, 0, 9999, 0);
  if (isObj(raw.attrs)) ATTRS.forEach((a) => { s.attrs[a.key] = int((raw.attrs as Raw)[a.key], 0, 10, 0); });
  if (isObj(raw.antecedents)) ANTECEDENTS.forEach((a) => { s.antecedents[a.key] = int((raw.antecedents as Raw)[a.key], 0, 5, 0); });
  if (Array.isArray(raw.skills)) s.skills = raw.skills.filter(isSkillKey).slice(0, 12);
  if (isObj(raw.redemption)) {
    const r = raw.redemption;
    if (isTrailKey(r.trail)) s.redemption.trail = r.trail;
    s.redemption.premise = str(r.premise, 500);
    if (Array.isArray(r.steps)) s.redemption.steps = [0, 1, 2, 3, 4, 5].map((i) => str((r.steps as unknown[])[i], 500));
    if (Array.isArray(r.done)) s.redemption.done = [0, 1, 2, 3, 4, 5].map((i) => (r.done as unknown[])[i] === true);
    if (s.redemption.trail && s.redemption.trail !== CUSTOM_TRAIL && !s.redemption.premise) {
      const t = trailIndex.get(s.redemption.trail)!;
      s.redemption.premise = t.premise;
      s.redemption.steps = [...t.steps];
    }
  }
  if (isObj(raw.mount)) {
    const m = raw.mount;
    s.mount.enabled = m.enabled === true;
    s.mount.name = str(m.name, 60);
    s.mount.kind = str(m.kind, 40) || "Cavalo";
    s.mount.potencia = int(m.potencia, 0, 3, 0);
    s.mount.resistencia = int(m.resistencia, 0, 3, 0);
    if (s.mount.potencia + s.mount.resistencia > 3) { s.mount.potencia = 0; s.mount.resistencia = 0; }
    s.mount.fidelidade = int(m.fidelidade, 0, 5, 0);
    if (Array.isArray(m.fidelityBonus)) {
      s.mount.fidelityBonus = [0, 1].map((i) => {
        const v = (m.fidelityBonus as unknown[])[i];
        return v === "potencia" || v === "resistencia" ? v : null;
      });
    }
  }
  if (isObj(raw.items)) {
    Object.entries(raw.items).forEach(([k, v]) => { if (isItemKey(k) && Number.isInteger(v) && (v as number) > 0) s.items[k] = Math.min(99, v as number); });
  }
  s.extraMoney = typeof raw.extraMoney === "number" && raw.extraMoney >= 0 ? Math.min(1e6, Math.round(raw.extraMoney * 100) / 100) : 0;
  return s;
}
