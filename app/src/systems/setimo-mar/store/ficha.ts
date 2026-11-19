// ══════════════════════════════════════════════════════════════════
//  7º MAR — Store Zustand (estado + ações + persistência)
//  Porte imutável e tipado de scripts/setimo-mar/{create,play,app}.js
//  Todas as ações computam um novo `f` sem mutar o anterior.
// ══════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Ficha, TraitKey, NationKey, SchoolKey } from "@/systems/setimo-mar/engine/types";
import { defaultFicha, mergeDefaults, loadFrom } from "@/systems/setimo-mar/engine/migrate";
import {
  traitFreeLeft,
  skillPointsLeft,
  freeAdvantages,
  advantagePointsLeft,
  sorceryBudget,
  powerRank,
} from "@/systems/setimo-mar/engine/derive";
import { CREATION } from "@/systems/setimo-mar/engine/creation";
import { NATIONS, ADVANTAGES, SOCIETIES } from "@/systems/setimo-mar/engine/data";
import { visibleTabs } from "@/systems/setimo-mar/lib/tabs";
import { readTheme, saveTheme, type Theme } from "@/shared/theme";

const STORAGE_KEY = "setimoMar.ficha.v2";

function clamp(v: number, min: number, max: number | null): number {
  return Math.max(min, max == null ? v : Math.min(v, max));
}

export type Mode = "criar" | "jogo";
export type { Theme };

export interface FichaState {
  f: Ficha;
  mode: Mode;
  activeTab: string;
  theme: Theme;

  // Conceito & Nação
  setConcept: (field: keyof Ficha["concept"], value: string) => void;
  selectNation: (key: NationKey) => void;
  setNationTrait: (traitKey: TraitKey) => void;

  // Atributos
  adjustTrait: (key: TraitKey, delta: number) => void;

  // Formações
  toggleBackground: (key: string) => void;

  // Perícias
  adjustSkill: (key: string, delta: number) => void;

  // Vantagens
  toggleAdvantage: (key: string) => void;

  // Arcanos
  setArcana: (type: "virtude" | "hubris", key: string) => void;

  // Feitiçaria
  setSchool: (key: SchoolKey) => void;
  toggleSorceryPower: (key: string) => void;

  // Duelo
  setStyle: (key: string) => void;

  // Histórias
  applyStoryPreset: (label: string, final: string, primeiroPasso: string) => void;
  setStoryField: (i: number, field: "nome" | "final" | "recompensa", val: string) => void;
  addStoryStep: (i: number, texto: string) => void;
  toggleStoryStep: (i: number, j: number) => void;

  // Sociedades
  setSociety: (key: string) => void;

  // Toques finais
  addReputacao: (t: string) => void;
  removeReputacao: (i: number) => void;
  addIdioma: (t: string) => void;
  removeIdioma: (i: number) => void;
  setFortunaInicial: (n: number) => void;

  // Play (Modo Jogo)
  adjustWound: (field: "ferimentos" | "ferimentosDramaticos", delta: number) => void;
  adjustHeroPoints: (delta: number) => void;
  adjustFavor: (delta: number) => void;
  setFortuna: (n: number) => void;
  setNotas: (t: string) => void;

  // Import/Export/Reset
  importFicha: (json: unknown) => void;
  reset: () => void;

  // Modo & navegação
  setMode: (mode: Mode) => void;
  goTab: (id: string) => void;
  nextTab: () => void;
  prevTab: () => void;

  // Tema
  setTheme: (theme: Theme) => void;
}

