// ══════════════════════════════════════════════════════════════════
//  Tema claro/escuro compartilhado por todas as páginas do Hub.
//  A escolha fica em localStorage["hub-theme"]; sem escolha salva, segue o
//  sistema operacional. Cada HTML aplica o tema salvo num <script> inline no
//  <head> (ver THEME_BOOT_SCRIPT) para não "piscar" o tema errado.
// ══════════════════════════════════════════════════════════════════

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "hub-theme";

const listeners = new Set<() => void>();

function systemTheme(): Theme {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Tema salvo pelo usuário, ou null se ele nunca escolheu. */
export function savedTheme(): Theme | null {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Tema efetivo: o salvo, senão o do sistema. */
export function readTheme(): Theme {
  return savedTheme() ?? systemTheme();
}

/** Salva, aplica no <html data-theme> e avisa quem estiver ouvindo. */
export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* sem storage: vale só para esta página */
  }
  document.documentElement.setAttribute("data-theme", theme);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** [tema atual, alternar] — para botões de tema em qualquer página. */
export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  return [theme, () => saveTheme(theme === "dark" ? "light" : "dark")];
}
