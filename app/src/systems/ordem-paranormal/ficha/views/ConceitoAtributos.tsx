// ══════════════════════════════════════════════════════════════════
//  1 · CONCEITO   2 · ATRIBUTOS
// ══════════════════════════════════════════════════════════════════

import { rollDie } from "@/shared/browser";
import {
  ATTRS, ATTR_POINTS, canChangeAttr, changeAttr, pointsLeft, zeroAttr, type Details,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { useChangedAttrs } from "./ui";

const QUESTIONS = [
  "Qual o nome do seu personagem?",
  "O que ele fazia antes de encontrar o paranormal e entrar para a Ordem?",
  "Que evento desencadeou o primeiro contato?",
  "O quanto conhece do Outro Lado?",
  "Como se comporta em cenas de investigação?",
  "Como se comporta em cenas de ação?",
];

const DETAIL_FIELDS: { key: keyof Details; label: string; hint: string; long?: boolean }[] = [
  { key: "genero", label: "Gênero", hint: "Você não está restrito a personagens cisgênero ou binários." },
  { key: "idade", label: "Idade", hint: "De acordo com a origem, ou role 2d6+15 anos." },
  { key: "aparencia", label: "Aparência", hint: "Uma frase a partir dos traços marcantes — metáforas ajudam.", long: true },
  { key: "personalidade", label: "Personalidade", hint: "Três traços marcantes, um deles em conflito com os outros dois.", long: true },
  { key: "historico", label: "Histórico", hint: "Infância, família, contato com o paranormal; um evento bom e um ruim.", long: true },
  { key: "objetivo", label: "Objetivo", hint: "Por que faz parte da Ordem? Por que luta contra o Outro Lado?", long: true },
];

export function ConceitoStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);

  function rollAge() {
    const a = rollDie(6), b = rollDie(6);
    update((d) => { d.details.idade = `${a + b + 15} anos`; });
  }

  return (
    <>
      <div className="panel concept-panel">
        <label className="field">
          <span className="field-label">Nome do agente</span>
          <input type="text" className="input input-lg" maxLength={60} placeholder="Ex.: Bianca" autoComplete="off"
            value={s.name} onChange={(e) => { const v = e.target.value; update((d) => { d.name = v; }); }} />
        </label>
        <label className="field">
          <span className="field-label">Conceito em uma frase</span>
          <input type="text" className="input" maxLength={300} placeholder="Ex.: Cientista forense curiosa e corajosa, que nunca usou uma arma."
            value={s.concept} onChange={(e) => { const v = e.target.value; update((d) => { d.concept = v; }); }} />
        </label>
        <div className="questions">
          <span className="eyebrow">Perguntas para inspirar</span>
          <ol>{QUESTIONS.map((q) => <li key={q}>{q}</li>)}</ol>
          <p className="muted small">De acordo com o mestre, o personagem também pode ainda não conhecer o Outro Lado ou não ser um agente.</p>
        </div>
      </div>

      <details className="panel desc-panel" open={DETAIL_FIELDS.some((f) => s.details[f.key])}>
        <summary>
          <span className="inc-title">Descrição</span>
          <span className="inc-sub">Opcional — gênero, idade, aparência, personalidade, histórico e objetivo. Não afeta as regras.</span>
        </summary>
        <div className="desc-grid">
          {DETAIL_FIELDS.map((f) => (
            <label key={f.key} className={`field ${f.long ? "field-wide" : ""}`}>
              <span className="field-label">
                {f.label}
                {f.key === "idade" && <button type="button" className="link-btn" onClick={(e) => { e.preventDefault(); rollAge(); }}>Rolar 2d6+15</button>}
              </span>
              {f.long ? (
                <textarea className="input" rows={3} maxLength={2000} placeholder={f.hint}
                  value={s.details[f.key]} onChange={(e) => { const v = e.target.value; update((d) => { d.details[f.key] = v; }); }} />
              ) : (
                <input type="text" className="input" maxLength={80} placeholder={f.hint}
                  value={s.details[f.key]} onChange={(e) => { const v = e.target.value; update((d) => { d.details[f.key] = v; }); }} />
              )}
            </label>
          ))}
        </div>
      </details>
    </>
  );
}

export function AtributosStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const changed = useChangedAttrs(s);
  const left = pointsLeft(s);
  const zero = zeroAttr(s);

  return (
    <>
      <div className="panel points-area">
        <p>
          Todos os atributos começam em <strong>1</strong> e você tem <strong>{ATTR_POINTS} pontos</strong> para distribuir.
          Pode reduzir <strong>um</strong> atributo para <strong>0</strong> para receber 1 ponto adicional. O valor máximo inicial é <strong>3</strong>.
        </p>
        <div className={`points-meter ${left < 0 ? "is-over" : left === 0 ? "is-full" : ""}`}>
          {Array.from({ length: ATTR_POINTS + (zero ? 1 : 0) }, (_, i) => (
            <span key={i} className={i < ATTR_POINTS + (zero ? 1 : 0) - left ? "is-spent" : ""} />
          ))}
          <b>{left === 0 ? "Todos os pontos distribuídos" : left > 0 ? `${left} ponto${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}` : "Acima do limite"}</b>
        </div>
      </div>

      <div className="attr-grid">
        {ATTRS.map((a) => {
          const v = s.attrs[a.key];
          return (
            <div key={a.key} className={`attr-tile ${changed.has(a.key) ? "changed" : ""} ${v === 0 ? "is-zero" : ""}`}>
              <div className="attr-head">
                <span className="attr-abbr">{a.abbr}</span>
                <span className="attr-label">{a.label}</span>
              </div>
              <div className="attr-ctrl">
                <button type="button" className="btn btn-icon" aria-label={`Diminuir ${a.label}`} disabled={!canChangeAttr(s, a.key, -1)}
                  onClick={() => update((d) => changeAttr(d, a.key, -1))}>−</button>
                <b className="attr-value num" aria-live="polite">{v}</b>
                <button type="button" className="btn btn-icon" aria-label={`Aumentar ${a.label}`} disabled={!canChangeAttr(s, a.key, 1)}
                  onClick={() => update((d) => changeAttr(d, a.key, 1))}>+</button>
              </div>
              <div className="attr-dice">{v === 0 ? "2d20, fica com o pior" : `${v}d20, fica com o melhor`}</div>
              <p className="attr-desc">{a.desc}</p>
            </div>
          );
        })}
      </div>
      <p className="muted small">
        Atributos aumentam em NEX 20%, 50%, 80% e 95% (até 5) — escolha esses aumentos na etapa Poderes.
        Valores 1 são a média humana; 2 ou 3, acima da média; 4 ou 5, extraordinários.
      </p>
    </>
  );
}
