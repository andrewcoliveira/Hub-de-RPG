// ══════════════════════════════════════════════════════════════════
//  Ficha de Ordem — estado só de interface + peças visuais pequenas
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { create } from "zustand";
import { prefersReducedMotion } from "@/shared/browser";
import { ATTRS, attrFinal, elementLabel, type Attr, type Element, type OrdemState, type StepKey } from "../engine";
import { useFicha } from "../store";

interface UiState {
  sheetOpen: boolean;
  /** Espaço de poder com a lista de escolha aberta ("p0", "v", "origin", "inc"…). */
  openPicker: string | null;
  ritualCircle: number | "all";
  ritualElement: Element | "all";
  ritualSearch: string;
  onlyKnown: boolean;
  skillFilter: "all" | "trained" | "untrained";
  /** Rolar até o painel de detalhe ao escolher origem/classe. */
  scrollDetail: boolean;
}

export const useUi = create<UiState>(() => ({
  sheetOpen: false,
  openPicker: null,
  ritualCircle: "all",
  ritualElement: "all",
  ritualSearch: "",
  onlyKnown: false,
  skillFilter: "all",
  scrollDetail: false,
}));

/** Vai para uma etapa: atualiza a URL (#etapa), rola e foca o título. */
export function goTo(key: StepKey): void {
  const { step, setStep } = useFicha.getState();
  useUi.setState({ sheetOpen: false, openPicker: null });
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
export function useChangedAttrs(s: OrdemState): Set<Attr> {
  const prev = useRef<Partial<Record<Attr, number>> | null>(null);
  const now = Object.fromEntries(ATTRS.map((a) => [a.key, attrFinal(s, a.key)])) as Record<Attr, number>;
  const changed = new Set<Attr>();
  if (prev.current) ATTRS.forEach((a) => { if (prev.current![a.key] !== now[a.key]) changed.add(a.key); });
  useEffect(() => { prev.current = now; });
  return changed;
}

/** Painel de detalhe com animação de entrada só quando o item escolhido muda. */
export function useDetailPanel(key: string | null) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(key);
  const entering = last.current !== key;
  useEffect(() => {
    if (entering && key && useUi.getState().scrollDetail) revealSoon(ref.current);
    last.current = key;
    useUi.setState({ scrollDetail: false });
  });
  return { ref, entering };
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

export function ElementTag({ el, children }: { el: Element; children?: ReactNode }) {
  return <span className={`el-tag el-${el}`}>{children ?? elementLabel(el)}</span>;
}

export function Issues({ list }: { list: string[] }) {
  if (!list.length) return null;
  return <ul className="issues">{list.map((i) => <li key={i}>{i}</li>)}</ul>;
}

export const ord = (n: number) => `${n}º`;
