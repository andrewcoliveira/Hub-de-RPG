// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Gerador de recompensas (núcleo puro)
//  Capítulo 8, "Tesouro em Combate" e "Itens Mágicos". Sem DOM e sem estado
//  global: cada geração recebe um gerador de números (rng) e devolve o
//  resultado com o passo a passo de todas as rolagens.
// ══════════════════════════════════════════════════════════════════

import {
  TABLES,
  type Action,
  type EquipDict,
  type GearRoll,
  type PriceFormula,
  type RareDict,
  type Table,
  type Tier,
} from "./tables";

export type Rng = () => number;

export type LogStep =
  | { type: "d100"; roll: number; label: string; result: string }
  | { type: "formula"; expression: string; result: number; label: string };

export interface CashEntry { amount: number; symbol: string; goods?: boolean }

export interface Reward {
  nd: string;
  creatures: number;
  treasure: number;
  /** Quantos tesouros foram rolados (criaturas × tesouro). */
  times: number;
  riches: string | null;
  equip: string | null;
  richesItems: string[];
  equipItems: string[];
  richesLog: LogStep[];
  equipLog: LogStep[];
  cash: CashEntry[];
  equipCount: number;
}

interface Ctx { rng: Rng; log: LogStep[]; cash: CashEntry[] }

// ── Utilidades ────────────────────────────────────────────────────

const die = (ctx: Ctx, sides: number) => Math.floor(ctx.rng() * sides) + 1;

function rollDice(ctx: Ctx, rolls: number, sides: number): number {
  let sum = 0;
  for (let i = 0; i < rolls; i++) sum += die(ctx, sides);
  return sum;
}

export const formatNumber = (n: number) => Number(n).toLocaleString("pt-BR");
export const formatPrice = (price: number) => `${formatNumber(price)} ¥o`;

const DICT_LABELS: Record<EquipDict, string> = { weapons: "Arma", armors: "Armadura", items: "Item diverso", clothings: "Vestimenta" };
export const TIER_LABEL: Record<Tier, string> = { menor: "menor", medio: "médio", maior: "maior" };

/** Texto curto de um resultado de tabela, para o passo a passo. */
export function describeTableResult(value: unknown): string {
  if (!value || value === "-") return "Nenhum item";
  if (typeof value === "string") return value;
  const v = value as Record<string, unknown>;
  if (v.examples) {
    const p = v.price as PriceFormula;
    const expr = typeof p === "number" ? `${p} ¥o` : `${p.rolls}d${p.die}${(p.mult ?? 1) > 1 ? ` × ${p.mult}` : ""} ¥o`;
    return `Faixa: ${expr}`;
  }
  if (v.name !== undefined && v.price !== undefined) return `${v.name} (${formatPrice(v.price as number)})`;
  if (v.name !== undefined && v.bonus_equiv !== undefined) return `${v.name} (equiv. +${v.bonus_equiv})`;
  switch (v.type) {
    case "equipment": {
      const base = DICT_LABELS[v.dict as EquipDict] ?? String(v.dict);
      if (v.special) return `${base} de material especial`;
      if (v.masterwork) return `${base} obra-prima`;
      return v.dict === "clothings" ? "Vestimenta (role novamente)" : base;
    }
    case "magic_item": return `Item mágico ${TIER_LABEL[v.tier as Tier]}`;
    case "magic_item_type": {
      const cats: Record<string, string> = { armas: "Armas", armaduras: "Armaduras", ofuda: "Ofuda", amuletos: "Amuletos", acessorios: "Acessórios" };
      return cats[v.category as string] ?? String(v.category);
    }
    case "riches": {
      const [rolls, sides, mod, mult, symbol] = v.args as [number, number, number, number, string];
      const dice = mod ? `(${rolls}d${sides} + ${mod})` : `${rolls}d${sides}`;
      return `${dice} × ${formatNumber(mult)} ${symbol}`;
    }
    case "rare": {
      const [rolls, sides, mod] = v.args as [number, number, number];
      const qty = rolls === 1 && sides === 1 ? String(1 + mod) : `${rolls}d${sides}${mod ? ` + ${mod}` : ""}`;
      return `${qty} ${v.dict === "gems" ? "gema(s)" : "obra(s) de arte"}`;
    }
    case "magic_bonus": return `Bônus +${v.bonus}`;
    case "special_power": return "Poder especial (e role novamente)";
    case "specific": return "Item específico";
    case "jutsu": return `Jutsu ${v.tier === "basic" ? "básico" : "mediano"} (${formatPrice(v.price as number)})`;
    default: return String(v.type);
  }
}

