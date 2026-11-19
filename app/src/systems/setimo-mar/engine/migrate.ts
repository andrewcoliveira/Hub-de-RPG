// ══════════════════════════════════════════════════════════════════
//  7º MAR — Defaults, merge profundo e migração (núcleo puro)
//  Porte de scripts/setimo-mar/state.js (smDefaultState/smMergeDefaults/smLoad)
// ══════════════════════════════════════════════════════════════════

import { SKILLS } from "./data";
import type { Ficha } from "./types";

const SM_STORAGE_KEY = "setimoMar.ficha.v2";
const SM_STORAGE_KEY_V1 = "setimoMar.ficha.v1";

// ── Estado padrão ─────────────────────────────────────────────────────
export function defaultFicha(): Ficha {
  const skills: Record<string, number> = {};
  SKILLS.forEach((s) => { skills[s.key] = 0; });
  return {
    schemaVersion: 2,
    concept: { name: "", player: "", concept: "", religion: "" },
    nation: null,
    nationTrait: null,
    traits: { vigor: 2, finesse: 2, determinacao: 2, argucia: 2, panache: 2 },
    backgrounds: [],
    skills,
    advantages: [],
    arcana: { virtude: null, hubris: null },
    sorcery: { school: null, powers: [] },
    dueling: { style: null },
    society: { key: null },
    stories: [{ nome: "", final: "", recompensa: "", passos: [] }],
    finalTouches: { reputacoes: [], idiomas: [], fortunaInicial: 0 },
    play: { ferimentos: 0, ferimentosDramaticos: 0, pontosHeroicos: 1, fortuna: 0, favor: 2, notas: "" },
  };
}

// ── Narrowing seguro para payload desconhecido ─────────────────────────
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecordOrEmpty(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

// ── Merge profundo robusto a payload parcial ───────────────────────────
// Corrige o bug da v1: nunca usar Object.assign raso sobre os sub-objetos.
// As referências dos sub-objetos default são salvas ANTES do Object.assign
// de nível superior (que substituiria base.* pelas referências de data.*
// quando presentes, mesmo vazias) — reexaminar base.x depois do assign
// mesclaria o objeto com ele mesmo e perderia os defaults.
export function mergeDefaults(data: unknown): Ficha {
  const base = defaultFicha();
  const src = asRecordOrEmpty(data);

  const defPlay = base.play;
  const defSorcery = base.sorcery;
  const defDueling = base.dueling;
  const defSociety = base.society;
  const defFinalTouches = base.finalTouches;
  const defStories = base.stories;
  const defConcept = base.concept;
  const defArcana = base.arcana;
  const defTraits = base.traits;
  const defSkills = base.skills;

  const out = Object.assign(base, src) as Ficha;

  out.concept = Object.assign({}, defConcept, asRecordOrEmpty(src.concept));
  out.traits = Object.assign({}, defTraits, asRecordOrEmpty(src.traits));
  out.arcana = Object.assign({}, defArcana, asRecordOrEmpty(src.arcana));
  out.sorcery = Object.assign({}, defSorcery, asRecordOrEmpty(src.sorcery));
  out.dueling = Object.assign({}, defDueling, asRecordOrEmpty(src.dueling));
  out.society = Object.assign({}, defSociety, asRecordOrEmpty(src.society));
  out.finalTouches = Object.assign({}, defFinalTouches, asRecordOrEmpty(src.finalTouches));
  out.play = Object.assign({}, defPlay, asRecordOrEmpty(src.play));

  const defStory = defStories[0];
  const srcStories = src.stories;
  out.stories = Array.isArray(srcStories) && srcStories.length > 0
    ? srcStories.map((story) => {
        const s = asRecordOrEmpty(story);
        const passos = Array.isArray(s.passos) ? (s.passos as Ficha["stories"][number]["passos"]) : defStory.passos;
        return {
          nome: typeof s.nome === "string" ? s.nome : defStory.nome,
          final: typeof s.final === "string" ? s.final : defStory.final,
          recompensa: typeof s.recompensa === "string" ? s.recompensa : defStory.recompensa,
          passos,
        };
      })
    : defStories;

  out.skills = Object.assign({}, defSkills, asRecordOrEmpty(src.skills));
  SKILLS.forEach((s) => {
    if (out.skills[s.key] == null) out.skills[s.key] = 0;
  });

  if (!Array.isArray(out.backgrounds)) out.backgrounds = [];
  if (!Array.isArray(out.advantages)) out.advantages = [];

  out.schemaVersion = 2;
  return out;
}

// ── Carregamento / migração v1 → v2 ────────────────────────────────────
export function loadFrom(getItem: (key: string) => string | null): Ficha | null {
  try {
    const rawV2 = getItem(SM_STORAGE_KEY);
    if (rawV2) return mergeDefaults(JSON.parse(rawV2));

    const rawV1 = getItem(SM_STORAGE_KEY_V1);
    if (rawV1) return mergeDefaults(JSON.parse(rawV1));

    return null;
  } catch {
    return null;
  }
}
