import { describe, it, expect, beforeEach } from "vitest";
import { useFicha } from "@/store/ficha";
import { SORCERY } from "@/engine";

const s = () => useFicha.getState();
beforeEach(() => { s().reset(); });

describe("store", () => {
  it("adjustTrait respeita orçamento (2 livres)", () => {
    s().adjustTrait("vigor", 1); s().adjustTrait("vigor", 1);
    expect(s().f.traits.vigor).toBe(4);
    s().adjustTrait("argucia", 1); // sem pontos
    expect(s().f.traits.argucia).toBe(2);
  });
  it("toggleSorceryPower respeita o teto do orçamento", () => {
    s().selectNation("avalon"); s().toggleAdvantage("feiticaria"); s().setSchool("glamour");
    s().toggleSorceryPower(SORCERY.glamour.maiores[0].key);
    s().toggleSorceryPower(SORCERY.glamour.maiores[1].key); // 2º maior — orçamento é 1
    const chosenMaiores = s().f.sorcery.powers.filter(
      (k) => SORCERY.glamour.maiores.some((p) => p.key === k)
    ).length;
    expect(chosenMaiores).toBe(1);
  });
  it("setSociety bloqueia novusOrdo", () => { s().setSociety("novusOrdo"); expect(s().f.society.key).toBeNull(); s().setSociety("exploradores"); expect(s().f.society.key).toBe("exploradores"); });
  it("espiral clampa 0..4 e desamparado", () => { for (let i=0;i<6;i++) s().adjustWound("ferimentosDramaticos", 1); expect(s().f.play.ferimentosDramaticos).toBe(4); });
  it("pontos heroicos ≥ 0", () => { s().adjustHeroPoints(-5); expect(s().f.play.pontosHeroicos).toBe(0); });
  it("importFicha usa mergeDefaults", () => { s().importFicha({ concept:{name:"Imp"}, play:{} }); expect(s().f.concept.name).toBe("Imp"); expect(s().f.play.pontosHeroicos).toBe(1); });
});
