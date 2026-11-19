// ══════════════════════════════════════════════════════════════════
//  1 · CONCEITO & NÍVEL   2 · ATRIBUTOS   3 · ANTECEDENTES
// ══════════════════════════════════════════════════════════════════

import {
  ANTECEDENTS, ATTRS, CONCEPT_EXAMPLES, LEVELS, MAX_LEVEL, PAIN_TABLE, XP_QUESTIONS, antecedentLeft, antecedentMax,
  antecedentPoints, antecedentRoll, attrLeft, attrPoints, canChangeAntecedent, canChangeAttr, changeAntecedent, changeAttr,
  conditions, levelForXp, setLevel, vidaParts, type Details,
} from "../engine";
import { useFicha, useSacramento } from "../store";
import { Circles, Stepper } from "./ui";

const DETAIL_FIELDS: { key: keyof Details; label: string; hint: string }[] = [
  { key: "aparencia", label: "Aparência", hint: "Como os outros te veem chegando no Salão?" },
  { key: "historia", label: "História", hint: "De onde veio, o que deixou para trás, quem procura." },
  { key: "notas", label: "Anotações", hint: "Bando, contatos, dívidas, segredos…" },
];

export function ConceitoStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const suggested = levelForXp(s.xp);

  return (
    <>
      <div className="panel concept-panel">
        <label className="field">
          <span className="field-label">Nome</span>
          <input type="text" className="input input-lg" maxLength={60} placeholder="Ex.: Golia" autoComplete="off"
            value={s.name} onChange={(e) => { const v = e.target.value; update((d) => { d.name = v; }); }} />
        </label>
        <label className="field">
          <span className="field-label">Conceito — a resposta mais curta possível para quem é seu personagem</span>
          <input type="text" className="input" maxLength={300} placeholder="Ex.: Brutamontes do Circo do Sol que fugiu da jaula do Homem-Besta."
            value={s.concept} onChange={(e) => { const v = e.target.value; update((d) => { d.concept = v; }); }} />
        </label>
        <div className="examples">
          <span className="eyebrow">Ideias do livro (clique para usar)</span>
          <div className="chip-row">
            {CONCEPT_EXAMPLES.map((c) => (
              <button key={c} type="button" className="chip chip-quote" onClick={() => update((d) => { d.concept = c; })}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="panel level-panel">
        <div className="level-top">
          <div>
            <span className="level-label">Nível</span>
            <p className="panel-sub">Personagens novos começam no nível 1. Para campanhas em andamento, escolha o nível e as escolhas extras aparecem nas próximas etapas.</p>
          </div>
          <Stepper value={s.level} min={1} max={MAX_LEVEL} label="nível" onChange={(v) => update((d) => setLevel(d, v))} />
        </div>
        <div className="xp-row">
          <label className="field xp-field">
            <span className="field-label">Experiência (XP)</span>
            <input type="number" className="input" min={0} max={9999} value={s.xp}
              onChange={(e) => { const v = Math.max(0, Math.min(9999, Math.floor(Number(e.target.value) || 0))); update((d) => { d.xp = v; }); }} />
          </label>
          {suggested !== s.level && (
            <p className="small hint-line">
              Com {s.xp} XP o personagem está no nível {suggested}.{" "}
              <button type="button" className="link-btn" onClick={() => update((d) => setLevel(d, suggested))}>Usar nível {suggested}</button>
            </p>
          )}
        </div>
        <div className="table-wrap">
          <table className="prog-table">
            <thead><tr><th>Nível</th><th>XP</th><th>Bônus</th></tr></thead>
            <tbody>
              {LEVELS.map((l) => (
                <tr key={l.level} className={l.level === s.level ? "is-current" : l.level < s.level ? "is-past" : ""}>
                  <td>{l.level}</td><td>{l.xp}</td><td>{l.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="sub-box">
          <summary>As 5 perguntas de XP (1 XP por “sim” no fim da sessão)</summary>
          <ol className="xp-questions">{XP_QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
        </details>
      </div>

      <details className="panel desc-panel" open={DETAIL_FIELDS.some((f) => s.details[f.key])}>
        <summary>
          <span className="inc-title">Descrição</span>
          <span className="inc-sub">Opcional — aparência, história e anotações. Não afeta as regras.</span>
        </summary>
        <div className="desc-grid">
          {DETAIL_FIELDS.map((f) => (
            <label key={f.key} className="field field-wide">
              <span className="field-label">{f.label}</span>
              <textarea className="input" rows={3} maxLength={3000} placeholder={f.hint}
                value={s.details[f.key]} onChange={(e) => { const v = e.target.value; update((d) => { d.details[f.key] = v; }); }} />
            </label>
          ))}
        </div>
      </details>
    </>
  );
}

function PointsBar({ total, left, unit }: { total: number; left: number; unit: string }) {
  return (
    <div className={`points-meter ${left < 0 ? "is-over" : left === 0 ? "is-full" : ""}`}>
      {Array.from({ length: Math.max(total, total - left) }, (_, i) => <span key={i} className={i < total - left ? "is-spent" : ""} />)}
      <b>{left === 0 ? `Todos os ${unit} distribuídos` : left > 0 ? `${left} ${left === 1 ? unit.replace(/s$/, "") : unit} restante${left === 1 ? "" : "s"}` : "Acima do limite"}</b>
    </div>
  );
}

export function ConditionsPanel() {
  const s = useSacramento();
  const c = conditions(s);
  return (
    <div className="panel conditions">
      <h3 className="panel-title">Condições</h3>
      <div className="cond-grid">
        <div className="cond cond-wide" title={vidaParts(s).map((p) => `${p.label}: +${p.value}`).join("\n")}>
          <span>Círculos de Vida</span><b className="num">{c.vida}</b><Circles kind="vida" n={c.vida} />
        </div>
        <div className="cond cond-wide">
          <span>Círculos de Dor</span><b className="num">{c.dor}</b><Circles kind="dor" n={c.dor} />
        </div>
        <div className="cond"><span>Movimentos</span><b className="num">{c.movimentos}</b><small>1 + Velocidade</small></div>
        <div className="cond"><span>Ações de Combate</span><b className="num">{c.acoes}</b><small>1 + Coragem</small></div>
        <div className="cond"><span>Defesa</span><b className="num">{c.defesa}</b><small>{c.defesaFuria !== null ? `${c.defesaFuria} com Fúria dos Aflitos` : "padrão"}</small></div>
        <div className="cond"><span>Iniciativa</span><b className="small-b">{c.iniciativa}</b></div>
      </div>
    </div>
  );
}

export function AtributosStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const total = attrPoints(s), left = attrLeft(s);
  return (
    <>
      <div className="panel points-area">
        <p>
          Distribua <strong>{total} pontos</strong> entre os Atributos{total > 4 ? <> (4 iniciais + {total - 4} pelo nível)</> : null}.
          Atributo sem pontos deixa a Condição no valor inicial.
        </p>
        <PointsBar total={total} left={left} unit="pontos" />
      </div>
      <div className="attr-grid">
        {ATTRS.map((a) => (
          <div key={a.key} className="attr-tile">
            <div className="attr-head"><span className="attr-name">{a.label}</span><span className="attr-effect">{a.effect}</span></div>
            <div className="attr-ctrl">
              <button type="button" className="btn btn-icon" aria-label={`Diminuir ${a.label}`} disabled={!canChangeAttr(s, a.key, -1)} onClick={() => update((d) => changeAttr(d, a.key, -1))}>−</button>
              <b className="attr-value num" aria-live="polite">{s.attrs[a.key]}</b>
              <button type="button" className="btn btn-icon" aria-label={`Aumentar ${a.label}`} disabled={!canChangeAttr(s, a.key, 1)} onClick={() => update((d) => changeAttr(d, a.key, 1))}>+</button>
            </div>
            <p className="attr-desc">{a.desc}</p>
          </div>
        ))}
      </div>
      <ConditionsPanel />
    </>
  );
}

export function AntecedentesStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const total = antecedentPoints(s), left = antecedentLeft(s), max = antecedentMax(s);
  return (
    <>
      <div className="panel points-area">
        <p>
          Distribua <strong>{total} pontos</strong>: 4 + Intelecto ({s.attrs.intelecto}){s.level >= 2 ? " + 1 do nível 2" : ""}.
          É possível colocar mais de um ponto no mesmo Antecedente — {s.level === 1 ? <>no máximo <strong>2</strong> no nível 1</> : <>até <strong>{max}</strong></>}.
        </p>
        <PointsBar total={total} left={left} unit="pontos" />
        <p className="muted small">Teste de Antecedente: role 1d6 e some os pontos do Antecedente; igual ou maior que o Número-alvo (normalmente 6) é sucesso. Se falhar, dá para Forçar a Rolagem (NA cai 1, mas algo ruim acontece) — nunca em combate.</p>
      </div>
      <div className="ant-grid">
        {ANTECEDENTS.map((a) => {
          const v = s.antecedents[a.key];
          const roll = antecedentRoll(s, a.key);
          return (
            <div key={a.key} className={`ant-tile ${v ? "is-on" : ""}`}>
              <div className="ant-head">
                <span className="ant-name">{a.label}</span>
                <span className="ant-roll num">{roll.text}</span>
              </div>
              <div className="ant-dots" role="group" aria-label={`${a.label}: ${v} pontos`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`dot5 ${i < v ? "on" : ""} ${i >= max ? "locked" : ""}`} aria-hidden="true" />
                ))}
                <span className="ant-ctrl">
                  <button type="button" className="btn btn-icon" aria-label={`Diminuir ${a.label}`} disabled={!canChangeAntecedent(s, a.key, -1)} onClick={() => update((d) => changeAntecedent(d, a.key, -1))}>−</button>
                  <button type="button" className="btn btn-icon" aria-label={`Aumentar ${a.label}`} disabled={!canChangeAntecedent(s, a.key, 1)} onClick={() => update((d) => changeAntecedent(d, a.key, 1))}>+</button>
                </span>
              </div>
              <p className="attr-desc">{a.desc}</p>
              {roll.best.map((b) => <span key={b.skill} className="tag tag-pos">2d6, fica com o melhor ({b.skill}{b.when !== "sempre" ? ` — ${b.when}` : ""})</span>)}
            </div>
          );
        })}
      </div>
      <details className="panel sub-panel">
        <summary>Círculos de Dor: ao riscar o sexto, role 1d6</summary>
        <ol className="pain-table">{PAIN_TABLE.map((p) => <li key={p.roll}><b>{p.name}.</b> {p.effect}</li>)}</ol>
      </details>
    </>
  );
}
