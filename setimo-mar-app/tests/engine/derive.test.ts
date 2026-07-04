import { describe, it, expect } from "vitest";
import { defaultFicha } from "@/engine/migrate";
import * as D from "@/engine/derive";

function novo() { return defaultFicha(); }
describe("derivações", () => {
  it("orçamentos iniciais", () => { const f = novo(); expect(D.traitFreeLeft(f)).toBe(2); expect(D.skillPointsLeft(f)).toBe(10); expect(D.advantagePointsLeft(f)).toBe(5); });
  it("bônus de nação não gasta livre", () => { const f = novo(); f.nation = "avalon"; f.nationTrait = "finesse"; expect(D.traitFinal(f, "finesse")).toBe(3); expect(D.traitFreeLeft(f)).toBe(2); });
  it("formações empilham perícias", () => { const f = novo(); f.backgrounds = ["duelista", "soldado"]; expect(D.skillFinal(f, "armas")).toBe(2); });
  it("vantagens grátis das formações", () => { const f = novo(); f.backgrounds = ["duelista", "soldado"]; expect([...D.freeAdvantages(f)].sort()).toEqual(["esgrimista", "espiritovaloroso"]); });
  it("orçamento de feitiçaria", () => { const f = novo(); f.advantages = ["feiticaria"]; expect(D.sorceryBudget(f)).toEqual({ maiores: 1, menores: 2 }); });
  it("idiomas = argúcia; fortuna persiste com rico", () => { const f = novo(); f.nation = "vodacce"; f.nationTrait = "argucia"; expect(D.numIdiomas(f)).toBe(3); expect(D.fortunaPersiste(f)).toBe(false); f.advantages = ["rico"]; expect(D.fortunaPersiste(f)).toBe(true); });
  it("completeness lista faltas", () => { const f = novo(); expect(D.completeness(f).length).toBeGreaterThan(0); });
});
