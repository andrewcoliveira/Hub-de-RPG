import { describe, it, expect } from "vitest";
import {
  blankState, sanitizeState, changeAttr, canChangeAttr, pointsLeft, attrFinal, setAttrIncrease, selectOrigin, selectClass,
  selectTrail, setNex, nexIndexOf, peLimit, currentPV, currentPE, currentSAN, currentDefense, carryCapacity,
  toggleFreeSkill, setClassSkill, freeSkillTotal, simulateTraining, skillLine, diceText, toggleGrau, setPower,
  updatePower, setPara, updatePara, powerSlots, paraIssues, activeParas, affinityActive, setVersatilityKind,
  ritualSlots, toggleRitual, matchRituals, knownRituals, ritualDT, ritualCost, maxCircle, stepStatus, sheetReady,
  sheetText, originForRoll, RITUALS, ORIGINS, TRAILS, CLASSES, checkPrereq,
  type OrdemState, type Attr, type ClassKey,
} from "@/systems/ordem-paranormal/ficha/engine";

function make(o: { attrs?: Partial<Record<Attr, number>>; origin?: string; cls?: ClassKey; nex?: number; trail?: string }): OrdemState {
  const s = blankState();
  Object.assign(s.attrs, o.attrs ?? { agi: 2, int: 2, pre: 2, vig: 2 }); // 4 pontos gastos
  if (o.origin) selectOrigin(s, o.origin);
  if (o.cls) selectClass(s, o.cls);
  setNex(s, nexIndexOf(o.nex ?? 5));
  if (o.trail) selectTrail(s, o.trail);
  return s;
}

describe("dados do livro", () => {
  it("26 origens cobrindo 2 a 40 na Tabela 1.1", () => {
    expect(ORIGINS).toHaveLength(26);
    for (let r = 2; r <= 40; r++) expect(ORIGINS.filter((o) => r >= o.roll[0] && r <= o.roll[1])).toHaveLength(1);
    expect(originForRoll(22).label).toBe("Investigador");
    expect(originForRoll(40).label).toBe("Vítima");
  });
  it("82 rituais distribuídos por círculo como na Lista de Rituais", () => {
    expect(RITUALS).toHaveLength(82);
    const byCircle = [1, 2, 3, 4].map((c) => RITUALS.filter((r) => r.circle === c).length);
    expect(byCircle).toEqual([26, 22, 17, 17]);
  });
  it("cinco trilhas por classe, com habilidades em 10/40/65/99", () => {
    (["combatente", "especialista", "ocultista"] as ClassKey[]).forEach((c) => {
      const t = TRAILS.filter((x) => x.cls === c);
      expect(t).toHaveLength(5);
      t.forEach((x) => expect(x.abilities.map((a) => a.nex)).toEqual([10, 40, 65, 99]));
    });
  });
});

describe("atributos (todos começam em 1, 4 pontos, máximo 3)", () => {
  it("distribui pontos e bloqueia acima de 3", () => {
    const s = blankState();
    expect(pointsLeft(s)).toBe(4);
    expect(changeAttr(s, "int", 1)).toBe(true);
    expect(changeAttr(s, "int", 1)).toBe(true);
    expect(changeAttr(s, "int", 1)).toBe(false); // máximo inicial 3
    expect(pointsLeft(s)).toBe(2);
  });
  it("reduzir um atributo a 0 dá 1 ponto extra, mas só um", () => {
    const s = blankState();
    expect(changeAttr(s, "for", -1)).toBe(true);
    expect(pointsLeft(s)).toBe(5);
    expect(canChangeAttr(s, "vig", -1)).toBe(false);
  });
  it("exemplo da Bianca: Agi 2, For 0, Int 3, Pre 3, Vig 1 usa todos os pontos", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 } });
    expect(pointsLeft(s)).toBe(0);
  });
  it("aumentos de atributo em NEX 20/50/80/95 até no máximo 5", () => {
    const s = make({ attrs: { agi: 3, int: 2, pre: 1, vig: 1, for: 1 }, cls: "combatente", nex: 95 });
    expect(setAttrIncrease(s, 0, "agi")).toBe(true);
    expect(setAttrIncrease(s, 1, "agi")).toBe(true);
    expect(setAttrIncrease(s, 2, "agi")).toBe(false);
    expect(attrFinal(s, "agi")).toBe(5);
  });
});

