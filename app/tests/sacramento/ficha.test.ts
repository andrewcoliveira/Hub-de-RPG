import { describe, it, expect } from "vitest";
import {
  blankState, sanitizeState, changeAttr, attrLeft, attrPoints, antecedentPoints, antecedentLeft, changeAntecedent,
  canChangeAntecedent, conditions, vidaParts, addSkill, removeSkill, skillSlots, skillIssues, scaleAt, selectTrail,
  isRedeemed, levelForXp, setLevel, mountStats, mountLeft, setQty, moneyLeft, packing, itemPrice, antecedentRoll,
  stepStatus, sheetReady, sheetText, SKILLS, TRAILS, ITEMS, LEVELS, skillIndex,
  type SacramentoState,
} from "@/systems/sacramento/ficha/engine";

const key = (name: string) => ITEMS.find((i) => i.name === name)!.key;

function golia(): SacramentoState {
  const s = blankState();
  s.name = "Golia";
  s.concept = "Brutamontes do Circo do Sol";
  changeAttr(s, "fisico", 1); changeAttr(s, "fisico", 1);
  changeAttr(s, "velocidade", 1);
  changeAttr(s, "coragem", 1);
  changeAntecedent(s, "violencia", 1); changeAntecedent(s, "violencia", 1);
  changeAntecedent(s, "suor", 1); changeAntecedent(s, "suor", 1);
  return s;
}

describe("dados do livro", () => {
  it("30 habilidades em duas listas de 15", () => {
    expect(SKILLS).toHaveLength(30);
    expect(SKILLS.filter((x) => x.list === "combate")).toHaveLength(15);
  });
  it("6 trilhas de Redenção com 6 passos", () => {
    expect(TRAILS).toHaveLength(6);
    TRAILS.forEach((t) => expect(t.steps).toHaveLength(6));
  });
  it("tabela de experiência", () => {
    expect(LEVELS.map((l) => l.xp)).toEqual([0, 10, 20, 30, 45, 65]);
    expect(levelForXp(9)).toBe(1);
    expect(levelForXp(30)).toBe(4);
    expect(levelForXp(100)).toBe(6);
  });
  it("chaves de itens únicas", () => {
    expect(new Set(ITEMS.map((i) => i.key)).size).toBe(ITEMS.length);
  });
});

describe("exemplo do Golia (Capítulo 1)", () => {
  it("condições a partir dos atributos", () => {
    const s = golia();
    expect(attrLeft(s)).toBe(0);
    const c = conditions(s);
    expect(c.vida).toBe(8);
    expect(c.movimentos).toBe(2);
    expect(c.acoes).toBe(2);
    expect(c.defesa).toBe(5);
    expect(c.dor).toBe(6);
  });
  it("4 pontos de Antecedente sem Intelecto, máximo 2 no nível 1", () => {
    const s = golia();
    expect(antecedentPoints(s)).toBe(4);
    expect(antecedentLeft(s)).toBe(0);
    expect(canChangeAntecedent(s, "suor", 1)).toBe(false);
    expect(antecedentRoll(s, "suor").text).toBe("1d6+2");
  });
  it("Quebra-Ossos e Fúria dos Aflitos", () => {
    const s = golia();
    expect(addSkill(s, "quebra-ossos")).toBe("ok");
    expect(addSkill(s, "furia-dos-aflitos")).toBe("ok");
    expect(addSkill(s, "dedo-quente")).toBe("full");
    expect(conditions(s).defesaFuria).toBe(4);
    expect(stepStatus(s, "habilidades").state).toBe("done");
    expect(sheetReady(s)).toBe(true);
  });
});

describe("antecedentes", () => {
  it("Intelecto dá pontos extras", () => {
    const s = blankState();
    changeAttr(s, "intelecto", 1); changeAttr(s, "intelecto", 1);
    expect(antecedentPoints(s)).toBe(6);
  });
  it("habilidades que rolam 2d6", () => {
    const s = golia();
    addSkill(s, "natural-da-natureza");
    expect(antecedentRoll(s, "suor").best[0].skill).toBe("Natural da Natureza");
  });
});

describe("níveis", () => {
  it("nível 6: atributos, antecedentes, habilidades e Vida", () => {
    const s = golia();
    setLevel(s, 6);
    expect(attrPoints(s)).toBe(8);
    expect(antecedentPoints(s)).toBe(5);
    expect(skillSlots(s)).toBe(6);
    // 6 + Físico 2 + nível 2 (2) + nível 4 (2) + nível 5 (2) + nível 6 (3)
    expect(conditions(s).vida).toBe(17);
  });
  it("Físico 0 ainda ganha 1 Vida nos níveis com Vida por Físico", () => {
    const s = blankState();
    setLevel(s, 2);
    expect(vidaParts(s).map((p) => p.value)).toEqual([6, 1]);
  });
  it("tabelas de habilidade pelo nível", () => {
    const def = skillIndex.get("dedo-quente")!;
    expect(scaleAt(def, 1)).toBe("+1 Vida");
    expect(scaleAt(def, 5)).toBe("+2 Vida");
    expect(scaleAt(def, 6)).toBe("+3 Vida");
    expect(scaleAt(skillIndex.get("cancao-da-emocao")!, 4)).toBe("+1 Movimento, +1 Ação de Combate, +1 em Violência");
  });
});

