import { describe, it, expect } from "vitest";
import { TABLES, ND_LIST, type Table } from "@/systems/imperio-de-jade/gerador/engine/tables";
import {
  generateReward,
  RANGED_WEAPONS,
  WEAPON_BONUS_PRICE,
  ARMOR_BONUS_PRICE,
  _internal,
  type Ctx,
} from "@/systems/imperio-de-jade/gerador/engine/generator";

/** Gerador determinístico (mulberry32) para testes reprodutíveis. */
function seeded(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sempre devolve o resultado da tabela em que o d% cai em `roll`. */
const fixed = (roll: number) => () => (roll - 1) / 100;

function allTables(): [string, Table<unknown>][] {
  const out: [string, Table<unknown>][] = [];
  const add = (name: string, v: unknown) => {
    if (Array.isArray(v)) out.push([name, v as Table<unknown>]);
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, sub]) => add(`${name}.${k}`, sub));
  };
  Object.entries(TABLES).forEach(([k, v]) => add(k, v));
  return out;
}

describe("tabelas do Capítulo 8", () => {
  it("toda tabela de d% é crescente e termina em 100", () => {
    for (const [name, table] of allTables()) {
      const limits = table.map(([t]) => t);
      expect(limits.at(-1), name).toBe(100);
      limits.forEach((t, i) => { if (i) expect(t, `${name}[${i}]`).toBeGreaterThan(limits[i - 1]); });
    }
  });

  it("todos os NDs têm colunas de riquezas e equipamento", () => {
    ND_LIST.forEach((nd) => {
      expect(TABLES.richesByNd[nd], nd).toBeDefined();
      expect(TABLES.equipmentByNd[nd], nd).toBeDefined();
    });
  });

  it("ND 2: 71-90 arma, 91-100 armadura (livro, p. 284)", () => {
    const t = TABLES.equipmentByNd["2"];
    expect(t[2][0]).toBe(90);
    expect(t[2][1]).toMatchObject({ type: "equipment", dict: "weapons" });
    expect(t[3][1]).toMatchObject({ type: "equipment", dict: "armors" });
  });

  it("ND 6 e 7: faixas 26-65 / 66-95 / 96-100 (livro, p. 285)", () => {
    for (const nd of ["6", "7"]) expect(TABLES.equipmentByNd[nd].map(([t]) => t)).toEqual([25, 65, 95, 100]);
  });

  it("Broto de bambu suchiiru custa 2.300 ¥o", () => {
    const menor = TABLES.armorsSpecific.menor!;
    expect(menor.find(([, v]) => v.name === "Broto de bambu suchiiru")![1].price).toBe(2300);
  });
});

describe("gerador", () => {
  it("gera recompensas válidas em todos os NDs", () => {
    const rng = seeded(42);
    for (const nd of ND_LIST) {
      for (let i = 0; i < 150; i++) {
        const r = generateReward(nd, { creatures: 1 + (i % 3), treasure: 1 + (i % 2) }, rng);
        const text = `${r.riches} ${r.equip}`;
        expect(text, nd).not.toMatch(/undefined|NaN|desconhecid|Erro/);
      }
    }
  });

  it("obra-prima sorteia uma arma de verdade, com tamanho", () => {
    const ctx: Ctx = { rng: seeded(7), log: [], cash: [] };
    const name = _internal.equipmentGenerator(ctx, "weapons", { masterwork: true });
    expect(name).toMatch(/obra-prima/);
    expect(name).not.toMatch(/^Arma obra-prima$/);
  });

  it("5 criaturas com tesouro triplo = 15 tesouros independentes", () => {
    const r = generateReward("20", { creatures: 5, treasure: 3 }, seeded(3));
    expect(r.times).toBe(15);
    const rolls = new Set(r.equipLog.filter((s) => s.label.endsWith("· Equipamento")).map((s) => s.label));
    expect(rolls.size).toBe(15);
    expect(r.richesLog.some((s) => s.label.startsWith("#15 ·"))).toBe(true);
    // não repete o mesmo item 15 vezes
    expect(r.equipItems.every((i) => !i.startsWith("15×"))).toBe(true);
  });

  it("um único tesouro não numera os passos", () => {
    const r = generateReward("5", {}, seeded(1));
    expect(r.times).toBe(1);
    expect(r.richesLog.every((s) => !s.label.startsWith("#"))).toBe(true);
  });

  it("moedas são somadas entre tesouros", () => {
    const r = generateReward("1", { creatures: 10 }, seeded(9));
    const gold = r.cash.filter((c) => c.symbol === "¥o" && !c.goods).reduce((t, c) => t + c.amount, 0);
    if (gold) expect(r.richesItems[0]).toContain(gold.toLocaleString("pt-BR"));
  });

  it("ND 1/3 com d% 01 não dá nada", () => {
    const r = generateReward("1/3", {}, fixed(1));
    expect(r.riches).toBeNull();
    expect(r.equip).toBeNull();
  });
});

describe("armas e armaduras mágicas", () => {
  // Poderes que só existem numa das duas tabelas (p. 293)
  const MELEE_ONLY = ["defensora"];
  const RANGED_ONLY = ["caçadora", "longínqua"];

  it("respeita bônus +5, total +10 e cobra o preço do bônus total", () => {
    const rng = seeded(11);
    for (let i = 0; i < 600; i++) {
      for (const kind of ["weapon", "armor"] as const) {
        const ctx: Ctx = { rng, log: [], cash: [] };
        const text = _internal.magicGearGenerator(ctx, kind, (["menor", "medio", "maior"] as const)[i % 3]);
        const m = text.match(/ \+(\d+) \((?:bônus total \+(\d+), )?item \w+\) — \+([\d.]+) ¥o/);
        if (!m) continue; // item específico
        const bonus = Number(m[1]);
        const total = Number(m[2] ?? m[1]);
        expect(bonus).toBeLessThanOrEqual(5);
        expect(total).toBeLessThanOrEqual(10);
        const price = Number(m[3].replace(/\./g, ""));
        expect(price).toBe((kind === "weapon" ? WEAPON_BONUS_PRICE : ARMOR_BONUS_PRICE)[total]);
      }
    }
  });

  it("armas à distância usam a tabela de poderes à distância", () => {
    const rng = seeded(5);
    let ranged = 0, melee = 0;
    for (let i = 0; i < 3000; i++) {
      const ctx: Ctx = { rng, log: [], cash: [] };
      const text = _internal.magicGearGenerator(ctx, "weapon", "maior").toLowerCase();
      if (!text.includes(" — +")) continue; // arma específica
      if ([...RANGED_WEAPONS].some((w) => text.startsWith(w.toLowerCase()))) {
        ranged++;
        MELEE_ONLY.forEach((p) => expect(text, text).not.toContain(` ${p}`));
      } else {
        melee++;
        RANGED_ONLY.forEach((p) => expect(text, text).not.toContain(` ${p}`));
      }
    }
    expect(ranged).toBeGreaterThan(50);
    expect(melee).toBeGreaterThan(50);
  });
});
