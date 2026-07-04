// ══════════════════════════════════════════════════════════════════
//  7º MAR — Export/Import (round-trip de serialização)
//  Não testa File/DOM: testa que serializar `f` (JSON) e reimportar via
//  `importFicha` (que usa mergeDefaults) reproduz a ficha original,
//  sem perder sub-objetos (bug corrigido na v2 — Task 4).
// ══════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import { useFicha } from "@/store/ficha";

const s = () => useFicha.getState();

beforeEach(() => s().reset());

describe("export/import — round-trip via JSON + mergeDefaults", () => {
  it("reproduz a ficha original após serializar e reimportar", () => {
    // Monta uma ficha não-trivial para garantir que os campos realmente viajam.
    s().setConcept("name", "Isabella");
    s().setConcept("player", "Ana");
    s().setConcept("concept", "Espadachim errante");
    s().selectNation("avalon");
    s().setNationTrait("finesse");
    s().adjustTrait("vigor", 1);
    s().toggleBackground("duelista");
    s().adjustSkill("armas", 2);
    s().toggleAdvantage("feiticaria");
    s().setSchool("glamour");
    s().addReputacao("Honrado");
    s().addIdioma("Théan");
    s().adjustWound("ferimentosDramaticos", 1);
    s().adjustHeroPoints(1);

    const original = s().f;

    // Serializa exatamente como o export faria (JSON.stringify/parse).
    const serialized = JSON.parse(JSON.stringify(original));

    // Reimporta via a mesma ação que a TopBar vai usar.
    s().importFicha(serialized);

    const resultado = s().f;

    // Campos-chave devem ser idênticos ao original.
    expect(resultado.concept).toEqual(original.concept);
    expect(resultado.nation).toBe(original.nation);
    expect(resultado.nationTrait).toBe(original.nationTrait);
    expect(resultado.traits).toEqual(original.traits);
    expect(resultado.backgrounds).toEqual(original.backgrounds);
    expect(resultado.skills).toEqual(original.skills);
    expect(resultado.advantages).toEqual(original.advantages);
    expect(resultado.sorcery).toEqual(original.sorcery);
    expect(resultado.finalTouches).toEqual(original.finalTouches);
    expect(resultado.play).toEqual(original.play);
    expect(resultado.stories).toEqual(original.stories);
    expect(resultado.arcana).toEqual(original.arcana);

    // Nenhum sub-objeto deve ficar undefined (garantia do mergeDefaults).
    expect(resultado.play).toBeTruthy();
    expect(resultado.sorcery).toBeTruthy();
    expect(resultado.finalTouches).toBeTruthy();
    expect(Array.isArray(resultado.stories)).toBe(true);
    expect(Array.isArray(resultado.sorcery.powers)).toBe(true);
  });

  it("mergeDefaults preenche sub-objetos ausentes de um JSON parcial (paridade com v2)", () => {
    s().importFicha({ concept: { name: "Parcial" }, stories: [], play: {}, sorcery: {}, finalTouches: {} });
    const f = s().f;
    expect(f.concept.name).toBe("Parcial");
    expect(f.play.pontosHeroicos).toBe(1);
    expect(f.play.favor).toBe(2);
    expect(Array.isArray(f.sorcery.powers)).toBe(true);
    expect(f.stories.length).toBe(1);
    expect(f.finalTouches.reputacoes).toEqual([]);
  });
});
