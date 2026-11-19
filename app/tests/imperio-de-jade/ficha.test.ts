import { describe, it, expect } from "vitest";
import {
  blankState, sanitizeState, finalValueFor, honorTier, currentPM, currentPV, currentDefenses, pmBreakdown,
  freeSlotCount, bonusTalentSources, grantedTalents, toggleRaceChoice, canIncrementAbility, incrementAbility,
  skillAttr, skillBonus, canUseUntrained, skillSlotCount, generateRolls, rollQuality, assignRoll,
  changePointValue, pointsLeft, toggleTalent, checkSinglePrereq, stepStatus, sheetText, CLASSES, CLASS_KEYS,
  type JadeState, type AbilityKey, type BasicAbilityKey, type ClassKey, type RaceKey,
} from "@/systems/imperio-de-jade/ficha/engine";

interface Setup {
  race: RaceKey; cls: ClassKey; lvl?: number;
  pts?: Partial<Record<AbilityKey, number>>;
  choices?: BasicAbilityKey[];
  tal?: string[];
  pm?: "sab" | "hon";
}

function make(o: Setup): JadeState {
  const s = blankState();
  s.mode = "points";
  Object.assign(s.pointValues, o.pts ?? {});
  s.race = o.race;
  s.raceChoices = o.choices ?? [];
  s.classKey = o.cls;
  s.level = o.lvl ?? 1;
  s.selectedTalents = (o.tal ?? []).map((name) => ({ name, category: "combate" }));
  if (o.pm) s.pmChoice = o.pm;
  return s;
}

describe("Honra (Capítulo 1, Ajustes de Honra)", () => {
  it("soma raça, classe e +1 por nível", () => {
    const s = make({ race: "ryuujin", cls: "samurai", lvl: 5, pts: { hon: 14 } });
    expect(finalValueFor(s, "hon")).toBe(22); // 14 +2 raça +2 classe +4 níveis
    expect(honorTier(22)).toBe("Digníssimo");
  });
  it("ninja nezumi fica sórdido e nunca abaixo de 0", () => {
    expect(finalValueFor(make({ race: "nezumi", cls: "ninja", pts: { hon: 8 } }), "hon")).toBe(2);
    expect(honorTier(2)).toBe("Sórdido");
    expect(finalValueFor(make({ race: "nezumi", cls: "ninja", pts: { hon: 8 } }), "hon")).toBeGreaterThanOrEqual(0);
  });
  it("bônus racial à escolha e aumentos por nível não vão para Honra", () => {
    const s = make({ race: "humano", cls: "bushi", lvl: 3 });
    expect(toggleRaceChoice(s, "hon")).toBe(false);
    expect(canIncrementAbility(s, "hon")).toBe(false);
    expect(incrementAbility(s, "for")).toBe(true);
  });
});

describe("PM (chacras)", () => {
  it("wu-jen hanyô 6º: classe + Car + Int ×3", () => {
    const s = make({ race: "hanyo", cls: "wujen", lvl: 6, pts: { int: 16, car: 10 } });
    expect(pmBreakdown(s).map((p) => p.value)).toEqual([26, 2, 12]);
    expect(currentPM(s)).toBe(40);
  });
  it("shugenja pode somar Honra em vez de Sabedoria", () => {
    const s = make({ race: "humano", cls: "shugenja", lvl: 3, pts: { sab: 14, hon: 14 }, choices: ["sab", "con"], pm: "hon" });
    expect(currentPM(s)).toBe(18); // 6 + 4×2 + Hon 18 (+4)
    s.pmChoice = "sab";
    expect(currentPM(s)).toBe(17); // Sab 16 (+3)
  });
  it("shinkan só soma Sabedoria a partir do 3º nível", () => {
    expect(pmBreakdown(make({ race: "humano", cls: "shinkan", lvl: 2, pts: { sab: 16 } }))).toHaveLength(1);
    expect(pmBreakdown(make({ race: "humano", cls: "shinkan", lvl: 3, pts: { sab: 16 } }))).toHaveLength(2);
  });
});

describe("talentos", () => {
  it("escolhas: nível + humano + técnica de luta/poder concedido", () => {
    const s = make({ race: "ryuujin", cls: "samurai", lvl: 5 });
    expect(bonusTalentSources(s).map((b) => `${b.label}:${b.count}`)).toEqual(["Técnica de luta:1", "Poder concedido:1"]);
    expect(freeSlotCount(s)).toBe(7);
    expect(freeSlotCount(make({ race: "humano", cls: "bushi" }))).toBe(3);
    expect(freeSlotCount(make({ race: "kaijin", cls: "bushi" }))).toBe(3);
  });
  it("wu-jen recebe Abrir Chacra no 2º nível; kaijin recebe talentos raciais", () => {
    expect(grantedTalents(make({ race: "humano", cls: "wujen", lvl: 1 })).has("Abrir Chacra")).toBe(false);
    expect(grantedTalents(make({ race: "humano", cls: "wujen", lvl: 2 })).has("Abrir Chacra")).toBe(true);
    expect(grantedTalents(make({ race: "kaijin", cls: "bushi" })).has("Carapaça")).toBe(true);
  });
  it("cache dos concedidos acompanha mudanças no mesmo objeto", () => {
    const s = make({ race: "humano", cls: "wujen", lvl: 1 });
    expect(grantedTalents(s).has("Abrir Chacra")).toBe(false);
    s.level = 2;
    expect(grantedTalents(s).has("Abrir Chacra")).toBe(true);
  });
  it("pré-requisitos de habilidade e de talento", () => {
    const s = make({ race: "humano", cls: "bushi", pts: { des: 13 } });
    expect(checkSinglePrereq(s, "Des 13")).toBe(true);
    expect(checkSinglePrereq(s, "Des 15")).toBe(false);
    expect(checkSinglePrereq(s, "Fortitude Maior")).toBe(true); // inicial do bushi
    expect(toggleTalent(s, "Esquiva", "combate")).toBe("added");
    expect(toggleTalent(s, "Fortitude Maior", "destino")).toBe("granted");
  });
});