describe("PV, PE e SAN (Capítulo 1)", () => {
  it("especialista NEX 5%: 16+Vig, 3+Pre, 16 SAN", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 }, origin: "investigador", cls: "especialista" });
    expect(currentPV(s)).toBe(17);
    expect(currentPE(s)).toBe(6);
    expect(currentSAN(s)).toBe(16);
    expect(peLimit(s)).toBe(1);
  });
  it("combatente NEX 25% com Vig 3 e Pre 1", () => {
    const s = make({ attrs: { agi: 1, for: 2, int: 1, pre: 1, vig: 3 }, cls: "combatente", nex: 25 });
    expect(currentPV(s)).toBe(20 + 3 + 4 * (4 + 3));
    expect(currentPE(s)).toBe(2 + 1 + 4 * (2 + 1));
    expect(currentSAN(s)).toBe(12 + 4 * 3);
    expect(peLimit(s)).toBe(5);
  });
  it("Vigor aumentado vale retroativamente para os PV", () => {
    const s = make({ attrs: { agi: 1, for: 2, int: 1, pre: 1, vig: 3 }, cls: "ocultista", nex: 20 });
    const before = currentPV(s)!;
    setAttrIncrease(s, 0, "vig");
    expect(currentPV(s)! - before).toBe(4); // +1 em cada um dos 4 níveis de exposição
  });
  it("Desgarrado, Vítima, Universitário e Cultista Arrependido", () => {
    expect(currentPV(make({ origin: "desgarrado", cls: "ocultista", nex: 10 }))).toBe(12 + 2 + (2 + 2) + 2);
    expect(currentSAN(make({ origin: "vitima", cls: "ocultista", nex: 10 }))).toBe(20 + 5 + 2);
    const u = make({ origin: "universitario", cls: "ocultista", nex: 25 });
    expect(currentPE(u)).toBe(4 + 2 + 4 * (4 + 2) + 1 + 2); // +1, +1 em 15% e 25%
    expect(peLimit(u)).toBe(6);
    expect(currentSAN(make({ origin: "cultista-arrependido", cls: "ocultista" }))).toBe(10);
  });
  it("Transcender não dá a Sanidade daquele NEX", () => {
    const s = make({ cls: "especialista", nex: 15 });
    setPower(s, 0, "transcender");
    setPara(s, 0, "sangue-de-ferro");
    expect(currentSAN(s)).toBe(16 + 2 * 4 - 4);
    expect(currentPV(s)).toBe(16 + 2 + 2 * (3 + 2) + 2 * 3);
  });
  it("Defesa = 10 + Agi (+2 Patrulha)", () => {
    expect(currentDefense(make({ origin: "policial", cls: "combatente" }))).toBe(14);
  });
  it("carga: 5 por Força, 2 com Força 0, Técnico soma Intelecto", () => {
    expect(carryCapacity(make({ attrs: { for: 0, agi: 3, int: 2 }, cls: "especialista" }))).toBe(2);
    const t = make({ attrs: { for: 1, int: 3, agi: 2 }, cls: "especialista", nex: 10, trail: "tecnico" });
    expect(carryCapacity(t)).toBe(20);
  });
});