describe("habilidades", () => {
  it("Parrudeza pode repetir e soma 2 Vida cada", () => {
    const s = blankState();
    expect(addSkill(s, "parrudeza")).toBe("ok");
    expect(addSkill(s, "parrudeza")).toBe("ok");
    expect(conditions(s).vida).toBe(10);
    removeSkill(s, "parrudeza");
    expect(conditions(s).vida).toBe(8);
  });
  it("as demais não repetem", () => {
    const s = blankState();
    addSkill(s, "livramento");
    expect(addSkill(s, "livramento")).toBe("taken");
  });
  it("Sorte dos Covardes exige Intelecto ≤ 1 e Violência ≤ 2", () => {
    const s = blankState();
    addSkill(s, "sorte-dos-covardes");
    expect(skillIssues(s)).toEqual([]);
    changeAttr(s, "intelecto", 1); changeAttr(s, "intelecto", 1);
    expect(skillIssues(s)[0]).toMatch(/Sorte dos Covardes/);
  });
});

describe("redenção", () => {
  it("cumprir os 6 passos dá +1 Habilidade, +2 Vida e +1 carta", () => {
    const s = golia();
    selectTrail(s, "fuga");
    expect(s.redemption.steps[0]).toMatch(/procurado/);
    expect(isRedeemed(s)).toBe(false);
    s.redemption.done = [true, true, true, true, true, true];
    expect(isRedeemed(s)).toBe(true);
    expect(skillSlots(s)).toBe(3);
    expect(conditions(s).vida).toBe(10);
    expect(conditions(s).iniciativa).toMatch(/2 cartas/);
  });
});

describe("montaria", () => {
  it("3 pontos entre Potência e Resistência; Fidelidade 2 e 5 dão +1", () => {
    const s = golia();
    s.mount.enabled = true;
    s.mount.potencia = 2; s.mount.resistencia = 1;
    expect(mountLeft(s)).toBe(0);
    expect(mountStats(s).vida).toBe(7);
    s.mount.fidelidade = 2;
    s.mount.fidelityBonus = ["potencia", "resistencia"];
    expect(mountStats(s).potencia).toBe(3);
    expect(mountStats(s).resistencia).toBe(1); // bônus de Fidelidade 5 ainda não vale
    expect(mountStats(s).teste).toBe("1d6+3 contra NA 6");
  });
});

describe("equipamento", () => {
  it("$200 pelo preço máximo", () => {
    const s = blankState();
    setQty(s, key("Revólver"), 1);
    setQty(s, key("Munição de revólver (caixa com 12)"), 2);
    expect(moneyLeft(s)).toBe(200 - 25 - 16);
  });
  it("Sorrisão, Chapéu na Mão: 25% de desconto em itens comuns", () => {
    const s = blankState();
    addSkill(s, "sorrisao-chapeu-na-mao");
    expect(itemPrice(s, ITEMS.find((i) => i.name === "Revólver")!)).toBe(18.75);
    expect(itemPrice(s, ITEMS.find((i) => i.name === "Derringer")!)).toBe(300);
  });
  it("até 4 armas e uma faca não ocupam a mochila", () => {
    const s = blankState();
    setQty(s, key("Faca"), 1);
    setQty(s, key("Revólver"), 2);
    setQty(s, key("Fuzil"), 1);
    setQty(s, key("Espingarda"), 1);
    expect(packing(s).used).toBe(0);
    setQty(s, key("Machadinha"), 1); // quinta arma vai para a mochila
    expect(packing(s).used).toBe(1);
    setQty(s, key("Café (lata)"), 3); // até 3 latas por linha
    expect(packing(s).used).toBe(2);
    expect(packing(s).capacity).toBe(10);
  });
  it("estourar o orçamento é avisado", () => {
    const s = blankState();
    setQty(s, key("Ombreiras de ferro"), 1);
    expect(stepStatus(s, "equipamento").state).toBe("warn");
  });
});

describe("estado", () => {
  it("texto e restauração", () => {
    const s = golia();
    addSkill(s, "quebra-ossos");
    selectTrail(s, "vinganca");
    setQty(s, key("Revólver"), 1);
    expect(sheetText(s)).toMatch(/Golia — Nível 1/);
    expect(sheetText(s)).toMatch(/Vida 8 · Dor 6 · Movimentos 2 · Ações de Combate 2/);
    expect(sanitizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it("sanitize descarta lixo", () => {
    const s = sanitizeState({ level: 9, attrs: { fisico: -2 }, skills: ["inexistente", "parrudeza"], items: { nada: 3 }, mount: { potencia: 3, resistencia: 3 } });
    expect(s.level).toBe(1);
    expect(s.attrs.fisico).toBe(0);
    expect(s.skills).toEqual(["parrudeza"]);
    expect(s.items).toEqual({});
    expect(s.mount.potencia + s.mount.resistencia).toBe(0);
  });
});
