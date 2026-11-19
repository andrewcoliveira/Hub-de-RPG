// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Estado da ficha (Zustand)
//  Cada ação trabalha numa cópia ("rascunho") do estado e publica a cópia.
//  Salvo em localStorage["sacramento-ficha-v1"] como { state, step }.
// ══════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { storeGet, storeSet } from "@/shared/browser";
import { blankState, isStepKey, sanitizeState, type SacramentoState, type StepKey } from "./engine";

export const STORE_KEY = "sacramento-ficha-v1";

interface FichaStore {
  s: SacramentoState;
  step: StepKey;
  /** Aplica `fn` numa cópia do estado; publica a cópia se `fn` não devolver false. */
  update: <T>(fn: (draft: SacramentoState) => T) => T;
  replace: (s: SacramentoState) => void;
  setStep: (step: StepKey) => void;
}

function initial(): Pick<FichaStore, "s" | "step"> {
  const saved = storeGet<{ state?: unknown; step?: unknown } | null>(STORE_KEY, null);
  const hash = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
  return {
    s: saved?.state ? sanitizeState(saved.state) : blankState(),
    step: isStepKey(hash) ? hash : isStepKey(saved?.step) ? saved.step : "conceito",
  };
}

export const useFicha = create<FichaStore>((set, get) => ({
  ...initial(),
  update: (fn) => {
    const draft = structuredClone(get().s);
    const result = fn(draft);
    if (result !== false) set({ s: draft });
    return result;
  },
  replace: (s) => set({ s }),
  setStep: (step) => set({ step }),
}));

let timer: ReturnType<typeof setTimeout> | undefined;
useFicha.subscribe(({ s, step }) => {
  clearTimeout(timer);
  timer = setTimeout(() => storeSet(STORE_KEY, { state: s, step }), 200);
});

/** Atalho para ler o estado da ficha num componente. */
export const useSacramento = () => useFicha((x) => x.s);