describe("perícias", () => {
  it("especialista: 7 + Int livres, além das duas da origem", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 }, origin: "investigador", cls: "especialista" });
    expect(freeSkillTotal(s)).toBe(10);
    expect(toggleFreeSkill(s, "Investigação")).toBe("locked");
    ["Atualidades", "Ciências", "Diplomacia", "Intuição", "Medicina", "Pilotagem", "Pontaria", "Tecnologia", "Vontade", "Furtividade"].forEach((k) => expect(toggleFreeSkill(s, k)).toBe("ok"));
    expect(toggleFreeSkill(s, "Luta")).toBe("full");
    expect(stepStatus(s, "pericias").state).toBe("partial"); // falta Perito
  });
  it("perícia de classe repetida com a origem vira uma escolha extra", () => {
    const s = make({ attrs: { agi: 2, int: 1, pre: 2, vig: 2, for: 2 }, origin: "cultista-arrependido", cls: "ocultista" });
    expect(freeSkillTotal(s)).toBe(3 + 1 + 1); // Ocultismo veio das duas fontes
    const c = make({ attrs: { agi: 2, int: 1, pre: 2, vig: 2, for: 2 }, origin: "lutador", cls: "combatente" });
    setClassSkill(c, 0, "Luta");
    setClassSkill(c, 1, "Fortitude");
    expect(freeSkillTotal(c)).toBe(1 + 1 + 1);
  });
  it("bônus por grau e dados pelo atributo (atributo 0 rola 2d20 e fica com o pior)", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 }, origin: "investigador", cls: "especialista" });
    const l = skillLine(s, "Investigação");
    expect(diceText(l.dice, l.bonus)).toBe("3d20+5");
    const atl = skillLine(s, "Atletismo");
    expect(diceText(atl.dice, atl.bonus)).toBe("2d20 (pior)");
    expect(skillLine(s, "Ocultismo").usable).toBe(false); // somente treinada
  });
  it("Grau de Treinamento em 35% sobe para veterano; 70% pode chegar a expert", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 }, origin: "investigador", cls: "especialista", nex: 70 });
    toggleGrau(s, 0, "Investigação");
    toggleGrau(s, 1, "Investigação");
    toggleGrau(s, 1, "Percepção");
    const { grade, issues } = simulateTraining(s);
    expect(grade.get("Investigação")).toBe(3);
    expect(grade.get("Percepção")).toBe(2);
    expect(issues).toHaveLength(0);
    expect(skillLine(s, "Investigação").bonus).toBe(15);
  });
  it("Grau de Treinamento só vale para perícias treinadas", () => {
    const s = make({ origin: "investigador", cls: "especialista", nex: 35 });
    toggleGrau(s, 0, "Luta");
    expect(simulateTraining(s).issues[0].reason).toMatch(/treinada/);
  });
  it("Treinamento em Perícia antes de 35% não sobe para veterano", () => {
    const s = make({ origin: "investigador", cls: "combatente", nex: 15 });
    setPower(s, 0, "treinamento-em-pericia");
    updatePower(s, 0, (p) => { p.skills = ["Investigação", "Crime"]; });
    const r = simulateTraining(s);
    expect(r.grade.get("Crime")).toBe(1);
    expect(r.issues.map((i) => i.skill)).toEqual(["Investigação"]);
  });
});