/** Rola d% numa tabela e registra o passo. */
export function rollFromTable<T>(ctx: Ctx, table: Table<T>, label: string): T | null {
  const roll = die(ctx, 100);
  for (const [threshold, value] of table) {
    if (roll <= threshold) {
      ctx.log.push({ type: "d100", roll, label, result: describeTableResult(value) });
      return value;
    }
  }
  return null;
}

function resolvePriceFormula(ctx: Ctx, formula: PriceFormula, context = ""): number {
  if (typeof formula === "number") return formula;
  const { rolls, die: sides, mult = 1 } = formula;
  const result = rollDice(ctx, rolls, sides) * mult;
  const expression = `${rolls}d${sides}${mult > 1 ? ` × ${formatNumber(mult)}` : ""}`;
  ctx.log.push({ type: "formula", expression, result, label: context ? `Valor: ${context}` : "Valor" });
  return result;
}

// ── Equipamento mundano ───────────────────────────────────────────

// "Armas e armaduras mundanas têm 30% de chance de serem Pequenas, 60% de serem
//  Médias, e 10% de serem de outro tamanho, à escolha do mestre."
export const SIZE_TABLE: Table<string> = [[30, "Pequena"], [90, "Média"], [100, "outro tamanho, à escolha do mestre"]];

/** Armas de "Ataque à Distância" nas tabelas de armas do Capítulo 3. */
export const RANGED_WEAPONS = new Set([
  "Azagaia", "Besta leve", "Besta pesada", "Chakram", "Daikyu", "Flechas (x10)", "Fukiya",
  "Granada", "Hankyu", "Rede", "Shuriken (x10)", "Virotes (x10)",
]);
const AMMO = new Set(["Flechas (x10)", "Virotes (x10)", "Shuriken (x10)"]);

const BASE_LABELS: Record<EquipDict, string> = { weapons: "Arma base", armors: "Armadura base", items: "Item diverso", clothings: "Vestimenta" };

/** Item base de uma tabela de equipamento; armadura pode virar vestimenta ("jogue novamente"). */
function rollBaseItem(ctx: Ctx, dict: EquipDict): { name: string; dict: EquipDict } {
  const result = rollFromTable(ctx, TABLES.equip[dict], BASE_LABELS[dict]);
  if (result && typeof result === "object" && result.type === "equipment") return rollBaseItem(ctx, result.dict);
  return { name: typeof result === "string" ? result : "Item desconhecido", dict };
}

function equipmentGenerator(ctx: Ctx, dict: EquipDict, { special = false, masterwork = false } = {}): string {
  const base = rollBaseItem(ctx, dict);
  let name = base.name;
  if (special) {
    const material = rollFromTable(ctx, TABLES.materials, "Material especial");
    if (material) name = `${name} de ${material.toLowerCase()}`;
  } else if (masterwork) {
    name = `${name} obra-prima`;
  }
  // Tamanho só para armas e armaduras (inclui vestimentas), não itens diversos nem munição
  if (base.dict !== "items" && !AMMO.has(base.name)) {
    name = `${name} (${rollFromTable(ctx, SIZE_TABLE, `Tamanho (${base.name})`) ?? "Média"})`;
  }
  return name;
}

// ── Riquezas ──────────────────────────────────────────────────────

function richesGenerator(ctx: Ctx, [rolls, sides, modifier, mult, symbol]: [number, number, number, number, string]): string {
  const result = (rollDice(ctx, rolls, sides) + modifier) * mult;
  const dice = modifier ? `(${rolls}d${sides} + ${modifier})` : `${rolls}d${sides}`;
  ctx.log.push({ type: "formula", expression: `${dice}${mult > 1 ? ` × ${formatNumber(mult)}` : ""}`, result, label: `Valor em ${symbol}` });
  ctx.cash.push({ amount: result, symbol });
  return `${formatNumber(result)} ${symbol}`;
}

