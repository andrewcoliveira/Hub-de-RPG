// ══════════════════════════════════════════════════════════════════
//  4 · CLASSE & NEX (e trilha)
// ══════════════════════════════════════════════════════════════════

import {
  CLASSES, CLASS_KEYS, NEX_LEVELS, currentDefense, currentPE, currentPV, currentSAN, currentTrail, nexOf, peLimit,
  selectClass, selectTrail, setNex, simulateTraining, trailPending, trailsOf, type ClassKey,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { Check, useDetailPanel, useUi } from "./ui";

const CLASS_ICON: Record<ClassKey, JSX.Element> = {
  combatente: <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 38L34 14M30 10l8 8M14 30l4 4M8 40l4-4" /><path d="M38 38L14 14M18 10l-8 8M34 30l-4 4M40 40l-4-4" /></svg>,
  especialista: <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="20" cy="20" r="11" /><path d="M28 28l12 12M14 20h12M20 14v12" /></svg>,
  ocultista: <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" /><path d="M24 7v34M9.5 32.5l29-17M9.5 15.5l29 17" /><path d="M24 14l9 16H15z" /></svg>,
};

function NexPanel() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const max = NEX_LEVELS.length - 1;
  const pct = (s.nexIndex / max) * 100;
  return (
    <div className="panel level-panel">
      <div className="level-top">
        <div>
          <span className="level-label">Nível de Exposição Paranormal (NEX)</span>
          <p className="panel-sub">Agentes iniciantes começam com NEX 5%. Em geral, o NEX sobe 5% a cada missão concluída.</p>
        </div>
        <div className="level-stepper">
          <button type="button" className="btn btn-icon" aria-label="Diminuir NEX" disabled={s.nexIndex === 0}
            onClick={() => update((d) => setNex(d, d.nexIndex - 1))}>−</button>
          <output className="level-out num" aria-live="polite">{nexOf(s)}%</output>
          <button type="button" className="btn btn-icon" aria-label="Aumentar NEX" disabled={s.nexIndex === max}
            onClick={() => update((d) => setNex(d, d.nexIndex + 1))}>+</button>
        </div>
      </div>
      <input type="range" className="level-range" min={0} max={max} step={1} value={s.nexIndex} aria-label="NEX"
        aria-valuetext={`NEX ${nexOf(s)}%`} style={{ ["--p" as string]: `${pct}%` }}
        onChange={(e) => { const v = Number(e.target.value); update((d) => setNex(d, v)); }} />
      <div className="level-ticks" aria-hidden="true"><span>5%</span><span>25%</span><span>50%</span><span>75%</span><span>99%</span></div>
    </div>
  );
}

