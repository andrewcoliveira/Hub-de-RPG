// ══════════════════════════════════════════════════════════════════
//  Ficha de Sacramento — estado só de interface + peças visuais pequenas
// ══════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { create } from "zustand";
import { prefersReducedMotion } from "@/shared/browser";
import type { ItemCat, SkillList, StepKey } from "../engine";
import { useFicha } from "../store";

interface UiState {
  sheetOpen: boolean;
  skillList: SkillList | "all" | "mine";
  itemCat: ItemCat | "all" | "mine";
  itemSearch: string;
}

export const useUi = create<UiState>(() => ({
  sheetOpen: false,
  skillList: "all",
  itemCat: "armas",
  itemSearch: "",
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

// ── Peças visuais ─────────────────────────────────────────────────

export const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export function Meter({ label, used, total, note, format = String }: { label: string; used: number; total: number; note?: ReactNode; format?: (n: number) => string }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const cls = used > total ? "is-over" : used === total && total > 0 ? "is-full" : "";
  return (
    <div className={`meter ${cls}`} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} aria-label={label}>
      <div className="meter-head"><span>{label}</span><b>{format(used)} / {format(total)}</b></div>
      <div className="meter-track"><div className="meter-fill" style={{ ["--p" as string]: `${pct}%` }} /></div>
      {note && <div className="meter-note">{note}</div>}
    </div>
  );
}

/** Círculo de Vida (caveira) ou de Dor (punho), como na ficha do livro. */
export function CircleIcon({ kind, filled = true }: { kind: "vida" | "dor"; filled?: boolean }) {
  return (
    <svg className={`circ circ-${kind} ${filled ? "" : "is-empty"}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" />
      {kind === "vida" ? (
        <g className="glyph">
          <path d="M12 5.5c-3.3 0-5.5 2.3-5.5 5.2 0 1.8.8 3 2 3.8v2.2h2v-1.3h1v1.3h1v-1.3h1v1.3h2v-2.2c1.2-.8 2-2 2-3.8 0-2.9-2.2-5.2-5.5-5.2z" />
          <circle cx="9.7" cy="10.8" r="1.4" className="hole" />
          <circle cx="14.3" cy="10.8" r="1.4" className="hole" />
        </g>
      ) : (
        <g className="glyph">
          <path d="M8 9.5V8a1.2 1.2 0 0 1 2.4 0v-.5a1.2 1.2 0 0 1 2.4 0V8a1.2 1.2 0 0 1 2.4 0v1a1.2 1.2 0 0 1 2.3.5v3c0 2.5-1.8 4.5-4.5 4.5h-.6c-2.4 0-4.4-2-4.4-4.4V10.7A1.2 1.2 0 0 1 8 9.5z" />
        </g>
      )}
    </svg>
  );
}

export function Circles({ kind, n, label }: { kind: "vida" | "dor"; n: number; label?: string }) {
  return (
    <span className="circles" role="img" aria-label={label ?? `${n} Círculos de ${kind === "vida" ? "Vida" : "Dor"}`}>
      {Array.from({ length: n }, (_, i) => <CircleIcon key={i} kind={kind} />)}
    </span>
  );
}

/** "3 Vida + 1 Dor" com os ícones. */
export function DamageTag({ vida, dor, note }: { vida?: number; dor?: number; note?: string }) {
  if (!vida && !dor) return <span className="muted">—</span>;
  return (
    <span className="dmg">
      {vida ? <span className="dmg-part dmg-vida">{vida}<CircleIcon kind="vida" /></span> : null}
      {vida && dor ? "+" : null}
      {dor ? <span className="dmg-part dmg-dor">{dor}<CircleIcon kind="dor" /></span> : null}
      {note && <small>{note}</small>}
    </span>
  );
}

export function Issues({ list }: { list: string[] }) {
  if (!list.length) return null;
  return <ul className="issues">{list.map((i) => <li key={i}>{i}</li>)}</ul>;
}

export function Stepper({ value, min, max, onChange, label, disabledUp }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string; disabledUp?: boolean;
}) {
  return (
    <span className="num-stepper">
      <button type="button" className="btn btn-icon" aria-label={`Diminuir ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <b className="num" aria-live="polite">{value}</b>
      <button type="button" className="btn btn-icon" aria-label={`Aumentar ${label}`} disabled={value >= max || disabledUp} onClick={() => onChange(value + 1)}>+</button>
    </span>
  );
}
