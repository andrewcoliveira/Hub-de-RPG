// ══════════════════════════════════════════════════════════════════
//  Ficha do Império — estado só de interface + peças visuais pequenas
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { create } from "zustand";
import { prefersReducedMotion } from "@/shared/browser";
import { ABILITIES, finalValueFor, fmtMod, type AbilityKey, type JadeState, type StepKey } from "../engine";
import { useFicha } from "../store";

interface UiState {
  sheetOpen: boolean;
  /** Valor rolado escolhido, esperando um atributo. */
  pickedRoll: number | null;
  /** Anima os valores recém-rolados. */
  freshRolls: boolean;
  skillFilter: "all" | "class" | "out" | "trained";
  talentCat: string;
  onlyAvail: boolean;
  search: string;
  expanded: string[];
  /** Rolar até o painel de detalhe ao escolher raça/classe. */
  scrollDetail: boolean;
}

export const useUi = create<UiState>(() => ({
  sheetOpen: false,
  pickedRoll: null,
  freshRolls: false,
  skillFilter: "all",
  talentCat: "all",
  onlyAvail: false,
  search: "",
  expanded: [],
  scrollDetail: false,
}));

/** Vai para uma etapa: atualiza a URL (#etapa), rola e foca o título. */
export function goTo(key: StepKey): void {
  const { step, setStep } = useFicha.getState();
  useUi.setState({ sheetOpen: false });
  if (key === step) return;
  setStep(key);
  history.replaceState(null, "", `#${key}`);
  requestAnimationFrame(() => {
    const sec = document.getElementById(`step-${key}`);
    if (!sec) return;
    const top = sec.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.6) {
      sec.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
    document.getElementById(`t-${key}`)?.focus({ preventScroll: true });
  });
}

/** Rola até um painel de detalhe recém-aberto, se estiver fora da tela. */
export function revealSoon(el: HTMLElement | null): void {
  setTimeout(() => {
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.7) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }, 60);
}

/** Atributos cujo valor final mudou desde a última renderização (para o destaque). */
export function useChangedAbilities(s: JadeState): Set<AbilityKey> {
  const prev = useRef<Partial<Record<AbilityKey, number | null>> | null>(null);
  const now = Object.fromEntries(ABILITIES.map((a) => [a.key, finalValueFor(s, a.key)])) as Record<AbilityKey, number | null>;
  const changed = new Set<AbilityKey>();
  if (prev.current) ABILITIES.forEach((a) => { if (prev.current![a.key] !== now[a.key]) changed.add(a.key); });
  useEffect(() => { prev.current = now; });
  return changed;
}

// ── Peças visuais ─────────────────────────────────────────────────

export const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Meter({ label, used, total, note }: { label: string; used: number; total: number; note?: ReactNode }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const cls = used > total ? "is-over" : used === total && total > 0 ? "is-full" : "";
  return (
    <div className={`meter ${cls}`} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} aria-label={label}>
      <div className="meter-head"><span>{label}</span><b>{used} / {total}</b></div>
      <div className="meter-track"><div className="meter-fill" style={{ ["--p" as string]: `${pct}%` }} /></div>
      {note && <div className="meter-note">{note}</div>}
    </div>
  );
}

export function ModTag({ v, suffix = "" }: { v: number; suffix?: string }) {
  if (!v) return null;
  return <span className={`tag ${v > 0 ? "tag-pos" : "tag-neg"}`}>{fmtMod(v)}{suffix}</span>;
}

/** "Nome: descrição" → <b>Nome</b> descrição */
export function Feature({ text }: { text: string }) {
  const i = text.indexOf(": ");
  if (i > 0 && i < 48) return <><b>{text.slice(0, i)}</b> {text.slice(i + 2)}</>;
  return <>{text}</>;
}