function rareItemGenerator(ctx: Ctx, [rolls, sides, modifier]: [number, number, number], dict: RareDict): string {
  const quantity = rollDice(ctx, rolls, sides) + modifier;
  const typeLabel = dict === "gems" ? "gemas" : "obras de arte";
  const singular = dict === "gems" ? "gema" : "obra de arte";
  ctx.log.push({ type: "formula", expression: `${rolls}d${sides}${modifier ? ` + ${modifier}` : ""}`, result: quantity, label: `Quantidade de ${typeLabel}` });

  const inventory = new Map<string, number[]>();
  let total = 0;
  for (let i = 0; i < quantity; i++) {
    const range = rollFromTable(ctx, TABLES.rare[dict], `Faixa de valor (${singular} ${i + 1})`);
    if (!range) continue;
    const example = range.examples[Math.floor(ctx.rng() * range.examples.length)];
    const price = resolvePriceFormula(ctx, range.price, example);
    inventory.set(example, [...(inventory.get(example) ?? []), price]);
    total += price;
  }
  if (!inventory.size) return "Nenhum item encontrado";
  if (total > 0) ctx.cash.push({ amount: total, symbol: "¥o", goods: true });
  const parts = [...inventory].map(([name, prices]) => {
    const list = prices.map(formatPrice).join(prices.length === 2 ? " e " : ", ");
    return prices.length > 1 ? `(${prices.length}x) ${name} (${list})` : `${name} (${list})`;
  });
  return `${parts.join(", ")}. Total: ${formatPrice(total)}`;
}

// ── Itens mágicos ─────────────────────────────────────────────────

// Preço somado ao item obra-prima (armas) ou mundano (armaduras), por bônus total
export const WEAPON_BONUS_PRICE: Record<number, number> = { 1: 2000, 2: 8000, 3: 18000, 4: 32000, 5: 50000, 6: 72000, 7: 98000, 8: 128000, 9: 162000, 10: 200000 };
export const ARMOR_BONUS_PRICE: Record<number, number> = { 1: 1000, 2: 4000, 3: 9000, 4: 16000, 5: 25000, 6: 36000, 7: 49000, 8: 64000, 9: 81000, 10: 100000 };
const MAX_MAGIC_BONUS = 5;   // nenhum item tem bônus mágico acima de +5
const MAX_TOTAL_BONUS = 10;  // nenhum item tem bônus total acima de +10

/** Categoria pelo bônus total: +1 a +3 menor; +4 a +6 médio; +7 a +10 maior. */
export function categoryOfTotal(total: number): string {
  if (total <= 3) return "menor";
  if (total <= 6) return "médio";
  return "maior";
}

/**
 * Arma ou armadura mágica: rola o tipo de item na tabela mundana, depois o bônus;
 * cada "poder especial" é rolado na tabela de poderes e manda rolar novamente,
 * até sair um bônus. "Item específico" no primeiro dado substitui tudo.
 */