function ClassDetail() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const { ref, entering } = useDetailPanel(s.classKey);
  const trailRef = useDetailPanel(s.trail);
  if (!s.classKey) return <div ref={ref} className="hint-box">Escolha uma classe para ver seus detalhes.</div>;

  const cls = CLASSES[s.classKey];
  const nex = nexOf(s);
  const trail = currentTrail(s);
  const tp = trailPending(s);
  const grade = simulateTraining(s).grade;
  const rows = NEX_LEVELS.filter((n) => cls.table[n]);

  return (
    <div ref={ref} className="class-detail">
      <article className={`panel detail ${entering ? "is-entering" : ""}`}>
        <div className="detail-head">
          <div className="detail-icon">{CLASS_ICON[cls.key]}</div>
          <div className="detail-text">
            <span className="eyebrow">Classe escolhida</span>
            <h3>{cls.label}</h3>
            <p>{cls.desc}</p>
          </div>
        </div>
        <div className="stat-row">
          <div className="stat"><span>PV</span><b className="num">{currentPV(s)}</b><small>{cls.pv[0]}+Vig · +{cls.pv[1]}+Vig/NEX</small></div>
          <div className="stat"><span>PE</span><b className="num">{currentPE(s)}</b><small>{cls.pe[0]}+Pre · +{cls.pe[1]}+Pre/NEX</small></div>
          <div className="stat"><span>Sanidade</span><b className="num">{currentSAN(s)}</b><small>{cls.san[0]} · +{cls.san[1]}/NEX</small></div>
          <div className="stat"><span>Limite de PE</span><b className="num">{peLimit(s)}</b><small>por turno</small></div>
          <div className="stat"><span>Defesa</span><b className="num">{currentDefense(s)}</b><small>10 + Agi</small></div>
        </div>
        <dl className="facts">
          <div><dt>Perícias treinadas</dt><dd>{cls.skillsText}</dd></div>
          <div><dt>Proficiências</dt><dd>{cls.proficiencies.join(", ")}.</dd></div>
          <div><dt>{cls.label}s famosos</dt><dd>{cls.famous}</dd></div>
        </dl>

        <h4 className="detail-sub">Habilidades de classe</h4>
        <div className="ability-list">
          {cls.features.map((f) => {
            const got = f.nex <= nex;
            return (
              <details key={f.name} className={`ability ${got ? "" : "is-locked"}`}>
                <summary><span className="lvl">{f.nex}%</span>{f.name}{!got && <span className="tag">bloqueada</span>}</summary>
                <p>{f.desc}</p>
              </details>
            );
          })}
        </div>

        <details className="sub-box">
          <summary>Tabela de progressão</summary>
          <div className="table-wrap">
            <table className="prog-table">
              <thead><tr><th>NEX</th><th>Limite PE</th><th>Habilidades</th></tr></thead>
              <tbody>
                {rows.map((n) => (
                  <tr key={n} className={n === nex ? "is-current" : n < nex ? "is-past" : ""}>
                    <td>{n}%</td><td>{NEX_LEVELS.indexOf(n as never) + 1}</td><td>{cls.table[n]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </article>

      <section className="trail-section" aria-labelledby="trailTitle">
        <header className="section-mini">
          <h3 id="trailTitle">Trilha</h3>
          <p className="muted">{nex < 10 ? "Você escolhe sua trilha ao atingir NEX 10%." : "Recebe o primeiro poder da trilha em NEX 10% e novos poderes em 40%, 65% e 99%."}</p>
        </header>
        {nex >= 10 && (
          <>
            <div className="trail-grid">
              {trailsOf(cls.key).map((t) => {
                const on = t.key === s.trail;
                const blocked = t.requires && !grade.get(t.requires.trained);
                return (
                  <button key={t.key} type="button" className={`trail-card ${on ? "is-selected" : ""}`} aria-pressed={on}
                    onClick={() => { useUi.setState({ scrollDetail: true }); update((d) => selectTrail(d, t.key)); }}>
                    <span className="trail-name">{t.label}</span>
                    <span className="trail-desc">{t.desc}</span>
                    {t.requires && <span className={`tag ${blocked ? "tag-warn" : "tag-pos"}`}>Requer {t.requires.trained}</span>}
                    <span className="pick-check" aria-hidden="true"><Check /></span>
                  </button>
                );
              })}
            </div>
            <div ref={trailRef.ref}>
              {trail && (
                <article className={`panel detail ${trailRef.entering ? "is-entering" : ""}`}>
                  <div className="detail-text">
                    <span className="eyebrow">Trilha de {cls.label.toLowerCase()}</span>
                    <h3>{trail.label}</h3>
                    {trail.requires && <p className={tp ? "warn-text" : "muted"}>{trail.requires.note}{tp ? " Treine Medicina na etapa Perícias." : ""}</p>}
                  </div>
                  <div className="ability-list">
                    {trail.abilities.map((a) => {
                      const got = a.nex <= nex;
                      return (
                        <details key={a.name} className={`ability ${got ? "" : "is-locked"}`} open={got && a.nex === 10}>
                          <summary><span className="lvl">{a.nex}%</span>{a.name}{!got && <span className="tag">bloqueada</span>}</summary>
                          <p>{a.desc}</p>
                        </details>
                      );
                    })}
                  </div>
                </article>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export function ClasseStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);

  function pick(key: ClassKey) {
    if (key === s.classKey) return;
    if (s.classKey && (s.powers.some(Boolean) || s.rituals.length || s.trail) &&
      !confirm("Trocar de classe apaga trilha, poderes, rituais e perícias de classe escolhidos. Continuar?")) return;
    useUi.setState({ scrollDetail: true });
    update((d) => selectClass(d, key));
  }

  return (
    <>
      <div className="class-grid">
        {CLASS_KEYS.map((k) => {
          const c = CLASSES[k];
          const on = k === s.classKey;
          return (
            <button key={k} type="button" className={`class-card ${on ? "is-selected" : ""}`} aria-pressed={on} onClick={() => pick(k)}>
              <span className="class-icon">{CLASS_ICON[k]}</span>
              <span className="class-name">{c.label}</span>
              <span className="class-tagline">{c.tagline}</span>
              <span className="class-stats">
                <span><b>{c.pv[0]}</b>+Vig PV</span>
                <span><b>{c.pe[0]}</b>+Pre PE</span>
                <span><b>{c.san[0]}</b> SAN</span>
              </span>
              <span className="pick-check" aria-hidden="true"><Check /></span>
            </button>
          );
        })}
      </div>
      <NexPanel />
      <ClassDetail />
    </>
  );
}
