// ══════════════════════════════════════════════════════════════════
//  5 · PERÍCIAS
// ══════════════════════════════════════════════════════════════════

import { toast } from "@/shared/components/Toaster";
import {
  CLASSES, GRADES, GRAU_NEX, SKILLS, activePowers, attrFinal, attrInfo, classSkills, diceText, freeSkillTotal,
  freeSkillsUsed, grauCount, grauSlotCount, originIndex, originSkills, overlapSkills, setClassSkill, simulateTraining,
  skillLine, skillMiscBonuses, skillsWarnings, toggleFreeSkill, toggleGrau, togglePerito,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { Check, Issues, Meter, goTo, useUi } from "./ui";

const FILTERS = [
  { f: "all", label: "Todas" },
  { f: "trained", label: "Treinadas" },
  { f: "untrained", label: "Não treinadas" },
] as const;

export function PericiasStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const filter = useUi((u) => u.skillFilter);

  if (!s.classKey) {
    return (
      <div className="hint-box">
        As perícias dependem da origem e da classe.
        <button type="button" className="btn btn-sm btn-primary" onClick={() => goTo("classe")}>Escolher classe</button>
      </div>
    );
  }

  const cls = CLASSES[s.classKey];
  const { grade } = simulateTraining(s);
  const fromOrigin = new Set(originSkills(s));
  const fromClass = new Set(classSkills(s));
  const free = freeSkillsUsed(s);
  const total = freeSkillTotal(s);
  const overlap = overlapSkills(s);
  const trainedByPower = new Map<string, number>();
  activePowers(s).forEach((ap) => {
    if (ap.def?.special === "treinamento") ap.pick.skills.forEach((k) => trainedByPower.set(k, ap.nex));
  });
  const int = attrFinal(s, "int");
  const shown = SKILLS.filter((k) => filter === "all" || (filter === "trained" ? (grade.get(k.name) ?? 0) > 0 : !grade.get(k.name)));
  const warnings = skillsWarnings(s);

  function toggle(name: string) {
    const r = update((d) => toggleFreeSkill(d, name));
    if (r === "full") toast(`Limite de ${total} perícias à escolha atingido`);
  }

  return (
    <>
      <div className="panel toolbar">
        <div className="toolbar-meter">
          <Meter label="Perícias à sua escolha" used={free.length} total={total}
            note={<>{cls.label}: {cls.freeSkills} + Int ({int}){overlap.length ? ` + ${overlap.length} repetida${overlap.length > 1 ? "s" : ""} com a origem (${overlap.join(", ")})` : ""}</>} />
        </div>
        <div className="chip-row" role="group" aria-label="Filtrar perícias">
          {FILTERS.map(({ f, label }) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => useUi.setState({ skillFilter: f })}>{label}</button>
          ))}
        </div>
      </div>

      {(cls.skillGroups.length > 0 || cls.fixedSkills.length > 0 || s.origin) && (
        <div className="panel fixed-skills">
          {s.origin && (
            <p><span className="src-tag src-origin">Origem</span> {originIndex.get(s.origin)!.label}: {originSkills(s).join(" e ") || <span className="muted">escolha na etapa Origem</span>}</p>
          )}
          {cls.fixedSkills.length > 0 && <p><span className="src-tag src-class">Classe</span> {cls.fixedSkills.join(" e ")}</p>}
          {cls.skillGroups.map((g, i) => (
            <div key={g.join()} className="group-pick">
              <span className="src-tag src-class">Classe</span>
              <span>Escolha uma:</span>
              <div className="segmented" role="group" aria-label={g.join(" ou ")}>
                {g.map((k) => (
                  <button key={k} type="button" aria-pressed={s.classSkills[i] === k} onClick={() => update((d) => setClassSkill(d, i, k))}>{k}</button>
                ))}
              </div>
            </div>
          ))}
          {overlap.length > 0 && <p className="muted small">Perícia recebida pela origem e pela classe: escolha outra no lugar (vaga extra já somada).</p>}
        </div>
      )}

      <div className="skills-list">
        {shown.map((k) => {
          const g = grade.get(k.name) ?? 0;
          const locked = fromOrigin.has(k.name) || fromClass.has(k.name);
          const isFree = free.includes(k.name);
          const on = locked || isFree;
          const full = !on && free.length >= total;
          const line = skillLine(s, k.name, g);
          const misc = skillMiscBonuses(s, k.name);
          return (
            <div key={k.name} className={`skill-row ${on || g ? "is-on" : ""} ${full ? "is-full" : ""}`}>
              <button type="button" className="skill-toggle" aria-pressed={on} disabled={locked}
                title={locked ? "Treinada pela origem/classe" : undefined} onClick={() => toggle(k.name)}>
                <span className="check" aria-hidden="true"><Check /></span>
                <span>{k.name}{k.name === "Profissão" && s.profession ? <small className="muted"> ({s.profession})</small> : null}</span>
              </button>
              <div className="skill-meta">
                <span className="tag">{attrInfo(k.attr).abbr}</span>
                {fromOrigin.has(k.name) && <span className="src-tag src-origin">Origem</span>}
                {fromClass.has(k.name) && <span className="src-tag src-class">Classe</span>}
                {trainedByPower.has(k.name) && <span className="src-tag src-power">Treinamento {trainedByPower.get(k.name)}%</span>}
                {g > 0 && <span className={`grade-badge g${g}`}>{GRADES[g].label}</span>}
                {k.trainedOnly && <span className="tag" title="Só pode ser usada por quem é treinado">Somente treinada</span>}
                {k.load && <span className="tag" title="Sofre penalidade de carga">Carga</span>}
                {misc.map((b) => <span key={b.label} className="tag tag-pos" title={b.label}>+{b.value} {b.label}</span>)}
              </div>
              <div className={`skill-bonus ${line.usable ? "" : "is-off"}`}>
                <b className="num">{line.usable ? diceText(line.dice, line.bonus) : "—"}</b>
                <small>{line.usable ? `${GRADES[g].label} (+${GRADES[g].bonus})` : "não treinada"}</small>
              </div>
            </div>
          );
        })}
      </div>

      {grade.get("Profissão") ? (
        <label className="panel field">
          <span className="field-label">Profissão — qual?</span>
          <input type="text" className="input" maxLength={40} placeholder="Ex.: cozinheiro, advogado, engenheiro…"
            value={s.profession} onChange={(e) => { const v = e.target.value; update((d) => { d.profession = v; }); }} />
        </label>
      ) : null}

      {s.classKey === "especialista" && (
        <div className={`choice-box ${s.perito.length === 2 ? "is-done" : ""}`}>
          <div className="choice-head">
            <b>Perito: duas perícias treinadas (exceto Luta e Pontaria)</b>
            <span className={`tag ${s.perito.length === 2 ? "tag-pos" : "tag-warn"}`}>{s.perito.length}/2</span>
          </div>
          <div className="chip-row">
            {SKILLS.filter((k) => (grade.get(k.name) ?? 0) > 0 && k.name !== "Luta" && k.name !== "Pontaria").map((k) => {
              const on = s.perito.includes(k.name);
              return <button key={k.name} type="button" className="chip" aria-pressed={on} disabled={!on && s.perito.length >= 2}
                onClick={() => update((d) => togglePerito(d, k.name))}>{k.name}</button>;
            })}
          </div>
        </div>
      )}

      {Array.from({ length: grauSlotCount(s) }, (_, i) => {
        const list = s.grau[i];
        const n = grauCount(s);
        return (
          <div key={i} className={`choice-box ${list.length === n ? "is-done" : ""}`}>
            <div className="choice-head">
              <b>Grau de Treinamento (NEX {GRAU_NEX[i]}%): {n} perícias treinadas sobem um grau</b>
              <span className={`tag ${list.length === n ? "tag-pos" : "tag-warn"}`}>{list.length}/{n}</span>
            </div>
            <p className="muted small">{cls.grauBase} + Int. {i === 0 ? "Treinado → veterano." : "Treinado → veterano ou veterano → expert."}</p>
            <div className="chip-row">
              {SKILLS.filter((k) => (grade.get(k.name) ?? 0) > 0 || list.includes(k.name)).map((k) => {
                const on = list.includes(k.name);
                return <button key={k.name} type="button" className="chip" aria-pressed={on} disabled={!on && list.length >= n}
                  onClick={() => update((d) => toggleGrau(d, i as 0 | 1, k.name))}>{k.name}</button>;
              })}
            </div>
          </div>
        );
      })}

      <Issues list={warnings} />
      <p className="muted small">
        Teste = role d20 iguais ao atributo-base e fique com o maior, somando o bônus do grau: treinado +5, veterano +10, expert +15.
        Perícias “somente treinada” não podem ser usadas sem treinamento.
      </p>
    </>
  );
}
