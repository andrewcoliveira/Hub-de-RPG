// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Gerador de recompensas (interface)
//  As regras ficam em engine/; aqui só a tela.
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { copyText, prefersReducedMotion } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import { JadeFooter, JadeHero, JadeTopbar } from "../components/JadeShell";
import { ND_LIST } from "./engine/tables";
import type { LogStep } from "./engine/generator";
import { useGerador, type FeedEntry } from "./store";

const TREASURE_LABEL = { 1: "Padrão", 2: "Dobro", 3: "Triplo" } as const;

function multText(e: FeedEntry): string {
  const parts: string[] = [];
  if ((e.creatures || 1) > 1) parts.push(`${e.creatures} criaturas`);
  if ((e.treasure || 1) > 1) parts.push(TREASURE_LABEL[e.treasure as 2 | 3].toLowerCase());
  return parts.join(" · ");
}

function entryText(e: FeedEntry): string {
  const m = multText(e);
  return `#${e.n} · ND ${e.nd}${m ? ` (${m})` : ""} — Riquezas: ${e.riches ?? "nada"} · Equipamento: ${e.equip ?? "nada"}`;
}

// ── Ícones ────────────────────────────────────────────────────────

const IconCoin = () => (
  <svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="8" ry="3.5" /><path d="M4 7v5c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5V7M4 12v5c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-5" /></svg>
);
const IconSword = () => (
  <svg viewBox="0 0 24 24"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" /></svg>
);
const IconCopy = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
);
const DieIcon = () => (
  <svg className="roll-die" viewBox="0 0 100 100" aria-hidden="true">
    <polygon points="50,4 95,28 95,72 50,96 5,72 5,28" />
    <path d="M50,4 50,40 95,72 M50,40 5,72 50,96 95,72" />
    <polygon points="50,40 95,72 5,72" />
  </svg>
);

// ── Controles ─────────────────────────────────────────────────────

function NdControls() {
  const nd = useGerador((s) => s.nd);
  const setNd = useGerador((s) => s.setNd);
  const stepNd = useGerador((s) => s.stepNd);
  const idx = ND_LIST.indexOf(nd);
  const valueRef = useRef<HTMLOutputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // pequeno "pulo" no número ao trocar de ND
  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, [nd]);

  function onGridKey(e: ReactKeyboardEvent) {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -99, End: 99 };
    if (!(e.key in map)) return;
    e.preventDefault();
    e.stopPropagation();
    const next = Math.min(ND_LIST.length - 1, Math.max(0, idx + map[e.key]));
    setNd(ND_LIST[next]);
    requestAnimationFrame(() => gridRef.current?.querySelectorAll<HTMLButtonElement>(".nd-chip")[next]?.focus());
  }

  return (
    <>
      <div className="nd-head">
        <div>
          <span className="eyebrow" id="ctrlTitle">Nível de Dificuldade</span>
          <div className="nd-display">
            <button type="button" className="btn btn-icon btn-ghost" aria-label="ND anterior" disabled={idx === 0} onClick={() => stepNd(-1)}>
              <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <output ref={valueRef} className="nd-value" aria-live="polite">ND {nd}</output>
            <button type="button" className="btn btn-icon btn-ghost" aria-label="Próximo ND" disabled={idx === ND_LIST.length - 1} onClick={() => stepNd(1)}>
              <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="nd-grid" ref={gridRef} role="radiogroup" aria-label="Selecione o ND" onKeyDown={onGridKey}>
        {ND_LIST.map((n, i) => (
          <button key={n} type="button" className="nd-chip" role="radio" aria-checked={i === idx} tabIndex={i === idx ? 0 : -1} aria-label={`ND ${n}`} onClick={() => setNd(n)}>
            {n}
          </button>
        ))}
      </div>
    </>
  );
}

