// ══════════════════════════════════════════════════════════════════
//  4 · HABILIDADES   5 · REDENÇÃO   6 · MONTARIA
// ══════════════════════════════════════════════════════════════════

import { toast } from "@/shared/components/Toaster";
import {
  CUSTOM_TIPS, CUSTOM_TRAIL, FIDELITY, LEVELS, MOUNT_POINTS, SKILLS, TRAILS, addSkill, isRedeemed, mountLeft, mountStats,
  removeSkill, scaleAt, selectTrail, skillCount, skillIssues, skillSlots, stepsDone,
} from "../engine";
import { useFicha, useSacramento } from "../store";
import { Check, Circles, Issues, Meter, Stepper, useUi } from "./ui";

const LISTS = [
  { k: "all", label: "Todas" },
  { k: "combate", label: "De Combate" },
  { k: "profissao", label: "De Profissão" },
  { k: "mine", label: "Escolhidas" },
] as const;

export function HabilidadesStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const list = useUi((u) => u.skillList);
  const slots = skillSlots(s), used = s.skills.length;
  const gains = LEVELS.filter((l) => l.level <= s.level && l.habilidade).map((l) => l.level);
  const shown = SKILLS.filter((k) => list === "all" || (list === "mine" ? s.skills.includes(k.key) : k.list === list));

  function add(key: string) {
    const r = update((d) => addSkill(d, key));
    if (r === "full") toast(`Limite de ${slots} Habilidades atingido`);
  }

  return (
    <>
      <div className="panel toolbar">
        <div className="toolbar-meter">
          <Meter label="Habilidades" used={used} total={slots}
            note={`2 no nível 1${gains.length ? ` + 1 nos níveis ${gains.join(", ")}` : ""}${isRedeemed(s) ? " + 1 da Redenção" : ""}`} />
        </div>
        <div className="chip-row" role="group" aria-label="Filtrar habilidades">
          {LISTS.map(({ k, label }) => (
            <button key={k} type="button" className="chip" aria-pressed={list === k} onClick={() => useUi.setState({ skillList: k })}>{label}</button>
          ))}
        </div>
      </div>
      <Issues list={skillIssues(s)} />

      <div className="skill-grid">
        {shown.map((k) => {
          const n = skillCount(s, k.key);
          const on = n > 0;
          const current = scaleAt(k, s.level);
          return (
            <article key={k.key} className={`skill-card ${on ? "is-on" : ""} list-${k.list}`}>
              <header className="skill-head">
                <div>
                  <span className="eyebrow">{k.list === "combate" ? "Combate" : "Profissão"}</span>
                  <h4>{k.name}{n > 1 ? <small> ×{n}</small> : null}</h4>
                </div>
                <div className="skill-actions">
                  {on && <button type="button" className="btn btn-sm is-remove" onClick={() => update((d) => removeSkill(d, k.key))}>{k.repeatable ? "−1" : "Remover"}</button>}
                  {(!on || k.repeatable) && <button type="button" className="btn btn-sm btn-primary" disabled={used >= slots} onClick={() => add(k.key)}>{on ? "+1" : "Escolher"}</button>}
                </div>
              </header>
              <p className="skill-desc">{k.desc}</p>
              {k.scale && (
                <table className="scale-table">
                  <thead><tr><th>Nível</th><th>{k.scale.title}</th></tr></thead>
                  <tbody>
                    {k.scale.rows.map((r) => (
                      <tr key={r.level} className={current && r.level <= s.level && (k.key === "cancao-da-emocao" || r.value === current) ? "is-current" : ""}>
                        <td>{r.level}</td><td>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {k.repeatable && <span className="tag tag-gold">Pode ser escolhida várias vezes</span>}
              {k.limit && <span className={`tag ${s.attrs.intelecto > 1 || s.antecedents.violencia > 2 ? "tag-neg" : "tag-pos"}`}>Intelecto ≤ 1 e Violência ≤ 2</span>}
            </article>
          );
        })}
      </div>
    </>
  );
}

export function RedencaoStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const r = s.redemption;
  const redeemed = isRedeemed(s);

  return (
    <>
      <div className="panel">
        <p className="panel-sub" style={{ marginTop: 0 }}>
          Algo no passado aperta seu peito: remorso, culpa ou sede de vingança. A jornada rumo à redenção é uma Trilha de 6 passos.
          Cada passo cumprido dá uma <b>Carta de Sina</b>. Os passos podem ser cumpridos em qualquer ordem — menos o último, que é o último.
          Ao se redimir você ganha <b>+1 Habilidade</b>, <b>+2 Vida</b> e tira <b>uma carta a mais na Iniciativa</b>, ficando com a melhor.
        </p>
      </div>
      <div className="trail-grid">
        {TRAILS.map((t) => (
          <button key={t.key} type="button" className={`trail-card ${r.trail === t.key ? "is-selected" : ""}`} aria-pressed={r.trail === t.key}
            onClick={() => { if (r.trail && r.trail !== t.key && r.done.some(Boolean) && !confirm("Trocar de trilha apaga os passos marcados. Continuar?")) return; update((d) => selectTrail(d, t.key)); }}>
            <span className="trail-name">{t.label}</span>
            <span className="trail-desc">{t.premise}</span>
            <span className="pick-check" aria-hidden="true"><Check /></span>
          </button>
        ))}
        <button type="button" className={`trail-card trail-custom ${r.trail === CUSTOM_TRAIL ? "is-selected" : ""}`} aria-pressed={r.trail === CUSTOM_TRAIL}
          onClick={() => { if (r.trail && r.trail !== CUSTOM_TRAIL && r.done.some(Boolean) && !confirm("Trocar de trilha apaga os passos marcados. Continuar?")) return; update((d) => selectTrail(d, CUSTOM_TRAIL)); }}>
          <span className="trail-name">Trilha própria</span>
          <span className="trail-desc">Crie sua trilha seguindo as dicas do livro.</span>
          <span className="pick-check" aria-hidden="true"><Check /></span>
        </button>
      </div>

      {r.trail && (
        <article className={`panel trail-sheet ${redeemed ? "is-redeemed" : ""}`}>
          {r.trail === CUSTOM_TRAIL && (
            <ol className="tips">{CUSTOM_TIPS.map((t) => <li key={t}>{t}</li>)}</ol>
          )}
          <label className="field">
            <span className="field-label">Premissa — preencha as lacunas entre parênteses</span>
            <textarea className="input" rows={2} maxLength={500} value={r.premise}
              onChange={(e) => { const v = e.target.value; update((d) => { d.redemption.premise = v; }); }} />
          </label>
          <ol className="trail-steps">
            {r.steps.map((st, i) => (
              <li key={i} className={r.done[i] ? "is-done" : ""}>
                <label className="step-check">
                  <input type="checkbox" checked={r.done[i]}
                    onChange={(e) => { const v = e.target.checked; update((d) => { d.redemption.done[i] = v; }); }} />
                  <span className="check" aria-hidden="true"><Check /></span>
                  <span className="sr-only">Passo {i + 1} cumprido</span>
                </label>
                <span className="step-n">Passo {i + 1}</span>
                <textarea className="input" rows={2} maxLength={500} value={st} aria-label={`Passo ${i + 1}`}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.redemption.steps[i] = v; }); }} />
              </li>
            ))}
          </ol>
          <p className={`small ${redeemed ? "ok-text" : "muted"}`}>
            {redeemed ? "Redenção alcançada! +1 Habilidade, +2 Vida e +1 carta na Iniciativa já estão na ficha." : `${stepsDone(s)}/6 passos cumpridos · ${stepsDone(s)} Carta${stepsDone(s) === 1 ? "" : "s"} de Sina ganhas pela trilha.`}
          </p>
        </article>
      )}
    </>
  );
}