describe("PV, defesas e perícias", () => {
  it("Vitalidade soma +1 PV por nível", () => {
    expect(currentPV(make({ race: "humano", cls: "bushi", lvl: 4, pts: { con: 14 }, choices: ["for", "des"], tal: ["Vitalidade"] }))).toEqual({ value: 54, partial: false });
  });
  it("CA e resistências do samurai ryuujin 5º", () => {
    expect(currentDefenses(make({ race: "ryuujin", cls: "samurai", lvl: 5, pts: { hon: 14, sab: 14, for: 14 } })))
      .toEqual({ ca: 11, fort: 6, ref: 3, von: 10 });
  });
  it("traços raciais nas perícias", () => {
    expect(skillAttr(make({ race: "henge", cls: "bushi" }), "Atletismo")).toBe("Des");
    expect(skillAttr(make({ race: "kaijin", cls: "bushi" }), "Intimidação")).toBe("For");
    expect(canUseUntrained(make({ race: "vanara", cls: "bushi" }), "Conhecimento")).toBe(true);
    expect(canUseUntrained(make({ race: "humano", cls: "bushi" }), "Conhecimento")).toBe(false);
    expect(skillBonus(make({ race: "nezumi", cls: "ninja", pts: { des: 10 } }), "Furtividade", true)).toBe(9);
    expect(skillBonus(make({ race: "ryuujin", cls: "samurai", lvl: 5 }), "Diplomacia", false)).toBe(6);
  });
  it("perícias treinadas: base + Int, +2 humano", () => {
    expect(skillSlotCount(make({ race: "humano", cls: "yakuza", pts: { int: 14 } }))).toBe(8 + 2 + 2);
  });
});

describe("atributos", () => {
  it("rolagem gera 7 valores entre 3 e 18 e a regra de rolar de novo", () => {
    const s = blankState();
    generateRolls(s);
    expect(s.rolls).toHaveLength(7);
    s.rolls.forEach((r) => { expect(r.sum).toBeGreaterThanOrEqual(3); expect(r.sum).toBeLessThanOrEqual(18); });
    s.rolls = Array(7).fill({ dice: [3, 3, 3, 3], sum: 9 });
    expect(rollQuality(s)!.ok).toBe(false);
  });
  it("atribuir um valor já usado troca de lugar", () => {
    const s = blankState();
    s.rolls = [10, 11, 12, 13, 14, 15, 16].map((n) => ({ dice: [1, 1, 1, 1], sum: n }));
    assignRoll(s, 0, "for");
    assignRoll(s, 1, "des");
    assignRoll(s, 0, "des");
    expect(s.assignments.des).toBe(0);
    expect(s.assignments.for).toBe(1);
  });
  it("compra de pontos respeita os 24 pontos", () => {
    const s = blankState();
    s.mode = "points";
    for (let i = 0; i < 8; i++) changePointValue(s, "for", 1); // 18 = 14 pontos
    for (let i = 0; i < 8; i++) changePointValue(s, "des", 1); // só até 16 (8 pontos) … sobra 2
    expect(s.pointValues.for).toBe(18);
    expect(pointsLeft(s)).toBeGreaterThanOrEqual(0);
  });
});

describe("estado salvo / importado", () => {
  it("descarta campos inválidos e Honra nos aumentos", () => {
    const s = sanitizeState({ mode: "points", race: "xyz", classKey: "samurai", level: 99, abilityIncrements: { hon: 2, for: 1 }, raceChoices: ["hon"] });
    expect(s.race).toBeNull();
    expect(s.classKey).toBe("samurai");
    expect(s.level).toBe(1);
    expect(s.abilityIncrements).toEqual({ for: 1 });
  });
  it("todas as classes têm 20 linhas de progressão", () => {
    CLASS_KEYS.forEach((k) => expect(CLASSES[k].tabela, k).toHaveLength(20));
  });
  it("ficha pronta gera status e texto", () => {
    const s = make({ race: "ryuujin", cls: "shugenja", lvl: 6, pts: { hon: 14, sab: 14, for: 14, des: 12 } });
    expect(stepStatus(s, "ficha").state).toBe("done");
    const text = sheetText(s);
    expect(text).toContain("Honra 23 (Digníssimo)");
    expect(text).toContain("CA 13");
  });
});