function magicGearGenerator(ctx: Ctx, kind: "weapon" | "armor", tier: Tier): string {
  const isWeapon = kind === "weapon";
  const table = (isWeapon ? TABLES.magicWeapons : TABLES.magicArmors)[tier];
  const noun = isWeapon ? "Arma" : "Armadura";
  if (!table) return `${noun} mágica desconhecida`;

  const first = rollFromTable(ctx, table, `${noun} mágica (${TIER_LABEL[tier]})`);
  if (!first) return `${noun} mágica desconhecida`;

  if (first.type === "specific") {
    const specific = (isWeapon ? TABLES.weaponsSpecific : TABLES.armorsSpecific)[tier];
    const item = specific && rollFromTable(ctx, specific, `${noun} específica`);
    return item ? `${item.name} (${formatPrice(item.price)})` : `${noun} específica desconhecida`;
  }

  const base = rollBaseItem(ctx, isWeapon ? "weapons" : "armors");
  const ranged = isWeapon && RANGED_WEAPONS.has(base.name);
  const powerTable = (isWeapon ? (ranged ? TABLES.weaponPowersRanged : TABLES.weaponPowersMelee) : TABLES.armorPowers)[tier];

  let bonus = 0;
  const powers: { name: string; bonus_equiv: number }[] = [];
  let current: GearRoll | null = first;
  for (let guard = 0; guard < 30 && current; guard++) {
    if (current.type === "magic_bonus") { bonus = Math.min(MAX_MAGIC_BONUS, current.bonus); break; }
    if (current.type === "special_power" && powerTable) {
      const equivSoFar = powers.reduce((t, p) => t + p.bonus_equiv, 0);
      let power = null;
      for (let t = 0; t < 10 && !power; t++) {
        const p = rollFromTable(ctx, powerTable, `Poder especial${ranged ? " (à distância)" : ""}`);
        if (p && !powers.some((x) => x.name === p.name)) power = p; // poder repetido: role de novo
      }
      // o bônus total (com pelo menos +1 de bônus mágico) não passa de +10
      if (power && equivSoFar + power.bonus_equiv + 1 <= MAX_TOTAL_BONUS) powers.push(power);
    }
    // "poder especial e role novamente"; item específico numa nova rolagem é descartado
    current = rollFromTable(ctx, table, "Role novamente");
  }
  const equiv = powers.reduce((t, p) => t + p.bonus_equiv, 0);
  bonus = Math.min(Math.max(bonus, 1), MAX_TOTAL_BONUS - equiv);
  const total = bonus + equiv;

  const prices = isWeapon ? WEAPON_BONUS_PRICE : ARMOR_BONUS_PRICE;
  const powerNames = powers.map((p) => p.name.toLowerCase()).join(" ");
  const name = `${base.name}${powerNames ? ` ${powerNames}` : ""} +${bonus}`;
  const details = [...(powers.length ? [`bônus total +${total}`] : []), `item ${categoryOfTotal(total)}`];
  const priceBase = isWeapon ? "o preço da arma obra-prima" : "o preço da armadura";
  const ammo = isWeapon && AMMO.has(base.name) ? ", preço para 50 projéteis" : "";
  return `${name} (${details.join(", ")}) — +${formatPrice(prices[total])} além d${priceBase}${ammo}`;
}

function ofudaGenerator(ctx: Ctx, tier: Tier): string {
  const table = TABLES.ofuda[tier];
  const result = table && rollFromTable(ctx, table, `Ofuda (${TIER_LABEL[tier]})`);
  if (!result) return "Ofuda desconhecido";
  const basic = result.tier === "basic";
  const jutsu = rollFromTable(ctx, basic ? TABLES.jutsusBasic : TABLES.jutsusMedium, basic ? "Jutsu básico" : "Jutsu mediano") ?? "?";
  return `Ofuda de ${jutsu.toLowerCase()} (jutsu ${basic ? "básico" : "mediano"}, ${formatPrice(result.price)})`;
}

/** Nome completo de cada amuleto, como aparece nas descrições do livro. */
export const AMULET_TITLES: Record<string, string> = {
  "Água": "Amuleto da água", "Anulação": "Amuleto da anulação", "Ar": "Amuleto do ar", "Auras": "Amuleto das auras",
  "Barreiras": "Amuleto das barreiras", "Caminhos secretos": "Amuleto dos caminhos secretos", "Comunicação": "Amuleto da comunicação",
  "Cura": "Amuleto da cura", "Dia": "Amuleto do dia", "Dragão": "Amuleto do dragão", "Encantamento": "Amuleto do encantamento",
  "Espíritos": "Amuleto dos espíritos", "Fogo": "Amuleto do fogo", "Força interior": "Amuleto da força interior",
  "Ilusões": "Amuleto das ilusões", "Kata": "Amuleto dos kata", "Lin-Wu": "Amuleto de Lin-Wu", "Mandalas": "Amuleto das mandalas",
  "Mortos": "Amuleto dos mortos", "Mudança rápida": "Amuleto da mudança rápida", "Mundos": "Amuleto dos mundos",
  "Natureza": "Amuleto da natureza", "Ninjas": "Amuleto dos ninjas", "Noite": "Amuleto da noite", "Relâmpago": "Amuleto do relâmpago",
  "Tamanho": "Amuleto do tamanho", "Teletransporte": "Amuleto do teletransporte", "Terra": "Amuleto da terra",
  "Tradições": "Amuleto das tradições", "Transformação": "Amuleto da transformação", "Visões": "Amuleto das visões", "Zen": "Amuleto zen",
};

function namedItem(ctx: Ctx, table: Table<{ name: string; price: number }> | undefined, label: string, title = (n: string) => n): string {
  const item = table && rollFromTable(ctx, table, label);
  return item ? `${title(item.name)} (${formatPrice(item.price)})` : `${label}: desconhecido`;
}