describe("poderes", () => {
  it("espaços de poder em 15/30/45/60/75/90 e pré-requisitos", () => {
    const s = make({ attrs: { agi: 1, for: 1, int: 1, pre: 3, vig: 3 }, cls: "combatente", nex: 30 });
    expect(powerSlots(s).map((p) => p.nex)).toEqual([15, 30]);
    setPower(s, 0, "armamento-pesado");
    expect(powerSlots(s)[0].issues).toContain("requer For 2");
    setPower(s, 0, "protecao-pesada");
    expect(powerSlots(s)[0].issues).toContain("requer NEX 30%"); // escolhido no espaço de 15%
    setPower(s, 1, "protecao-pesada");
    setPower(s, 0, "tanque-de-guerra");
    expect(powerSlots(s)[0].issues).toEqual([]);
  });
  it("poder paranormal com pré-requisito de elemento", () => {
    const s = make({ cls: "especialista", nex: 30 });
    setPower(s, 0, "transcender");
    setPara(s, 0, "sangue-vivo"); // requer Sangue 1
    expect(paraIssues(s, activeParas(s)[0])).toContain("requer Sangue 1");
    setPower(s, 1, "transcender");
    setPara(s, 1, "arma-de-sangue");
    expect(paraIssues(s, activeParas(s)[0])).toEqual([]);
  });
  it("Cultista Arrependido recebe um poder paranormal sem custo de SAN extra", () => {
    const s = make({ origin: "cultista-arrependido", cls: "combatente" });
    setPara(s, "origin", "visao-do-oculto");
    expect(activeParas(s)).toHaveLength(1);
    expect(skillLine(s, "Percepção").bonus).toBe(5);
    expect(currentSAN(s)).toBe(6);
  });
  it("afinidade só fica ativa ao transcender depois de NEX 50%", () => {
    const s = make({ cls: "ocultista", nex: 60 });
    s.affinity = "morte";
    setPower(s, 0, "transcender");
    setPara(s, 0, "potencial-aprimorado");
    expect(affinityActive(s)).toBe(false);
    setPower(s, 3, "transcender");
    setPara(s, 3, "potencial-aprimorado");
    expect(affinityActive(s)).toBe(true);
    expect(paraIssues(s, activeParas(s)[1])).toEqual([]); // repetir com afinidade
    // Potencial Aprimorado com afinidade: +2 PE por NEX
    const base = 4 + 2 + 11 * (4 + 2);
    expect(currentPE(s)).toBe(base + 2 * 12);
  });
  it("Versatilidade pode dar o primeiro poder de outra trilha", () => {
    const s = make({ attrs: { agi: 2, for: 2, int: 1, pre: 1, vig: 2 }, cls: "combatente", nex: 50, trail: "guerreiro" });
    setVersatilityKind(s, "trail");
    s.versatility = { kind: "trail", trail: "operacoes-especiais" };
    expect(skillLine(s, "Iniciativa").bonus).toBe(5);
  });
  it("Mestre em Elemento exige Especialista no mesmo elemento", () => {
    const s = make({ cls: "ocultista", nex: 45 });
    setPower(s, 0, "especialista-em-elemento");
    updatePower(s, 0, (p) => { p.choice = "sangue"; });
    setPower(s, 2, "mestre-em-elemento");
    updatePower(s, 2, (p) => { p.choice = "morte"; });
    expect(powerSlots(s)[2].issues).toContain("precisa ser o mesmo elemento de Especialista em Elemento");
    expect(checkPrereq(s, CLASSES.ocultista.powers.find((p) => p.id === "mestre-em-elemento")!.prereq, 45).every((c) => c.ok)).toBe(true);
  });
});

