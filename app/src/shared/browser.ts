// ══════════════════════════════════════════════════════════════════
//  Utilidades de navegador compartilhadas (armazenamento, área de
//  transferência, download, movimento reduzido).
// ══════════════════════════════════════════════════════════════════

/** Lê JSON do localStorage; devolve `fallback` se não houver ou estiver inválido. */
export function storeGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function storeSet(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem storage */
  }
}

export function storeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* sem storage */
  }
}

/** Copia texto; usa execCommand como reserva em navegadores sem a Clipboard API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Baixa `data` como arquivo JSON. */
export function downloadJson(fileName: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** "Nome do Herói" → "nome-do-heroi" (para nomes de arquivo). */
export function slugify(text: string, fallback = "arquivo"): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return slug || fallback;
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Inteiro aleatório de 1 a `die`. */
export const rollDie = (die: number, rng: () => number = Math.random): number =>
  Math.floor(rng() * die) + 1;