function magicItemGenerator(ctx: Ctx, tier: Tier): string {
  const table = TABLES.magicItems[tier];
  const cat = table && rollFromTable(ctx, table, `Tipo de item (mágico ${TIER_LABEL[tier]})`);
  switch (cat?.category) {
    case "armas": return magicGearGenerator(ctx, "weapon", tier);
    case "armaduras": return magicGearGenerator(ctx, "armor", tier);
    case "ofuda": return ofudaGenerator(ctx, tier);
    case "amuletos": return namedItem(ctx, TABLES.amulets[tier], `Amuleto (${TIER_LABEL[tier]})`, (n) => AMULET_TITLES[n] ?? `Amuleto: ${n}`);
    case "acessorios": return namedItem(ctx, TABLES.accessories[tier], `Acessório (${TIER_LABEL[tier]})`);
    default: return "Item mágico não encontrado";
  }
}

/** Executa a ação sorteada numa tabela de ND. "-" quando não há nada. */
function resolveAction(ctx: Ctx, action: Action | null): string {
  if (!action) return "-";
  if (typeof action === "string") return action;
  switch (action.type) {
    case "equipment": return equipmentGenerator(ctx, action.dict, { special: !!action.special, masterwork: !!action.masterwork });
    case "riches": return richesGenerator(ctx, action.args);
    case "rare": return rareItemGenerator(ctx, action.args, action.dict);
    case "magic_item": return magicItemGenerator(ctx, action.tier);
  }
}

// ── API pública ───────────────────────────────────────────────────

/**
 * Tesouro de um combate contra criaturas de um ND: cada tesouro é uma rolagem
 * na coluna Riquezas e uma na coluna Equipamento. Cada criatura derrotada rende
 * um tesouro; "dobro"/"triplo do padrão" rendem 2 ou 3 por criatura. As
 * rolagens são independentes: moedas somadas, itens listados.
 */
export function generateReward(nd: string, { creatures = 1, treasure = 1 } = {}, rng: Rng = Math.random): Reward {
  const times = Math.max(1, creatures) * Math.max(1, treasure);
  const richesTable = TABLES.richesByNd[nd];
  const equipTable = TABLES.equipmentByNd[nd];
  if (!richesTable || !equipTable) throw new Error(`ND inválido: ${nd}`);

  const richesLog: LogStep[] = [], equipLog: LogStep[] = [], cash: CashEntry[] = [];
  const goods: string[] = [];
  const items = new Map<string, number>();
  let equipCount = 0;
  const tag = (log: LogStep[], k: number) => (times > 1 ? log.map((s) => ({ ...s, label: `#${k} · ${s.label}` })) : log);

  for (let k = 1; k <= times; k++) {
    const r: Ctx = { rng, log: [], cash: [] };
    const riches = resolveAction(r, rollFromTable(r, richesTable, "Riquezas"));
    richesLog.push(...tag(r.log, k));
    cash.push(...r.cash);
    if (riches !== "-" && r.cash.some((c) => c.goods)) goods.push(riches);

    const e: Ctx = { rng, log: [], cash: [] };
    const equip = resolveAction(e, rollFromTable(e, equipTable, "Equipamento"));
    equipLog.push(...tag(e.log, k));
    if (equip !== "-") {
      items.set(equip, (items.get(equip) ?? 0) + 1);
      equipCount++;
    }
  }

  // Moedas somadas por tipo (ouro antes de prata), depois gemas e obras de arte
  const coins: Record<string, number> = {};
  cash.filter((c) => !c.goods).forEach((c) => { coins[c.symbol] = (coins[c.symbol] ?? 0) + c.amount; });
  const richesItems = ["¥o", "¥p"].filter((s) => coins[s]).map((s) => `${formatNumber(coins[s])} ${s}`);
  richesItems.push(...goods);
  const equipItems = [...items].map(([name, n]) => (n > 1 ? `${n}× ${name}` : name));

  return {
    nd, creatures, treasure, times,
    riches: richesItems.length ? richesItems.join(" · ") : null,
    equip: equipItems.length ? equipItems.join(" · ") : null,
    richesItems, equipItems, richesLog, equipLog, cash, equipCount,
  };
}

/** Exposto para testes de tabelas isoladas. */
export const _internal = { rollFromTable, resolveAction, magicGearGenerator, equipmentGenerator };
export type { Ctx };
