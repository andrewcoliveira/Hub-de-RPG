import { useEffect, useRef } from "react";
import { toast } from "@/shared/components/Toaster";
import { imageUrl } from "../../assets";
import {
  ABILITIES, BASIC_ABILITIES, CLASSES, CLASS_KEYS, RACES, classAbilities, classDevotionChoice, currentBBA,
  currentPM, currentPV, finalValueFor, fmtMod, honorTier, pmBreakdown, selectClass, selectRace, setLevel,
  slotsLeft, toggleRaceChoice, type RaceDef, type RaceKey,
} from "../engine";
import { useFicha, useJade } from "../store";
import { Check, Feature, revealSoon, useUi } from "./ui";

function RaceBonusTags({ r }: { r: RaceDef }) {
  return (
    <>
      {Object.entries(r.bonuses).map(([k, v]) => (
        <span key={k} className={`tag ${v! > 0 ? "tag-pos" : "tag-neg"}`}>{fmtMod(v!)} {ABILITIES.find((a) => a.key === k)?.abbr ?? k}</span>
      ))}
      {r.choiceBonus && <span className="tag tag-gold">+{r.choiceBonus.amount} em {r.choiceBonus.count} à escolha</span>}
    </>
  );
}

/** Painel de detalhe com animação de entrada só quando o item escolhido muda. */
function useDetailPanel(key: string | null) {
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

// ══════════════════════════════════════════════════════════════════
//  2 · RAÇA
// ══════════════════════════════════════════════════════════════════

export function RacaStep() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const { ref, entering } = useDetailPanel(s.race);
  const r = s.race ? RACES[s.race] : null;

  function pick(key: RaceKey) {
    if (key === s.race) return;
    useUi.setState({ scrollDetail: true });
    update((d) => selectRace(d, key));
  }

  const n = s.raceChoices.length, max = r?.choiceBonus?.count ?? 0;

  return (
    <>
      <div className="pick-grid">
        {(Object.keys(RACES) as RaceKey[]).map((key) => {
          const race = RACES[key];
          const on = key === s.race;
          return (
            <button key={key} type="button" className={`pick-card ${on ? "is-selected" : ""}`} aria-pressed={on} onClick={() => pick(key)}>
              <span className="pick-img"><img src={imageUrl(race.img)} alt="" loading="lazy" className="no-drag" /></span>
              <span className="pick-name">{race.label}</span>
              <span className="pick-tags"><RaceBonusTags r={race} /></span>
              <span className="pick-check" aria-hidden="true"><Check /></span>
            </button>
          );
        })}
      </div>
      <div ref={ref}>
        {!r ? (
          <div className="hint-box">Escolha uma raça para ver seus detalhes e habilidades.</div>
        ) : (
          <article className={`panel detail ${entering ? "is-entering" : ""}`}>
            <div className="detail-head">
              <div className="detail-img"><img src={imageUrl(r.img)} alt="" className="no-drag" /></div>
              <div className="detail-text">
                <span className="eyebrow">Raça escolhida</span>
                <h3>{r.label}</h3>
                <p>{r.desc}</p>
                <div className="tag-row"><RaceBonusTags r={r} /></div>
              </div>
            </div>
            {r.choiceBonus && (
              <div className={`choice-box ${n === max ? "is-done" : ""}`}>
                <div className="choice-head">
                  <b>Escolha {max} atributos para receber +{r.choiceBonus.amount}</b>
                  <span className={`tag ${n === max ? "tag-pos" : "tag-warn"}`}>{n}/{max}</span>
                </div>
                <div className="chip-row">
                  {BASIC_ABILITIES.map((a) => {
                    const on = s.raceChoices.includes(a.key);
                    return (
                      <button key={a.key} type="button" className="chip" aria-pressed={on} disabled={!on && n >= max}
                        onClick={() => update((d) => toggleRaceChoice(d, a.key))}>{a.label}</button>
                    );
                  })}
                </div>
              </div>
            )}
            <h4 className="detail-sub">Habilidades raciais</h4>
            <ul className="feature-list">{r.abilities.map((t, i) => <li key={i}><Feature text={t} /></li>)}</ul>
          </article>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
//  3 · CLASSE & NÍVEL
// ══════════════════════════════════════════════════════════════════

/** Habilidade de classe "Devoto": escolher a religião (define os poderes concedidos). */
export function DevotionChoice() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const choice = classDevotionChoice(s);
  if (!choice) return null;
  const done = !!s.devotion && choice.options.includes(s.devotion);
  return (
    <div className={`choice-box ${done ? "is-done" : ""}`}>
      <div className="choice-head">
        <b>Devoção da classe</b>
        <span className={`tag ${done ? "tag-pos" : "tag-warn"}`}>{done ? "Escolhida" : "Escolha uma"}</span>
      </div>
      <p className="small muted" style={{ margin: 0 }}>{choice.desc}</p>
      <div className="chip-row">
        {choice.options.map((o) => (
          <button key={o} type="button" className="chip" aria-pressed={s.devotion === o}
            onClick={() => update((d) => { d.devotion = d.devotion === o ? null : o; })}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function PmChoice() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  if (s.classKey !== "shugenja" || s.level < 3) return null;
  return (
    <div className="choice-box is-done">
      <div className="choice-head"><b>PM do shugenja</b></div>
      <p className="small muted" style={{ margin: 0 }}>Discípulo, iniciado, adepto e mestre celestial: some novamente seu bônus de Sabedoria ou seu bônus de Honra ao total de PM.</p>
      <div className="chip-row">
        <button type="button" className="chip" aria-pressed={s.pmChoice !== "hon"} onClick={() => update((d) => { d.pmChoice = "sab"; })}>Sabedoria</button>
        <button type="button" className="chip" aria-pressed={s.pmChoice === "hon"} onClick={() => update((d) => { d.pmChoice = "hon"; })}>Honra</button>
      </div>
    </div>
  );
}

/** Samurai e shugenja: as habilidades marcadas com * exigem Honra 16 ou mais. */
function HonorWarning() {
  const s = useJade();
  if (s.classKey !== "samurai" && s.classKey !== "shugenja") return null;
  const v = finalValueFor(s, "hon");
  if (v === null || v >= 16) return null;
  return (
    <div className="hint-box">
      Honra {v} ({honorTier(v)}): várias habilidades de {CLASSES[s.classKey].label.toLowerCase()} exigem Honra 16 ou mais, a Honra mínima da classe.
    </div>
  );
}

export function changeLevel(lvl: number | string): void {
  const { s, update } = useFicha.getState();
  const before = slotsLeft(s);
  update((d) => setLevel(d, lvl));
  if (slotsLeft(useFicha.getState().s) < 0 && before >= 0) toast("Há mais escolhas de talento do que o nível permite");
}

function LevelPanel() {
  const level = useJade().level;
  return (
    <div className="panel level-panel">
      <div className="level-top">
        <label htmlFor="levelRange" className="level-label">Nível do personagem</label>
        <div className="level-stepper">
          <button type="button" className="btn btn-icon" aria-label="Diminuir nível" disabled={level <= 1} onClick={() => changeLevel(level - 1)}>−</button>
          <output className="level-out num" htmlFor="levelRange">{level}<span className="ord">º</span></output>
          <button type="button" className="btn btn-icon" aria-label="Aumentar nível" disabled={level >= 20} onClick={() => changeLevel(level + 1)}>+</button>
        </div>
      </div>
      <input type="range" id="levelRange" className="level-range" min={1} max={20} step={1} value={level}
        style={{ ["--p" as string]: `${((level - 1) / 19) * 100}%` }} onChange={(e) => changeLevel(e.target.value)} />
      <div className="level-ticks" aria-hidden="true"><span>1</span><span>5</span><span>10</span><span>15</span><span>20</span></div>
    </div>
  );
}

export function ClasseStep() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const { ref, entering } = useDetailPanel(s.classKey);

  function pick(key: (typeof CLASS_KEYS)[number]) {
    if (key === s.classKey) return;
    const hadSkills = !!s.classKey && s.selectedSkills.length > 0;
    useUi.setState({ scrollDetail: true });
    update((d) => selectClass(d, key));
    if (hadSkills) toast("Perícias redefinidas para a nova classe");
  }

  const cls = s.classKey ? CLASSES[s.classKey] : null;
  const pv = currentPV(s), pm = currentPM(s), bba = currentBBA(s);
  const honor = finalValueFor(s, "hon");
  const { gained, locked } = classAbilities(s);

  return (
    <>
      <LevelPanel />
      <div className="pick-grid pick-grid-class">
        {CLASS_KEYS.map((key) => {
          const c = CLASSES[key];
          const on = key === s.classKey;
          return (
            <button key={key} type="button" className={`pick-card pick-class ${on ? "is-selected" : ""}`} aria-pressed={on} onClick={() => pick(key)}>
              <span className="pick-img"><img src={imageUrl(c.img)} alt="" loading="lazy" className="no-drag" /></span>
              <span className="pick-name">{c.label}</span>
              <span className="pick-desc">{c.desc}</span>
              <span className="pick-tags"><span className="tag">PV {c.pv_base}</span><span className="tag">PM {c.pm_base}</span></span>
              <span className="pick-check" aria-hidden="true"><Check /></span>
            </button>
          );
        })}
      </div>
      <div ref={ref}>
        {!cls || !pv ? (
          <div className="hint-box">Escolha uma classe para ver estatísticas, progressão e habilidades.</div>
        ) : (
          <article className={`panel detail ${entering ? "is-entering" : ""}`}>
            <div className="detail-head">
              <div className="detail-img"><img src={imageUrl(cls.img)} alt="" className="no-drag" /></div>
              <div className="detail-text">
                <span className="eyebrow">Classe escolhida</span>
                <h3>{cls.label}</h3>
                <p>{cls.desc}</p>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat"><span>Nível</span><b className="num">{s.level}<span className="ord">º</span></b></div>
              <div className="stat"><span>BBA</span><b className="num">+{bba}</b></div>
              <div className="stat"><span>PV máx.</span><b className="num">{pv.value}</b>{pv.partial && <small>+ mod. Con</small>}</div>
              <div className="stat"><span>PM máx.</span><b className="num">{pm}</b></div>
              <div className="stat"><span>Honra</span><b className="num">{honor ?? "—"}</b><small>{cls.honra} classe{s.level > 1 ? ` · +${s.level - 1} nível` : ""}</small></div>
            </div>
            <p className="stat-formula">PV {cls.pv_base} + {cls.pv_nivel}/nível (+ mod. de Con) · PM {pmBreakdown(s).map((p) => `${p.value} ${p.label}`).join(" + ")}</p>
            <PmChoice />
            <HonorWarning />

            <dl className="facts">
              <div><dt>Perícias treinadas</dt><dd>{cls.pericias_treinadas}</dd></div>
              <div><dt>Perícias de classe</dt><dd>{cls.pericias_classe}</dd></div>
              <div><dt>Talentos iniciais</dt><dd>{cls.talentos_iniciais}</dd></div>
            </dl>
            <DevotionChoice />

            <h4 className="detail-sub">Habilidades obtidas <span className="tag tag-pos">{gained.length}</span></h4>
            <div className="ability-list">
              {gained.length ? gained.map((a) => (
                <details key={a.name} className={`ability ${a.level === s.level ? "is-new" : ""}`}>
                  <summary>
                    <span className="lvl num">{a.level}º</span><span className="ability-name">{a.name}</span>
                    {a.level === s.level && <span className="tag tag-gold">Novo</span>}
                  </summary>
                  <p>{a.desc}</p>
                </details>
              )) : <p className="muted">Nenhuma habilidade neste nível.</p>}
            </div>

            {locked.length > 0 && (
              <details className="sub-box">
                <summary>Próximas habilidades <span className="tag">{locked.length}</span></summary>
                <ul className="locked-list">{locked.map((a) => <li key={a.name}><span className="lvl num">{a.level}º</span>{a.name}</li>)}</ul>
              </details>
            )}

            <details className="sub-box">
              <summary>Tabela de progressão</summary>
              <div className="table-wrap">
                <table className="prog-table">
                  <thead><tr><th>Nível</th><th>BBA</th><th>Habilidades de classe</th></tr></thead>
                  <tbody>
                    {cls.tabela.map((row) => (
                      <tr key={row.nivel} className={row.nivel === s.level ? "is-current" : row.nivel < s.level ? "is-past" : ""}>
                        <td className="num">{row.nivel}º</td><td className="num">+{row.bba}</td><td>{row.hab.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </article>
        )}
      </div>
    </>
  );
}