function QtyControls() {
  const qty = useGerador((s) => s.qty);
  const setQty = useGerador((s) => s.setQty);
  const treasure = useGerador((s) => s.treasure);
  const setTreasure = useGerador((s) => s.setTreasure);
  return (
    <>
      <div className="qty-row">
        <div>
          <span className="qty-label">Criaturas derrotadas</span>
          <span className="qty-hint">Um tesouro por criatura</span>
        </div>
        <div className="qty" role="group" aria-label="Criaturas derrotadas">
          <button type="button" className="qty-btn" aria-label="Diminuir" onClick={() => setQty(qty - 1)}>−</button>
          <output className="num">{qty}</output>
          <button type="button" className="qty-btn" aria-label="Aumentar" onClick={() => setQty(qty + 1)}>+</button>
        </div>
      </div>
      <div className="qty-row">
        <div>
          <span className="qty-label">Tesouro da criatura</span>
          <span className="qty-hint">Dobro e triplo rolam 2 ou 3 tesouros por criatura</span>
        </div>
        <div className="qty treasure-seg" role="radiogroup" aria-label="Tesouro da criatura">
          {([1, 2, 3] as const).map((t) => (
            <button key={t} type="button" className="seg-btn" role="radio" aria-checked={treasure === t} onClick={() => setTreasure(t)}>
              {TREASURE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Totais ────────────────────────────────────────────────────────

/** Número que conta até o novo valor (e pisca o cartão). */
function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value || prefersReducedMotion()) { setShown(value); return; }
    const parent = ref.current?.parentElement;
    parent?.classList.remove("flash");
    void parent?.offsetWidth;
    parent?.classList.add("flash");
    const t0 = performance.now(), dur = 500;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setShown(Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Garante o valor final mesmo se a aba estiver em segundo plano (sem animação)
    const done = setTimeout(() => { cancelAnimationFrame(raf); setShown(value); }, dur + 100);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, [value]);
  return <span ref={ref} className="tally-value num">{shown.toLocaleString("pt-BR")}</span>;
}

function Tally() {
  const feed = useGerador((s) => s.feed);
  let gold = 0, silver = 0;
  feed.forEach((e) => (e.cash || []).forEach((c) => {
    if (c.symbol === "¥o") gold += c.amount;
    else if (c.symbol === "¥p") silver += c.amount;
  }));
  const items = feed.reduce((t, e) => t + (e.equip ? e.equipCount || 1 : 0), 0);
  return (
    <div className="tally panel" aria-live="polite">
      <div className="tally-item"><span className="tally-label">Rolagens</span><AnimatedNumber value={feed.length} /></div>
      <div className="tally-item"><span className="tally-label">Ouro (¥o)</span><AnimatedNumber value={gold} /></div>
      <div className="tally-item"><span className="tally-label">Prata (¥p)</span><AnimatedNumber value={silver} /></div>
      <div className="tally-item"><span className="tally-label">Equipamentos</span><AnimatedNumber value={items} /></div>
    </div>
  );
}

// ── Resultados ────────────────────────────────────────────────────

function Steps({ log }: { log: LogStep[] }) {
  return (
    <ol className="steps">
      {log.map((step, i) =>
        step.type === "d100" ? (
          <li key={i} className="step">
            <span className="step-badge d100" title="Rolagem de d100">{step.roll}</span>
            <span className="step-label">{step.label}</span>
            <span className="step-result">{step.result}</span>
          </li>
        ) : (
          <li key={i} className="step">
            <span className="step-badge formula" title="Fórmula">{step.expression}</span>
            <span className="step-label">{step.label}</span>
            <span className="step-result eq">= {Number(step.result).toLocaleString("pt-BR")}</span>
          </li>
        ),
      )}
    </ol>
  );
}

/** Vários resultados viram lista; um só fica como texto. */
function LootValue({ text, items }: { text: string | null; items?: string[] }) {
  if (!text) return <>Nada desta vez</>;
  if (items && items.length > 1) return <ul className="loot-list">{items.map((i, k) => <li key={k}>{i}</li>)}</ul>;
  return <>{text}</>;
}

function LootCard({ e, isNew, delay }: { e: FeedEntry; isNew: boolean; delay: number }) {
  const remove = useGerador((s) => s.remove);
  const [leaving, setLeaving] = useState(false);
  const steps = (e.richesLog?.length || 0) + (e.equipLog?.length || 0);
  const time = new Date(e.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const nothing = !e.riches && !e.equip;
  const mult = multText(e);

  return (
    <article className={`loot ${isNew ? "is-new" : ""} ${nothing ? "is-empty" : ""} ${leaving ? "is-leaving" : ""}`} style={{ ["--delay" as string]: `${delay}ms` }}>
      <header className="loot-head">
        <span className="loot-nd">ND {e.nd}</span>
        <span className="loot-meta">#{e.n} · {time}</span>
        {mult && <span className="loot-mult">{mult}</span>}
        {isNew && <span className="loot-new">Novo</span>}
        <span className="loot-tools">
          <button type="button" className="btn btn-icon btn-ghost" aria-label="Copiar resultado" title="Copiar"
            onClick={async () => toast((await copyText(entryText(e))) ? "Resultado copiado" : "Não foi possível copiar")}>
            <IconCopy />
          </button>
          <button type="button" className="btn btn-icon btn-ghost" aria-label="Remover resultado" title="Remover"
            onClick={() => { setLeaving(true); setTimeout(() => remove(e.id), 220); }}>
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      </header>
      <div className="loot-body">
        <div className={`loot-row riches ${e.riches ? "" : "none"}`}>
          <span className="loot-icon" aria-hidden="true"><IconCoin /></span>
          <div><span className="loot-label">Riquezas</span><span className="loot-value"><LootValue text={e.riches} items={e.richesItems} /></span></div>
        </div>
        <div className={`loot-row equip ${e.equip ? "" : "none"}`}>
          <span className="loot-icon" aria-hidden="true"><IconSword /></span>
          <div><span className="loot-label">Equipamento</span><span className="loot-value"><LootValue text={e.equip} items={e.equipItems} /></span></div>
        </div>
      </div>
      {steps > 0 && (
        <details className="loot-log">
          <summary>Ver as {steps} rolagens</summary>
          {e.richesLog?.length > 0 && <><p className="log-title">Riquezas</p><Steps log={e.richesLog} /></>}
          {e.equipLog?.length > 0 && <><p className="log-title">Equipamento</p><Steps log={e.equipLog} /></>}
        </details>
      )}
    </article>
  );
}

// ── Página ────────────────────────────────────────────────────────

export default function GeradorApp() {
  const feed = useGerador((s) => s.feed);
  const fresh = useGerador((s) => s.fresh);
  const qty = useGerador((s) => s.qty);
  const treasure = useGerador((s) => s.treasure);
  const [rolling, setRolling] = useState(false);
  const rollingRef = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const times = qty * treasure;

  function roll() {
    if (rollingRef.current) return;
    rollingRef.current = true;
    setRolling(true);
    setTimeout(() => {
      useGerador.getState().roll();
      rollingRef.current = false;
      setRolling(false);
      requestAnimationFrame(() => {
        const first = feedRef.current?.querySelector(".loot");
        if (first && first.getBoundingClientRect().top > window.innerHeight * 0.8) {
          first.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        }
      });
    }, prefersReducedMotion() ? 0 : 650);
  }

  // Atalhos: Espaço/Enter rola, ← → mudam o ND
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      const onControl = ["BUTTON", "A", "SUMMARY"].includes(tag);
      if ((e.key === " " || e.key === "Enter") && !onControl) { e.preventDefault(); roll(); }
      else if (e.key === "ArrowLeft" && !onControl) { e.preventDefault(); useGerador.getState().stepNd(-1); }
      else if (e.key === "ArrowRight" && !onControl) { e.preventDefault(); useGerador.getState().stepNd(1); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  async function copyAll() {
    const lines = [...feed].reverse().map(entryText);
    toast((await copyText(lines.join("\n"))) ? `${lines.length} resultado(s) copiado(s)` : "Não foi possível copiar");
  }

  function clearAll() {
    if (!feed.length || !confirm("Limpar todo o tesouro da sessão?")) return;
    useGerador.getState().clear();
    toast("Tesouro da sessão limpo");
  }

  return (
    <>
      <JadeTopbar current="gerador" />
      <JadeHero title="Gerador de Recompensas">
        Escolha o ND do inimigo derrotado e deixe os dados rolarem. Cada resultado mostra o passo a passo das tabelas, e o tesouro da sessão é somado automaticamente.
      </JadeHero>

      <main className="gen-layout">
        <aside className="gen-controls panel" aria-labelledby="ctrlTitle">
          <NdControls />
          <QtyControls />
          <button type="button" className={`roll-btn ${rolling ? "is-rolling" : ""}`} disabled={rolling} onClick={roll}>
            <DieIcon />
            <span>{rolling ? "Rolando…" : times > 1 ? `Rolar ${times} tesouros` : "Rolar tesouro"}</span>
          </button>
          <p className="kbd-hint">Atalhos: <kbd>Espaço</kbd> rola · <kbd>←</kbd> <kbd>→</kbd> mudam o ND</p>
        </aside>

        <section className="gen-results" aria-labelledby="resTitle">
          <Tally />
          <div className="feed-head">
            <h2 id="resTitle">Tesouro da sessão</h2>
            <div className="feed-actions">
              <button type="button" className="btn btn-sm" disabled={!feed.length} onClick={copyAll}>
                <IconCopy /> Copiar tudo
              </button>
              <button type="button" className="btn btn-sm btn-danger" disabled={!feed.length} onClick={clearAll}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                Limpar
              </button>
            </div>
          </div>
          <div className="feed" ref={feedRef}>
            <div className="feed-empty" hidden={feed.length > 0}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v11H4z" /><path d="M3 5h18v4H3zM12 5v15M8.5 5C7 3 9 1.5 12 5c3-3.5 5-2 3.5 0" /></svg>
              <p><strong>Nenhum tesouro ainda.</strong><br />Escolha o ND e role os dados para começar.</p>
            </div>
            {feed.map((e) => (
              <LootCard key={e.id} e={e} isNew={fresh.includes(e.id)} delay={0} />
            ))}
          </div>
        </section>
      </main>

      <JadeFooter />
    </>
  );
}
