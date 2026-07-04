import { describe, it, expect } from "vitest";
import { TRAITS, SKILLS, NATIONS, SORCERY, SOCIETIES, DUELING_STYLES, MANEUVERS, STORY_PRESETS, ADVANTAGES } from "@/engine";

describe("dados portados", () => {
  it("5 atributos, 16 perícias", () => { expect(TRAITS).toHaveLength(5); expect(SKILLS).toHaveLength(16); });
  it("10 nações", () => { expect(Object.keys(NATIONS)).toHaveLength(10); });
  it("feitiçarias incluem laerdom (Vesten)", () => { expect(SORCERY.laerdom).toBeTruthy(); expect(SORCERY.glamour.menores.length).toBeGreaterThan(0); });
  it("10 sociedades; novusOrdo heroisNao", () => { expect(Object.keys(SOCIETIES)).toHaveLength(10); expect(SOCIETIES.novusOrdo.heroisNao).toBe(true); });
  it("12 estilos de duelo, 6 manobras", () => { expect(Object.keys(DUELING_STYLES).length).toBeGreaterThanOrEqual(12); expect(MANEUVERS.length).toBeGreaterThanOrEqual(6); });
  it("8 pontos de partida com vendeta", () => { expect(Object.keys(STORY_PRESETS)).toHaveLength(8); expect(STORY_PRESETS.vendeta).toBeTruthy(); });
  it("vantagem feiticaria e academiaduelista existem", () => { expect(ADVANTAGES.feiticaria).toBeTruthy(); expect(ADVANTAGES.academiaduelista).toBeTruthy(); });
});