describe("rituais", () => {
  it("ocultista começa com 3 rituais de 1º círculo e ganha 1 por NEX", () => {
    const s = make({ cls: "ocultista" });
    expect(ritualSlots(s)).toHaveLength(3);
    expect(maxCircle(s)).toBe(1);
    ["Cicatrização", "Decadência", "Luz"].forEach((r) => expect(toggleRitual(s, r)).toBe("added"));
    expect(toggleRitual(s, "Eletrocussão")).toBe("full");
    expect(toggleRitual(s, "Descarnar")).toBe("invalid"); // 2º círculo
    setNex(s, nexIndexOf(25));
    expect(ritualSlots(s)).toHaveLength(7);
    expect(toggleRitual(s, "Descarnar")).toBe("added");
  });
  it("rituais iniciais não podem ser de 2º círculo mesmo em NEX alto", () => {
    const s = make({ cls: "ocultista", nex: 25 });
    ["Descarnar", "Hemofagia", "Paradoxo", "Eco Espiral", "Miasma Entrópico"].forEach((r) => toggleRitual(s, r));
    expect(matchRituals(s).slotOf.filter((x) => x === null)).toHaveLength(0);
    expect(s.rituals).toHaveLength(4); // só 4 vagas aceitam 2º círculo
  });
  it("Graduado: Saber Ampliado e Grimório", () => {
    const s = make({ attrs: { agi: 1, for: 1, int: 3, pre: 2, vig: 1 }, cls: "ocultista", nex: 55, trail: "graduado" });
    const pools = ritualSlots(s).reduce<Record<string, number>>((m, x) => ({ ...m, [x.pool]: (m[x.pool] ?? 0) + 1 }), {});
    expect(pools).toEqual({ classe: 3 + 10, graduado: 4 - 1, grimorio: 3 + 1 }); // 1º,2º,3º; Int 3 + 3º círculo
  });
  it("DT = 10 + limite de PE + Presença; trilha concede ritual de Medo em 99%", () => {
    const s = make({ attrs: { agi: 1, for: 1, int: 1, pre: 3, vig: 2 }, cls: "ocultista", nex: 99, trail: "intuitivo" });
    expect(ritualDT(s)).toBe(10 + 20 + 3);
    expect(knownRituals(s).map((r) => r.def.name)).toContain("Presença do Medo");
    const o = make({ attrs: { agi: 2, for: 1, int: 1, pre: 3, vig: 1 }, cls: "ocultista" });
    expect(ritualDT(o)).toBe(14); // exemplo do livro: Pre 3 e NEX 5%
  });
  it("Mestre em Elemento e Ritual Predileto reduzem o custo", () => {
    const s = make({ cls: "ocultista", nex: 45 });
    toggleRitual(s, "Cicatrização");
    setPower(s, 0, "especialista-em-elemento"); updatePower(s, 0, (p) => { p.choice = "morte"; });
    setPower(s, 1, "ritual-predileto"); updatePower(s, 1, (p) => { p.choice = "Cicatrização"; });
    setPower(s, 2, "mestre-em-elemento"); updatePower(s, 2, (p) => { p.choice = "morte"; });
    const c = RITUALS.find((r) => r.name === "Cicatrização")!;
    expect(ritualCost(s, c, "morte")).toBe(0);
    expect(ritualDT(s, "morte")).toBe(ritualDT(s) + 2);
  });
  it("Aprender Ritual para outras classes, limitado ao Intelecto", () => {
    const s = make({ attrs: { agi: 2, for: 1, int: 1, pre: 2, vig: 2 }, cls: "combatente", nex: 30 });
    setPower(s, 0, "transcender"); setPara(s, 0, "aprender-ritual"); updatePara(s, 0, (p) => { p.choice = "Arma Atroz"; });
    setPower(s, 1, "transcender"); setPara(s, 1, "aprender-ritual"); updatePara(s, 1, (p) => { p.choice = "Luz"; });
    expect(knownRituals(s)).toHaveLength(2);
    expect(paraIssues(s, activeParas(s)[1]).join()).toMatch(/Intelecto/);
  });
});

describe("estado e etapas", () => {
  it("mudar o NEX descarta escolhas de níveis não alcançados", () => {
    const s = make({ cls: "combatente", nex: 60, trail: "guerreiro" });
    setPower(s, 3, "golpe-pesado");
    setNex(s, nexIndexOf(5));
    expect(s.powers).toHaveLength(0);
    expect(s.trail).toBeNull();
  });
  it("ficha completa: texto e restauração", () => {
    const s = make({ attrs: { agi: 2, for: 0, int: 3, pre: 3, vig: 1 }, origin: "investigador", cls: "especialista" });
    s.name = "Bianca"; s.concept = "Cientista forense curiosa";
    expect(sheetReady(s)).toBe(true);
    expect(stepStatus(s, "conceito").state).toBe("done");
    expect(sheetText(s)).toMatch(/Bianca — Especialista · NEX 5%/);
    expect(sheetText(s)).toMatch(/PV 17 · PE 6/);
    const back = sanitizeState(JSON.parse(JSON.stringify(s)));
    expect(back).toEqual(s);
  });
  it("sanitize descarta lixo", () => {
    const s = sanitizeState({ attrs: { agi: 9, for: 0, vig: 0 }, origin: "pirata", classKey: "mago", nexIndex: 99, rituals: [{ name: "Inexistente" }] });
    expect(s.attrs.agi).toBe(1);
    expect(s.attrs.vig).toBe(1); // só um atributo pode ser 0
    expect(s.origin).toBeNull();
    expect(s.classKey).toBeNull();
    expect(s.nexIndex).toBe(0);
    expect(s.rituals).toEqual([]);
  });
});
