// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Estado da ficha (Zustand)
//  Cada ação trabalha numa cópia ("rascunho") do estado e publica a cópia,
//  então o estado anterior nunca é alterado. Salvo em
//  localStorage["jade-ficha-v1"] como { state, step } — o mesmo formato da
//  versão anterior do site, para não perder fichas já criadas.
// ══════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { storeGet, storeSet } from "@/shared/browser";
import { blankState, isStepKey, sanitizeState, type JadeState, type StepKey } from "./engine";

export const STORE_KEY = "jade-ficha-v1";

interface FichaStore {
  s: JadeState;
  step: StepKey;
  /** Aplica `fn` numa cópia do estado; publica a cópia se `fn` não devolver false. */
  update: <T>(fn: (draft: JadeState) => T) => T;
  replace: (s: JadeState) => void;
  setStep: (step: StepKey) => void;
}

function initial(): Pick<FichaStore, "s" | "step"> {
  const saved = storeGet<{ state?: unknown; step?: unknown } | null>(STORE_KEY, null);
  const hash = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
  return {
    s: saved?.state ? sanitizeState(saved.state) : blankState(),
    step: isStepKey(hash) ? hash : isStepKey(saved?.step) ? saved.step : "atributos",
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
export const useJade = () => useFicha((x) => x.s);