const KINDS = ["Cavalo", "Égua", "Mula", "Burrico", "Jegue", "Boi", "Outro"];

export function MontariaStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const m = s.mount;
  const left = mountLeft(s);
  const st = mountStats(s);

  return (
    <>
      <div className="panel">
        <label className="switch">
          <input type="checkbox" checked={m.enabled} onChange={(e) => { const v = e.target.checked; update((d) => { d.mount.enabled = v; }); }} />
          <span className="switch-track" aria-hidden="true" />
          <span>Meu personagem tem uma montaria</span>
        </label>
        <p className="panel-sub">Montado, 1 Movimento leva você 10m em vez de 3m. A montaria pode levar mais itens com uma Bolsa de montaria (compre na etapa Equipamento).</p>
      </div>

      {m.enabled && (
        <>
          <div className="panel mount-panel">
            <div className="mount-id">
              <label className="field">
                <span className="field-label">Nome</span>
                <input type="text" className="input" maxLength={60} placeholder="Ex.: Estrela" value={m.name}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.mount.name = v; }); }} />
              </label>
              <label className="field">
                <span className="field-label">Animal</span>
                <select className="input" value={m.kind} onChange={(e) => { const v = e.target.value; update((d) => { d.mount.kind = v; }); }}>
                  {KINDS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
            </div>
            <p className="small">Distribua <b>{MOUNT_POINTS} pontos</b> entre Potência e Resistência. {left > 0 ? <span className="warn-text">{left} restante{left > 1 ? "s" : ""}.</span> : null}</p>
            <div className="mount-attrs">
              <div className="attr-tile">
                <div className="attr-head"><span className="attr-name">Potência</span><span className="attr-effect">Teste: {st.teste}</span></div>
                <Stepper value={m.potencia} min={0} max={MOUNT_POINTS} label="Potência" disabledUp={left <= 0}
                  onChange={(v) => update((d) => { d.mount.potencia = v; })} />
                <p className="attr-desc">O quanto acelera, corre e mostra força nas quatro patas: correr, alcançar, apostar corrida.</p>
              </div>
              <div className="attr-tile">
                <div className="attr-head"><span className="attr-name">Resistência</span><span className="attr-effect">+1 Vida por ponto</span></div>
                <Stepper value={m.resistencia} min={0} max={MOUNT_POINTS} label="Resistência" disabledUp={left <= 0}
                  onChange={(v) => update((d) => { d.mount.resistencia = v; })} />
                <p className="attr-desc">Força para longas jornadas, ferimentos e doenças.</p>
              </div>
            </div>
            <div className="mount-circles">
              <div><span className="eyebrow">Círculos de Dor</span><Circles kind="dor" n={st.dor} /></div>
              <div><span className="eyebrow">Círculos de Vida</span><Circles kind="vida" n={st.vida} /></div>
            </div>
          </div>

          <div className="panel">
            <h3 className="panel-title">Fidelidade</h3>
            <p className="panel-sub">Mede a sintonia entre você e a montaria. Começa em 0 e sobe (ou cai) ao fim das sessões, a critério do Juiz.</p>
            <ol className="fidelity" start={0}>
              {FIDELITY.map((f, i) => (
                <li key={i} className={i <= m.fidelidade ? "is-on" : ""}>
                  <button type="button" className="fid-n" aria-pressed={m.fidelidade === i} onClick={() => update((d) => { d.mount.fidelidade = i; })}>{i}</button>
                  <span>{f}</span>
                  {(i === 2 || i === 5) && i <= m.fidelidade && (
                    <span className="segmented seg-sm" role="group" aria-label={`Bônus da Fidelidade ${i}`}>
                      {(["potencia", "resistencia"] as const).map((a) => (
                        <button key={a} type="button" aria-pressed={m.fidelityBonus[i === 2 ? 0 : 1] === a}
                          onClick={() => update((d) => { d.mount.fidelityBonus[i === 2 ? 0 : 1] = a; })}>{a === "potencia" ? "Potência" : "Resistência"}</button>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </>
  );
}
