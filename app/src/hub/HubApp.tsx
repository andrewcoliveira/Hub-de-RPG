// ══════════════════════════════════════════════════════════════════
//  Hub de RPG — página inicial: rolador rápido e lista de sistemas
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, rollDie } from "@/shared/browser";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { SYSTEMS, TOOL_KINDS, type ToolKind } from "@/shared/systems";

const D6_MARK = (
  <>
    <polygon points="50,4 95,28 95,72 50,96 5,72 5,28" />
    <path d="M50,4 50,40 95,72 M50,40 5,72 50,96 95,72" />
    <polygon points="50,40 95,72 5,72" />
  </>
);

function BgDice() {
  return (
    <div className="bg-dice" aria-hidden="true">
      <svg className="poly p1" viewBox="0 0 100 100">{D6_MARK}</svg>
      <svg className="poly p2" viewBox="0 0 100 100"><polygon points="50,6 94,90 6,90" /><path d="M50,6 50,62 94,90 M50,62 6,90" /></svg>
      <svg className="poly p3" viewBox="0 0 100 100"><polygon points="50,4 96,50 50,96 4,50" /><path d="M4,50 96,50 M50,4 50,96" /></svg>
      <svg className="poly p4" viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="10" /><circle cx="32" cy="32" r="6" /><circle cx="68" cy="68" r="6" /><circle cx="50" cy="50" r="6" /></svg>
      <svg className="poly p5" viewBox="0 0 100 100"><polygon points="50,4 95,28 95,72 50,96 5,72 5,28" /><polygon points="50,40 95,72 5,72" /></svg>
      <svg className="poly p6" viewBox="0 0 100 100"><polygon points="50,6 94,90 6,90" /></svg>
    </div>
  );
}

const DICE = [4, 6, 8, 10, 12, 20, 100];

function DiceTray() {
  const [qty, setQty] = useState(1);
  const [total, setTotal] = useState<string | number>("d20");
  const [detail, setDetail] = useState("Escolha um dado para rolar");
  const [state, setState] = useState<"" | "is-rolling" | "is-crit" | "is-fumble">("");
  const [history, setHistory] = useState<{ expr: string; sum: number }[]>([]);
  const rolling = useRef(false);

  function roll(die: number) {
    if (rolling.current) return;
    rolling.current = true;
    setState("is-rolling");
    const frames = prefersReducedMotion() ? 1 : 9;
    let f = 0;
    const tick = () => {
      setTotal(Array.from({ length: qty }, () => rollDie(die)).reduce((a, b) => a + b, 0));
      if (++f < frames) { setTimeout(tick, 45 + f * 6); return; }
      const dice = Array.from({ length: qty }, () => rollDie(die));
      const sum = dice.reduce((a, b) => a + b, 0);
      const expr = `${qty}d${die}`;
      setTotal(sum);
      setDetail(qty > 1 ? `${expr} → [${dice.join(", ")}]` : expr);
      setState(qty === 1 && die === 20 && sum === 20 ? "is-crit" : qty === 1 && die === 20 && sum === 1 ? "is-fumble" : "");
      setHistory((h) => [{ expr, sum }, ...h].slice(0, 8));
      rolling.current = false;
    };
    tick();
  }

  return (
    <aside className="dice-tray" id="dados" aria-labelledby="trayTitle">
      <div className="tray-head">
        <h2 id="trayTitle">Rolagem rápida</h2>
        <div className="qty" role="group" aria-label="Quantidade de dados">
          <button type="button" className="qty-btn" aria-label="Menos um dado" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <output aria-live="polite">{qty}</output>
          <button type="button" className="qty-btn" aria-label="Mais um dado" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
        </div>
      </div>
      <div className={`tray-result ${state}`} aria-live="polite">
        <span className="tray-total">{total}</span>
        <span className="tray-detail">{detail}</span>
      </div>
      <div className="die-buttons" role="group" aria-label="Dados">
        {DICE.map((d) => (
          <button key={d} type="button" className={`die-btn ${d === 20 ? "die-btn-hero" : ""}`} onClick={() => roll(d)}>d{d}</button>
        ))}
      </div>
      <ol className="tray-history" aria-label="Últimas rolagens">
        {history.map((h, i) => <li key={i}><span>{h.expr}</span><b>{h.sum}</b></li>)}
      </ol>
    </aside>
  );
}