export const useFicha = create<FichaState>()(
  persist(
    (set) => ({
      f: defaultFicha(),
      mode: "criar",
      activeTab: "conceito",
      theme: readTheme(),

      setConcept: (field, value) =>
        set((state) => ({
          f: { ...state.f, concept: { ...state.f.concept, [field]: value } },
        })),

      selectNation: (key) =>
        set((state) => {
          const nation = NATIONS[key];
          const valid: readonly TraitKey[] = nation ? nation.traits : [];
          const nationTrait = state.f.nationTrait && valid.includes(state.f.nationTrait)
            ? state.f.nationTrait
            : null;
          return { f: { ...state.f, nation: key, nationTrait } };
        }),

      setNationTrait: (traitKey) =>
        set((state) => ({
          f: {
            ...state.f,
            nationTrait: state.f.nationTrait === traitKey ? null : traitKey,
          },
        })),

      adjustTrait: (key, delta) =>
        set((state) => {
          const cur = state.f.traits[key];
          const next = cur + delta;
          if (next < CREATION.traitBase) return state;
          if (next > CREATION.traitCreationMax) return state;
          if (delta > 0 && traitFreeLeft(state.f) <= 0) return state;
          return { f: { ...state.f, traits: { ...state.f.traits, [key]: next } } };
        }),

      toggleBackground: (key) =>
        set((state) => {
          const i = state.f.backgrounds.indexOf(key);
          let backgrounds: string[];
          if (i >= 0) {
            backgrounds = state.f.backgrounds.filter((b) => b !== key);
          } else {
            if (state.f.backgrounds.length >= CREATION.backgroundsToPick) return state;
            backgrounds = [...state.f.backgrounds, key];
          }
          return { f: { ...state.f, backgrounds } };
        }),

      adjustSkill: (key, delta) =>
        set((state) => {
          const cur = state.f.skills[key] ?? 0;
          const next = cur + delta;
          if (next < 0) return state;
          if (next > CREATION.skillCreationMax) return state;
          if (delta > 0 && skillPointsLeft(state.f) <= 0) return state;
          return { f: { ...state.f, skills: { ...state.f.skills, [key]: next } } };
        }),

      toggleAdvantage: (key) =>
        set((state) => {
          const free = freeAdvantages(state.f);
          const i = state.f.advantages.indexOf(key);
          let advantages: string[];
          if (i >= 0) {
            advantages = state.f.advantages.filter((a) => a !== key);
          } else {
            const a = ADVANTAGES[key];
            const cost = free.has(key) ? 0 : (a ? a.cost : 0);
            if (cost > advantagePointsLeft(state.f)) return state;
            advantages = [...state.f.advantages, key];
          }
          return { f: { ...state.f, advantages } };
        }),

      setArcana: (type, key) =>
        set((state) => {
          const other = type === "virtude" ? "hubris" : "virtude";
          if (state.f.arcana[other] === key) return state; // cartas diferentes
          const nextVal = state.f.arcana[type] === key ? null : key;
          return { f: { ...state.f, arcana: { ...state.f.arcana, [type]: nextVal } } };
        }),

      setSchool: (key) =>
        set((state) => ({
          f: { ...state.f, sorcery: { school: key, powers: [] } },
        })),

      toggleSorceryPower: (key) =>
        set((state) => {
          const i = state.f.sorcery.powers.indexOf(key);
          let powers: string[];
          if (i >= 0) {
            powers = state.f.sorcery.powers.filter((k) => k !== key);
          } else {
            const rank = powerRank(state.f, key);
            if (!rank) return state;
            const budget = sorceryBudget(state.f);
            const chosen = state.f.sorcery.powers.filter((k) => powerRank(state.f, k) === rank).length;
            const budgetKey = rank === "maior" ? "maiores" : "menores";
            if (chosen >= budget[budgetKey]) return state;
            powers = [...state.f.sorcery.powers, key];
          }
          return { f: { ...state.f, sorcery: { ...state.f.sorcery, powers } } };
        }),

      setStyle: (key) =>
        set((state) => ({
          f: { ...state.f, dueling: { style: state.f.dueling.style === key ? null : key } },
        })),

      applyStoryPreset: (label, final, primeiroPasso) =>
        set((state) => {
          const stories = [...state.f.stories];
          stories[0] = { nome: label, final, recompensa: "", passos: [{ texto: primeiroPasso, feito: false }] };
          return { f: { ...state.f, stories } };
        }),

      setStoryField: (i, field, val) =>
        set((state) => {
          const stories = state.f.stories.map((story, idx) =>
            idx === i ? { ...story, [field]: val } : story
          );
          return { f: { ...state.f, stories } };
        }),

      addStoryStep: (i, texto) =>
        set((state) => {
          if (!texto) return state;
          const stories = state.f.stories.map((story, idx) =>
            idx === i ? { ...story, passos: [...story.passos, { texto, feito: false }] } : story
          );
          return { f: { ...state.f, stories } };
        }),

      toggleStoryStep: (i, j) =>
        set((state) => {
          const stories = state.f.stories.map((story, idx) => {
            if (idx !== i) return story;
            const passos = story.passos.map((p, pj) => (pj === j ? { ...p, feito: !p.feito } : p));
            return { ...story, passos };
          });
          return { f: { ...state.f, stories } };
        }),

      setSociety: (key) =>
        set((state) => {
          if (SOCIETIES[key]?.heroisNao) return state;
          const nextKey = state.f.society.key === key ? null : key;
          return { f: { ...state.f, society: { key: nextKey } } };
        }),

      addReputacao: (t) =>
        set((state) => {
          const trimmed = (t || "").trim();
          if (!trimmed) return state;
          return {
            f: {
              ...state.f,
              finalTouches: {
                ...state.f.finalTouches,
                reputacoes: [...state.f.finalTouches.reputacoes, trimmed],
              },
            },
          };
        }),

      removeReputacao: (i) =>
        set((state) => ({
          f: {
            ...state.f,
            finalTouches: {
              ...state.f.finalTouches,
              reputacoes: state.f.finalTouches.reputacoes.filter((_, idx) => idx !== i),
            },
          },
        })),

      addIdioma: (t) =>
        set((state) => {
          const trimmed = (t || "").trim();
          if (!trimmed) return state;
          return {
            f: {
              ...state.f,
              finalTouches: {
                ...state.f.finalTouches,
                idiomas: [...state.f.finalTouches.idiomas, trimmed],
              },
            },
          };
        }),

      removeIdioma: (i) =>
        set((state) => ({
          f: {
            ...state.f,
            finalTouches: {
              ...state.f.finalTouches,
              idiomas: state.f.finalTouches.idiomas.filter((_, idx) => idx !== i),
            },
          },
        })),

      setFortunaInicial: (n) =>
        set((state) => ({
          f: { ...state.f, finalTouches: { ...state.f.finalTouches, fortunaInicial: +n || 0 } },
        })),

      adjustWound: (field, delta) =>
        set((state) => {
          const max = field === "ferimentosDramaticos" ? 4 : null;
          const next = clamp((state.f.play[field] || 0) + delta, 0, max);
          return { f: { ...state.f, play: { ...state.f.play, [field]: next } } };
        }),

      adjustHeroPoints: (delta) =>
        set((state) => ({
          f: { ...state.f, play: { ...state.f.play, pontosHeroicos: clamp(state.f.play.pontosHeroicos + delta, 0, null) } },
        })),

      adjustFavor: (delta) =>
        set((state) => ({
          f: { ...state.f, play: { ...state.f.play, favor: clamp(state.f.play.favor + delta, 0, null) } },
        })),

      setFortuna: (n) =>
        set((state) => ({ f: { ...state.f, play: { ...state.f.play, fortuna: +n || 0 } } })),

      setNotas: (t) =>
        set((state) => ({ f: { ...state.f, play: { ...state.f.play, notas: t } } })),

      importFicha: (json) => set({ f: mergeDefaults(json) }),

      reset: () => set({ f: defaultFicha() }),

      setMode: (mode) => set({ mode }),

      goTab: (id) => set({ activeTab: id }),

      nextTab: () =>
        set((state) => {
          const ids = visibleTabs(state.f).map((t) => t.id);
          const i = ids.indexOf(state.activeTab);
          const cur = i >= 0 ? i : 0;
          const next = Math.max(0, Math.min(cur + 1, ids.length - 1));
          return { activeTab: ids[next] ?? state.activeTab };
        }),

      prevTab: () =>
        set((state) => {
          const ids = visibleTabs(state.f).map((t) => t.id);
          const i = ids.indexOf(state.activeTab);
          const cur = i >= 0 ? i : 0;
          const prev = Math.max(0, Math.min(cur - 1, ids.length - 1));
          return { activeTab: ids[prev] ?? state.activeTab };
        }),

      // O tema é o mesmo do Hub inteiro (localStorage["hub-theme"]).
      setTheme: (theme) => {
        saveTheme(theme);
        set({ theme });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      partialize: (state) => ({ f: state.f }),
      migrate: (persisted) => ({ f: mergeDefaults((persisted as { f?: unknown } | undefined)?.f ?? persisted) }),
      merge: (persisted, current) => {
        const persistedState = persisted as { f?: unknown; theme?: Theme } | undefined;
        const persistedF = persistedState?.f;
        const theme = current.theme; // vem do tema compartilhado (hub-theme)
        if (persistedF) {
          return { ...current, f: mergeDefaults(persistedF), theme };
        }
        // Sem v2 persistido: tenta migrar do v1 (localStorage) antes de cair no default.
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
          const migrated = loadFrom((k) => window.localStorage.getItem(k));
          if (migrated) return { ...current, f: migrated, theme };
        }
        return { ...current, theme };
      },
    }
  )
);
