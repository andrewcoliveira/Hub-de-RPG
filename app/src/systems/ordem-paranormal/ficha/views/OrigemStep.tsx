// ══════════════════════════════════════════════════════════════════
//  3 · ORIGEM
// ══════════════════════════════════════════════════════════════════

import { rollDie } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import {
  ORIGINS, SKILL_NAMES, classSkills, originForRoll, originIndex, originPending, selectOrigin, setOriginSkill,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { Check, Issues, useDetailPanel, useUi } from "./ui";
import { ParaPicker } from "./PoderesStep";

export function OrigemStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const { ref, entering } = useDetailPanel(s.origin);
  const o = s.origin ? originIndex.get(s.origin)! : null;

  function pick(key: string) {
    if (key === s.origin) return;
    useUi.setState({ scrollDetail: true });
    update((d) => selectOrigin(d, key));
  }

  function roll() {
    const a = rollDie(20), b = rollDie(20);
    const origin = originForRoll(a + b);
    pick(origin.key);
    toast(`2d20 → ${a} + ${b} = ${a + b}: ${origin.label}`);
  }

  const pending = originPending(s);

  return (
    <>
      <div className="toolbar">
        <p className="muted toolbar-text">Ao escolher uma origem você recebe <b>duas perícias treinadas</b> e <b>um poder da origem</b>.</p>
        <button type="button" className="btn" onClick={roll}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 2v20M3 7l18 10M21 7L3 17" /></svg>
          Rolar 2d20
        </button>
      </div>

      <div className="origin-grid">
        {ORIGINS.map((origin) => {
          const on = origin.key === s.origin;
          return (
            <button key={origin.key} type="button" className={`origin-card ${on ? "is-selected" : ""}`} aria-pressed={on} onClick={() => pick(origin.key)}>
              <span className="origin-roll num">{origin.roll[0] === origin.roll[1] ? origin.roll[0] : `${origin.roll[0]}–${origin.roll[1]}`}</span>
              <span className="origin-name">{origin.label}</span>
              <span className="origin-skills">{origin.skills.length ? origin.skills.map((k) => k === "Profissão" && origin.profession ? `Profissão (${origin.profession})` : k).join(" · ") : "Duas à escolha do mestre"}</span>
              <span className="origin-power">{origin.power.name}</span>
              <span className="pick-check" aria-hidden="true"><Check /></span>
            </button>
          );
        })}
      </div>

      <div ref={ref}>
        {!o ? (
          <div className="hint-box">Escolha uma origem ou role 2d20 na Tabela 1.1.</div>
        ) : (
          <article className={`panel detail dossier ${entering ? "is-entering" : ""}`}>
            <div className="detail-text">
              <span className="eyebrow">Origem escolhida</span>
              <h3>{o.label}</h3>
              <p>{o.desc}</p>
            </div>
            <dl className="facts">
              <div><dt>Perícias treinadas</dt><dd>{o.skills.length ? o.skills.join(" e ") : "Duas à escolha do mestre"}</dd></div>
              <div><dt>Poder · {o.power.name}</dt><dd>{o.power.desc}</dd></div>
            </dl>

            {o.key === "amnesico" && (
              <div className={`choice-box ${s.originSkills.length === 2 ? "is-done" : ""}`}>
                <div className="choice-head">
                  <b>Perícias do Amnésico (combine com o mestre)</b>
                  <span className={`tag ${s.originSkills.length === 2 ? "tag-pos" : "tag-warn"}`}>{s.originSkills.length}/2</span>
                </div>
                <div className="select-row">
                  {[0, 1].map((i) => (
                    <select key={i} className="input" aria-label={`Perícia ${i + 1} do Amnésico`} value={s.originSkills[i] ?? ""}
                      onChange={(e) => { const v = e.target.value || null; update((d) => setOriginSkill(d, i, v)); }}>
                      <option value="">Escolha…</option>
                      {SKILL_NAMES.filter((k) => k === s.originSkills[i] || !s.originSkills.includes(k)).map((k) => (
                        <option key={k} value={k}>{k}{classSkills(s).includes(k) ? " (também da classe)" : ""}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            )}

            {o.key === "cultista-arrependido" && (
              <div className={`choice-box ${s.originPara && !pending.length ? "is-done" : ""}`}>
                <div className="choice-head">
                  <b>Traços do Outro Lado: escolha um poder paranormal</b>
                  <span className="tag tag-warn">Metade da Sanidade inicial</span>
                </div>
                <ParaPicker refKey="origin" />
              </div>
            )}

            {o.skills.includes("Profissão") && (
              <label className="field">
                <span className="field-label">Qual profissão?</span>
                <input type="text" className="input" maxLength={40} placeholder="Ex.: engenheiro civil, advogado, pedreiro…"
                  value={s.profession} onChange={(e) => { const v = e.target.value; update((d) => { d.profession = v; }); }} />
              </label>
            )}
            <Issues list={pending.filter((p) => !p.startsWith("Escolha"))} />
          </article>
        )}
      </div>
    </>
  );
}