function Systems() {
  const [filter, setFilter] = useState<ToolKind | "all">("all");
  const gridRef = useRef<HTMLDivElement>(null);

  // Revela os cartões ao rolar a página
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    document.body.classList.add("reveal-ready");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    gridRef.current?.querySelectorAll<HTMLElement>(".system-card").forEach((c, i) => { c.style.setProperty("--i", String(i)); io.observe(c); });
    return () => io.disconnect();
  }, []);

  return (
    <section className="systems" id="sistemas" aria-labelledby="sysTitle">
      <div className="section-head">
        <h2 id="sysTitle">Sistemas</h2>
        <div className="filter" role="tablist" aria-label="Filtrar ferramentas">
          {TOOL_KINDS.map((k) => (
            <button key={k.key} type="button" className={`chip ${filter === k.key ? "is-active" : ""}`} role="tab" aria-selected={filter === k.key} onClick={() => setFilter(k.key)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="system-grid" ref={gridRef}>
        {SYSTEMS.map((sys) => {
          const visible = sys.tools.filter((t) => filter === "all" || t.kind === filter);
          return (
            <article key={sys.key} className={`system-card ${visible.length ? "" : "is-dim"}`} style={{ ["--sys" as string]: sys.color }}>
              <div className="system-banner" aria-hidden="true">
                <svg viewBox="0 0 120 120" dangerouslySetInnerHTML={{ __html: sys.banner }} />
              </div>
              <header className="system-head">
                <h3>{sys.name}</h3>
                <ul className="tags">{sys.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </header>
              <p className="system-desc">{sys.desc}</p>
              <ul className="tool-list">
                {sys.tools.map((t) => (
                  <li key={t.href} data-kind={t.kind} hidden={!visible.includes(t)}>
                    <a className="tool" href={t.href}>
                      <span className="tool-icon" aria-hidden="true">
                        {t.kind === "ficha"
                          ? <svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></svg>
                          : <svg viewBox="0 0 24 24"><path d="M4 9h16v11H4z" /><path d="M3 5h18v4H3zM12 5v15M8.5 5C7 3 9 1.5 12 5c3-3.5 5-2 3.5 0" /></svg>}
                      </span>
                      <span className="tool-text"><strong>{t.title}</strong><span>{t.desc}</span></span>
                      <span className="tool-go" aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}

        <article className="system-card system-soon" aria-label="Novos sistemas em breve">
          <div className="soon-inner">
            <span className="soon-icon" aria-hidden="true">+</span>
            <h3>Mais sistemas em breve</h3>
            <p>Novas mesas, novas ferramentas. O hub cresce junto com as campanhas.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function HubApp() {
  const toolCount = SYSTEMS.reduce((t, s) => t + s.tools.length, 0);
  return (
    <>
      <BgDice />
      <header className="topbar">
        <a className="brand" href="index.html" aria-label="Hub de RPG — início">
          <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">{D6_MARK}</svg>
          <span>Hub de RPG</span>
        </a>
        <nav className="topnav" aria-label="Navegação principal">
          <a href="#sistemas">Sistemas</a>
          <a href="#dados">Dados</a>
        </nav>
        <ThemeToggle />
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Mesa do Mestre</p>
            <h1 className="hero-title">Todas as suas ferramentas de RPG em um só lugar</h1>
            <p className="hero-lead">Crie fichas, gere tesouros e role dados sem tirar os olhos da aventura. Escolha um sistema abaixo e comece a sessão.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#sistemas">Explorar sistemas</a>
              <a className="btn btn-ghost" href="#dados">Rolar dados</a>
            </div>
            <dl className="hero-stats">
              <div><dt>{SYSTEMS.length}</dt><dd>sistemas</dd></div>
              <div><dt>{toolCount}</dt><dd>ferramentas</dd></div>
              <div><dt>∞</dt><dd>aventuras</dd></div>
            </dl>
          </div>
          <DiceTray />
        </section>
        <Systems />
      </main>

      <footer className="footer">
        <p>Ferramentas feitas por fãs, sem vínculo oficial com as editoras.</p>
        <p className="footer-small">
          Império de Jade e Ordem Paranormal RPG são publicados pela <a href="https://jamboeditora.com.br" target="_blank" rel="noopener">Jambô Editora</a>.
          7º Mar e demais marcas citadas pertencem aos seus respectivos detentores.
        </p>
      </footer>
    </>
  );
}
