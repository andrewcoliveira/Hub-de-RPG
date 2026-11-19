// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Estado do gerador de recompensas
//  Salvo em localStorage["jade-gerador-v1"] no mesmo formato da versão
//  anterior do site ({ nd, qty, treasure, feed, counter }).
// ══════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { storeGet, storeSet } from "@/shared/browser";
import { ND_LIST } from "./engine/tables";
import { generateReward, type Reward } from "./engine/generator";

export const STORE_KEY = "jade-gerador-v1";
export const MAX_FEED = 60;
export const MAX_QTY = 20;

export interface FeedEntry extends Reward {
  id: string;
  /** Número sequencial da rolagem na sessão. */
  n: number;
  at: number;
}

interface Saved { nd?: string; qty?: number; treasure?: number; feed?: FeedEntry[]; counter?: number }

export interface GeradorState {
  nd: string;
  qty: number;
  treasure: 1 | 2 | 3;
  feed: FeedEntry[];
  counter: number;
  /** ids das entradas recém-roladas (destaque "Novo"). */
  fresh: string[];
  setNd: (nd: string) => void;
  stepNd: (delta: number) => void;
  setQty: (qty: number) => void;
  setTreasure: (t: 1 | 2 | 3) => void;
  roll: () => FeedEntry;
  remove: (id: string) => void;
  clear: () => void;
}

function initial(): Pick<GeradorState, "nd" | "qty" | "treasure" | "feed" | "counter"> {
  const saved = storeGet<Saved>(STORE_KEY, {}) ?? {};
  const urlNd = typeof location !== "undefined" ? new URLSearchParams(location.search).get("nd") : null;
  const nd = [urlNd, saved.nd, "1"].find((x): x is string => !!x && ND_LIST.includes(x))!;
  const feed = Array.isArray(saved.feed) ? saved.feed : [];
  return {
    nd,
    qty: Math.min(MAX_QTY, Math.max(1, Number(saved.qty) || 1)),
    treasure: ([1, 2, 3] as const).find((t) => t === Number(saved.treasure)) ?? 1,
    feed,
    counter: Number(saved.counter) || feed.reduce((m, e) => Math.max(m, e.n || 0), 0),
  };
}

export const useGerador = create<GeradorState>((set, get) => ({
  ...initial(),
  fresh: [],
  setNd: (nd) => { if (ND_LIST.includes(nd)) set({ nd }); },
  stepNd: (delta) => {
    const i = Math.min(ND_LIST.length - 1, Math.max(0, ND_LIST.indexOf(get().nd) + delta));
    set({ nd: ND_LIST[i] });
  },
  setQty: (qty) => set({ qty: Math.min(MAX_QTY, Math.max(1, qty)) }),
  setTreasure: (treasure) => set({ treasure }),
  roll: () => {
    const { nd, qty, treasure, feed, counter } = get();
    const n = counter + 1;
    const entry: FeedEntry = { id: `${Date.now()}-${n}`, n, at: Date.now(), ...generateReward(nd, { creatures: qty, treasure }) };
    set({ feed: [entry, ...feed].slice(0, MAX_FEED), counter: n, fresh: [entry.id] });
    return entry;
  },
  remove: (id) => set({ feed: get().feed.filter((e) => e.id !== id) }),
  clear: () => set({ feed: [], counter: 0, fresh: [] }),
}));

// Persiste (formato antigo) e mantém ?nd= na URL
useGerador.subscribe((s) => {
  storeSet(STORE_KEY, { nd: s.nd, qty: s.qty, treasure: s.treasure, feed: s.feed.slice(0, MAX_FEED), counter: s.counter });
  if (typeof history !== "undefined") {
    const url = new URL(location.href);
    if (url.searchParams.get("nd") !== s.nd) {
      url.searchParams.set("nd", s.nd);
      history.replaceState(null, "", url);
    }
  }
});
