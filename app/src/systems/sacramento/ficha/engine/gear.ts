// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Compra de equipamento e espaço na mochila
//  Começa com $200; a primeira compra usa o preço máximo.
// ══════════════════════════════════════════════════════════════════

import { BACKPACK_LINES, CARRIED_WEAPONS, ITEMS, STARTING_MONEY, itemIndex, type Damage, type ItemDef } from "./data/equipment";
import type { SacramentoState } from "./state";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Itens comuns têm 25% de desconto com Sorrisão, Chapéu na Mão (não vale para os raros do Estrangeiro). */
export const hasDiscount = (s: SacramentoState, item: ItemDef): boolean =>
  s.skills.includes("sorrisao-chapeu-na-mao") && item.cat !== "estrangeiro";

export const itemPrice = (s: SacramentoState, item: ItemDef): number =>
  round2(item.max * (hasDiscount(s, item) ? 0.75 : 1));

export const canBuy = (item: ItemDef): boolean => item.forSale !== false;

export interface OwnedItem { def: ItemDef; qty: number }

export function ownedItems(s: SacramentoState): OwnedItem[] {
  return Object.entries(s.items)
    .map(([k, qty]) => ({ def: itemIndex.get(k)!, qty }))
    .filter((x) => x.def && x.qty > 0)
    .sort((a, b) => ITEMS.indexOf(a.def) - ITEMS.indexOf(b.def));
}

export const totalMoney = (s: SacramentoState): number => round2(STARTING_MONEY + s.extraMoney);
export const moneySpent = (s: SacramentoState): number =>
  round2(ownedItems(s).reduce((t, x) => t + x.qty * itemPrice(s, x.def), 0));
export const moneyLeft = (s: SacramentoState): number => round2(totalMoney(s) - moneySpent(s));

export function setQty(d: SacramentoState, key: string, qty: number): void {
  const item = itemIndex.get(key);
  if (!item || !canBuy(item)) return;
  const q = Math.max(0, Math.min(99, Math.floor(qty)));
  if (q) d.items[key] = q;
  else delete d.items[key];
}

// ── Armas portadas e espaço ───────────────────────────────────────

const isWeapon = (i: ItemDef) => (i.cat === "armas" || i.cat === "estrangeiro") && !!i.damage && !i.name.startsWith("Explosivos");
const isKnife = (i: ItemDef) => i.name === "Faca";

export interface Packing {
  /** Armas em coldres, bandoleiras e bainhas (não ocupam a mochila). */
  carried: string[];
  /** Linhas ocupadas e capacidade. */
  used: number;
  capacity: number;
  /** Linhas por item (para a tabela). */
  lines: Map<string, number>;
}

/** Linhas que `qty` unidades de um item ocupam (sem contar armas portadas). */
export function linesFor(item: ItemDef, qty: number): number {
  if (!item.space || !qty) return 0;
  if (item.stack) return Math.ceil(qty / item.stack) * item.space;
  return qty * item.space;
}

export function packing(s: SacramentoState): Packing {
  const owned = ownedItems(s);
  const lines = new Map<string, number>();
  const carried: string[] = [];

  // Armas: uma faca e mais até 4 armas vão no corpo; as que sobram vão na mochila.
  const weapons: { def: ItemDef }[] = [];
  owned.forEach((x) => { if (isWeapon(x.def)) for (let i = 0; i < x.qty; i++) weapons.push({ def: x.def }); });
  let knifeFree = true;
  const rest = weapons.filter((w) => {
    if (knifeFree && isKnife(w.def)) { knifeFree = false; carried.push(w.def.name); return false; }
    return true;
  });
  // as maiores primeiro no corpo, para poupar a mochila
  rest.sort((a, b) => b.def.space - a.def.space);
  rest.forEach((w, i) => {
    if (i < CARRIED_WEAPONS) carried.push(w.def.name);
    else lines.set(w.def.key, (lines.get(w.def.key) ?? 0) + (w.def.space || 0.5));
  });

  owned.forEach((x) => { if (!isWeapon(x.def)) lines.set(x.def.key, linesFor(x.def, x.qty)); });

  const has = (name: string) => owned.find((x) => x.def.name === name)?.qty ?? 0;
  const capacity = BACKPACK_LINES
    + (s.mount.enabled ? Math.min(has("Bolsa de montaria"), 1) * 10 : 0)
    + has("Carroça") * 30 + has("Carro") * 20;
  const used = [...lines.values()].reduce((t, v) => t + v, 0);
  return { carried, used, capacity, lines };
}

/** "1 Vida", "2 Dor + veneno"… */
export function damageText(d?: Damage): string {
  if (!d) return "—";
  const parts = [d.vida ? `${d.vida} Vida` : "", d.dor ? `${d.dor} Dor` : ""].filter(Boolean).join(" + ");
  return [parts, d.note].filter(Boolean).join(" ");
}

export const fmtMoney = (n: number): string =>
  `$${Number.isInteger(n) ? n : n.toFixed(2).replace(".", ",")}`;

export const fmtLines = (n: number): string => {
  if (!n) return "—";
  const whole = Math.floor(n), half = n - whole >= 0.5;
  return `${whole ? whole : ""}${half ? "½" : ""} linha${n > 1 ? "s" : ""}`;
};
