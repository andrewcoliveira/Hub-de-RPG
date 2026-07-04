import { describe, it, expect } from "vitest";
import { defaultFicha, mergeDefaults, loadFrom } from "@/engine/migrate";

describe("merge/migração", () => {
  it("defaultFicha tem schemaVersion 2 e sub-objetos", () => { const f = defaultFicha(); expect(f.schemaVersion).toBe(2); expect(f.play.pontosHeroicos).toBe(1); expect(f.stories.length).toBe(1); });
  it("mergeDefaults preenche sub-objetos vazios (bug v2)", () => {
    const m = mergeDefaults({ stories: [], play: {}, sorcery: {}, finalTouches: {} });
    expect(m.play.pontosHeroicos).toBe(1); expect(m.play.favor).toBe(2);
    expect(Array.isArray(m.sorcery.powers)).toBe(true); expect(m.stories.length).toBe(1);
  });
  it("migra v1 (sem campos v2)", () => {
    const store: Record<string,string> = { "setimoMar.ficha.v1": JSON.stringify({ concept:{name:"Velho"}, nation:"avalon", traits:{vigor:3,finesse:2,determinacao:2,argucia:2,panache:2} }) };
    const f = loadFrom(k => store[k] ?? null)!;
    expect(f.concept.name).toBe("Velho"); expect(f.nation).toBe("avalon"); expect(f.schemaVersion).toBe(2); expect(f.play.pontosHeroicos).toBe(1);
  });
  it("mergeDefaults normaliza itens de stories (nunca passos undefined)", () => {
    const m = mergeDefaults({ stories: [{}] });
    expect(Array.isArray(m.stories[0].passos)).toBe(true);
  });
});
