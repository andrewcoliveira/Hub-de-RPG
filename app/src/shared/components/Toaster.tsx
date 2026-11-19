// ══════════════════════════════════════════════════════════════════
//  Avisos rápidos ("toasts"). Chame toast("…") de qualquer lugar e
//  renderize <Toaster/> uma vez na página. O visual vem das classes
//  .toast-wrap / .toast do CSS de cada sistema.
// ══════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { create } from "zustand";

interface ToastItem {
  id: number;
  message: string;
  leaving: boolean;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, ms: number) => void;
}

let nextId = 1;

const useToasts = create<ToastState>((set, get) => ({
  items: [],
  push: (message, ms) => {
    const id = nextId++;
    set({ items: [...get().items, { id, message, leaving: false }].slice(-3) });
    setTimeout(() => {
      set({ items: get().items.map((t) => (t.id === id ? { ...t, leaving: true } : t)) });
      setTimeout(() => set({ items: get().items.filter((t) => t.id !== id) }), 250);
    }, ms);
  },
}));

export function toast(message: string, ms = 2600): void {
  useToasts.getState().push(message, ms);
}

export function Toaster() {
  const items = useToasts((s) => s.items);
  // Limpa avisos pendentes ao desmontar (ex.: testes).
  useEffect(() => () => useToasts.setState({ items: [] }), []);
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast${t.leaving ? " is-leaving" : ""}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
