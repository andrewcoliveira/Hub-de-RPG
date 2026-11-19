// ══════════════════════════════════════════════════════════════════
//  6 · PODERES — aumentos de atributo, poderes de classe, Versatilidade,
//  afinidade e poderes paranormais (Transcender).
// ══════════════════════════════════════════════════════════════════

import {
  AFFINITY_ELEMENTS, ATTRS, ATTR_INCREASE_NEX, CLASSES, ELEMENTS, RITUALS, SKILL_NAMES, activeParas, affinityActive,
  aprenderRitualCircle, attrFinal, attrIncreaseSlots, canIncreaseAttr, currentTrail, elementLabel, expansionOptions,
  findPower, fullPowerIssues, hasVersatility, knownRituals, nexOf, paraAt, paraIssues, paraOptions, paraRefNex,
  paranormalIndex, powerAt, powerOptions, powerSlots, refNex, setAttrIncrease, setPara, setPower, setVersatilityKind,
  trailsOf, updatePara, updatePower, versatilityIssues, activePowers, type ParaRef, type PowerRef, type Element,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { Check, ElementTag, Issues, goTo, useUi } from "./ui";

const refKey = (ref: PowerRef | ParaRef) => String(ref);

// ── Poder paranormal ──────────────────────────────────────────────

export function ParaPicker({ refKey: ref }: { refKey: ParaRef }) {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const open = useUi((u) => u.openPicker === `x${refKey(ref)}`);
  const pick = paraAt(s, ref);
  const def = pick ? paranormalIndex.get(pick.id) : null;
  const nex = paraRefNex(ref);
  const toggleOpen = () => useUi.setState({ openPicker: open ? null : `x${refKey(ref)}` });
  const ap = activeParas(s).find((p) => p.pick === pick);
  const issues = pick && ap ? paraIssues(s, ap).filter((i) => !i.startsWith("escolha")) : [];

  return (
    <div className="para-box">
      {def && pick ? (
        <div className="chosen">
          <div className="chosen-head">
            {def.element ? <ElementTag el={def.element} /> : <span className="el-tag el-medo">Varia</span>}
            <b>{def.name}</b>
            <button type="button" className="btn btn-sm btn-ghost" onClick={toggleOpen}>{open ? "Fechar" : "Trocar"}</button>
          </div>
          <p className="small muted">{def.desc}</p>
          {def.affinity && <p className="small"><b>Afinidade:</b> <span className="muted">{def.affinity}</span></p>}

          {def.choice === "element" && (
            <div className="chip-row" role="group" aria-label="Elemento">
              {AFFINITY_ELEMENTS.map((e) => (
                <button key={e.key} type="button" className={`chip el-chip el-${e.key}`} aria-pressed={pick.element === e.key}
                  onClick={() => update((d) => updatePara(d, ref, (p) => { p.element = e.key; }))}>{e.label}</button>
              ))}
            </div>
          )}
          {def.choice === "ritual" && (
            <div className="select-row">
              <select className="input" aria-label="Ritual aprendido" value={pick.choice ?? ""}
                onChange={(e) => { const v = e.target.value || null; update((d) => updatePara(d, ref, (p) => { p.choice = v; p.element = null; })); }}>
                <option value="">Escolha um ritual até {aprenderRitualCircle(nex)}º círculo…</option>
                {[1, 2, 3].filter((c) => c <= aprenderRitualCircle(nex)).map((c) => (
                  <optgroup key={c} label={`${c}º círculo`}>
                    {RITUALS.filter((r) => r.circle === c && !r.trailOnly).map((r) => (
                      <option key={r.name} value={r.name}>{r.name} — {r.elements.map(elementLabel).join("/")}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {pick.choice && RITUALS.find((r) => r.name === pick.choice)?.elements.length! > 1 && (
                <select className="input" aria-label="Elemento do ritual" value={pick.element ?? ""}
                  onChange={(e) => { const v = (e.target.value || null) as never; update((d) => updatePara(d, ref, (p) => { p.element = v; })); }}>
                  <option value="">Elemento…</option>
                  {AFFINITY_ELEMENTS.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              )}
            </div>
          )}
          {def.choice === "class-power" && (
            <select className="input" aria-label="Poder de outra classe" value={pick.choice ?? ""}
              onChange={(e) => { const v = e.target.value || null; update((d) => updatePara(d, ref, (p) => { p.choice = v; })); }}>
              <option value="">Escolha um poder de outra classe…</option>
              {expansionOptions(s).map(({ cls, def: pd }) => (
                <option key={`${cls}:${pd.id}`} value={`${cls}:${pd.id}`}>{CLASSES[cls].label} — {pd.name}</option>
              ))}
            </select>
          )}
          <Issues list={issues} />
        </div>
      ) : (
        <button type="button" className="btn btn-sm" onClick={toggleOpen}>{open ? "Fechar" : "Escolher poder paranormal"}</button>
      )}

      {open && (
        <div className="picker para-picker">
          {(["geral", ...AFFINITY_ELEMENTS.map((e) => e.key)] as const).map((group) => {
            const opts = paraOptions(s, ref).filter((o) => (group === "geral" ? !o.def.element : o.def.element === group));
            return (
              <div key={group} className="picker-group">
                <span className="eyebrow">{group === "geral" ? "Qualquer elemento" : `Poderes de ${elementLabel(group)}`}</span>
                <div className="picker-grid">
                  {opts.map(({ def: d, ok, note }) => (
                    <button key={d.id} type="button" className={`pick-option ${pick?.id === d.id ? "is-on" : ""} ${ok ? "" : "is-locked"}`}
                      onClick={() => { update((x) => setPara(x, ref, d.id)); useUi.setState({ openPicker: null }); }}>
                      <span className="po-head">
                        {d.element && <span className={`el-dot el-${d.element}`} aria-hidden="true" />}
                        <b>{d.name}</b>
                        {d.needs && d.element ? <span className={`prereq ${ok ? "ok" : "fail"}`}>{elementLabel(d.element)} {d.needs}</span> : null}
                        {note && ok && <span className="tag tag-gold">{note}</span>}
                        {note && !ok && <span className="prereq fail">{note}</span>}
                      </span>
                      <span className="po-desc">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Poder de classe ───────────────────────────────────────────────

function PowerSlot({ slotRef: pref, title }: { slotRef: PowerRef; title: string }) {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const open = useUi((u) => u.openPicker === `p${refKey(pref)}`);
  const pick = powerAt(s, pref);
  const def = pick ? findPower(pick.id, s.classKey) : null;
  const ap = activePowers(s).find((a) => (pref === "v" ? a.source === "versatility" : a.source === "slot" && a.slot === pref));
  const issues = ap ? fullPowerIssues(s, ap).filter((i) => !i.startsWith("escolha") && !i.includes(": escolha")) : [];
  const toggleOpen = () => useUi.setState({ openPicker: open ? null : `p${refKey(pref)}` });
  const known = knownRituals(s);

  return (
    <div className={`slot ${pick ? "is-filled" : ""} ${issues.length ? "is-warn" : ""}`}>
      <div className="slot-head">
        <span className="slot-nex">{title}</span>
        {def ? <b className="slot-name">{def.name}</b> : <span className="muted">Nenhum poder escolhido</span>}
        <button type="button" className={`btn btn-sm ${def ? "btn-ghost" : "btn-primary"}`} onClick={toggleOpen}>{open ? "Fechar" : def ? "Trocar" : "Escolher"}</button>
      </div>
      {def && pick && (
        <div className="slot-body">
          <p className="small muted">{def.desc}</p>
          {def.choice === "element" && (
            <div className="chip-row" role="group" aria-label="Elemento">
              {ELEMENTS.map((e) => (
                <button key={e.key} type="button" className={`chip el-chip el-${e.key}`} aria-pressed={pick.choice === e.key}
                  onClick={() => update((d) => updatePower(d, pref, (p) => { p.choice = e.key; }))}>{e.label}</button>
              ))}
            </div>
          )}
          {def.choice === "ritual" && (
            <select className="input" aria-label="Ritual predileto" value={pick.choice ?? ""}
              onChange={(e) => { const v = e.target.value || null; update((d) => updatePower(d, pref, (p) => { p.choice = v; })); }}>
              <option value="">{known.length ? "Escolha um ritual que você conhece…" : "Aprenda rituais na etapa Rituais"}</option>
              {known.map((r) => <option key={r.def.name} value={r.def.name}>{r.def.name} ({r.def.circle}º)</option>)}
            </select>
          )}
          {def.special === "treinamento" && (
            <div className="select-row">
              {[0, 1].map((i) => (
                <select key={i} className="input" aria-label={`Perícia ${i + 1}`} value={pick.skills[i] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => updatePower(d, pref, (p) => { const next = [...p.skills]; next[i] = v; p.skills = next.filter(Boolean); }));
                  }}>
                  <option value="">Perícia {i + 1}…</option>
                  {SKILL_NAMES.filter((k) => k === pick.skills[i] || !pick.skills.includes(k)).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              ))}
            </div>
          )}
          {def.special === "transcender" && <ParaPicker refKey={pref} />}
          <Issues list={issues} />
        </div>
      )}
      {open && (
        <div className="picker">
          <div className="picker-grid">
            {powerOptions(s, pref).map(({ def: d, checks, taken }) => {
              const ok = checks.every((c) => c.ok) && !taken;
              return (
                <button key={d.id} type="button" className={`pick-option ${pick?.id === d.id ? "is-on" : ""} ${ok ? "" : "is-locked"}`} disabled={taken}
                  onClick={() => { update((x) => setPower(x, pref, d.id)); useUi.setState({ openPicker: null }); }}>
                  <span className="po-head">
                    <b>{d.name}</b>
                    {d.repeatable && <span className="tag">repetível</span>}
                    {taken && <span className="tag">já escolhido</span>}
                    {checks.map((c) => <span key={c.label} className={`prereq ${c.ok ? "ok" : "fail"}`}>{c.label}</span>)}
                  </span>
                  <span className="po-desc">{d.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Etapa ─────────────────────────────────────────────────────────

export function PoderesStep() {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  if (!s.classKey) {
    return (
      <div className="hint-box">
        Os poderes dependem da classe e do NEX.
        <button type="button" className="btn btn-sm btn-primary" onClick={() => goTo("classe")}>Escolher classe</button>
      </div>
    );
  }
  const cls = CLASSES[s.classKey];
  const nex = nexOf(s);
  const incSlots = attrIncreaseSlots(s);
  const slots = powerSlots(s);
  const vers = hasVersatility(s);
  const trail = currentTrail(s);
  const paras = activeParas(s);

  return (
    <>
      {!incSlots && !slots.length && !vers && (
        <div className="hint-box">
          Em NEX {nex}% você ainda não tem poderes de classe nem aumentos de atributo — eles chegam em NEX 15% e 20%.
          {s.origin === "cultista-arrependido" && " O poder paranormal de Traços do Outro Lado é escolhido na etapa Origem."}
        </div>
      )}

      {incSlots > 0 && (
        <section className="panel power-section">
          <h3 className="panel-title">Aumento de atributo</h3>
          <p className="panel-sub">+1 em um atributo à sua escolha em NEX 20%, 50%, 80% e 95% (máximo 5). PV e PE são recalculados retroativamente.</p>
          <div className="inc-list">
            {Array.from({ length: incSlots }, (_, i) => (
              <div key={i} className="inc-line">
                <span className="slot-nex">NEX {ATTR_INCREASE_NEX[i]}%</span>
                <div className="chip-row" role="group" aria-label={`Aumento de atributo de NEX ${ATTR_INCREASE_NEX[i]}%`}>
                  {ATTRS.map((a) => {
                    const on = s.attrIncreases[i] === a.key;
                    return (
                      <button key={a.key} type="button" className="chip" aria-pressed={on} disabled={!on && !canIncreaseAttr(s, i, a.key)}
                        onClick={() => update((d) => setAttrIncrease(d, i, on ? null : a.key))}>
                        {a.abbr} <span className="count">{attrFinal(s, a.key)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {slots.length > 0 && (
        <section className="power-section">
          <header className="section-mini">
            <h3>Poderes de {cls.label.toLowerCase()}</h3>
            <p className="muted">Um poder em NEX 15% e a cada 15% seguintes. Você pode escolher um poder no mesmo NEX em que atinge os pré-requisitos.</p>
          </header>
          <div className="slot-list">
            {slots.map((p) => <PowerSlot key={p.nex} slotRef={p.ref} title={`NEX ${p.nex}%`} />)}
          </div>
        </section>
      )}

      {vers && (
        <section className="panel power-section">
          <h3 className="panel-title">Versatilidade (NEX 50%)</h3>
          <p className="panel-sub">Escolha entre um poder de {cls.label.toLowerCase()} ou o primeiro poder de uma trilha de {cls.label.toLowerCase()} que não a sua.</p>
          <div className="segmented" role="group" aria-label="Versatilidade">
            <button type="button" aria-pressed={s.versatility?.kind === "power"} onClick={() => update((d) => setVersatilityKind(d, "power"))}>Poder de classe</button>
            <button type="button" aria-pressed={s.versatility?.kind === "trail"} onClick={() => update((d) => setVersatilityKind(d, "trail"))}>Outra trilha</button>
          </div>
          {s.versatility?.kind === "power" && <PowerSlot slotRef="v" title="Versatilidade" />}
          {s.versatility?.kind === "trail" && (
            <div className="trail-grid trail-grid-sm">
              {trailsOf(s.classKey).filter((t) => t.key !== s.trail).map((t) => {
                const on = s.versatility?.kind === "trail" && s.versatility.trail === t.key;
                return (
                  <button key={t.key} type="button" className={`trail-card ${on ? "is-selected" : ""}`} aria-pressed={on}
                    onClick={() => update((d) => { d.versatility = { kind: "trail", trail: t.key }; })}>
                    <span className="trail-name">{t.label}</span>
                    <span className="trail-desc"><b>{t.abilities[0].name}:</b> {t.abilities[0].desc}</span>
                    {t.requires && <span className="tag tag-warn">Requer {t.requires.trained}</span>}
                    <span className="pick-check" aria-hidden="true"><Check /></span>
                  </button>
                );
              })}
            </div>
          )}
          <Issues list={versatilityIssues(s).filter((i) => !i.startsWith("escolha"))} />
          {!trail && <p className="muted small">Você ainda não escolheu sua trilha (etapa Classe & NEX).</p>}
        </section>
      )}

      {nex >= 50 && (
        <section className="panel power-section">
          <h3 className="panel-title">Afinidade elemental (NEX 50%)</h3>
          <p className="panel-sub">
            Ao atingir NEX 50% você se conecta a um elemento (escolha definitiva). Na primeira vez que transcender depois disso, desenvolve afinidade:
            conjura rituais desse elemento sem componentes, recebe +2d20 contra efeitos dele (–2d20 contra o elemento opressor) e pode escolher poderes
            paranormais dele uma segunda vez para receber o benefício de afinidade.
          </p>
          <div className="chip-row" role="group" aria-label="Elemento de afinidade">
            {AFFINITY_ELEMENTS.map((e) => (
              <button key={e.key} type="button" className={`chip el-chip el-${e.key}`} aria-pressed={s.affinity === e.key}
                onClick={() => update((d) => { d.affinity = e.key; })}>{e.label}</button>
            ))}
          </div>
          {s.affinity && (
            <p className={`small ${affinityActive(s) ? "ok-text" : "muted"}`}>
              {affinityActive(s) ? `Afinidade com ${elementLabel(s.affinity)} ativa.` : `Conectado a ${elementLabel(s.affinity)} — a afinidade surge na próxima vez que transcender (poder Transcender em NEX 50% ou depois).`}
            </p>
          )}
        </section>
      )}

      {paras.length > 0 && (
        <section className="panel power-section">
          <h3 className="panel-title">Poderes paranormais</h3>
          <ul className="para-summary">
            {paras.map((p, i) => {
              const d = paranormalIndex.get(p.pick.id)!;
              const el = d.element ?? (p.pick.element as Element | null);
              return (
                <li key={i}>
                  {el ? <ElementTag el={el} /> : <span className="el-tag el-medo">—</span>}
                  <b>{d.name}</b>{p.pick.id === "aprender-ritual" && p.pick.choice ? `: ${p.pick.choice}` : ""}
                  <span className="muted small">{p.source === "origin" ? "Traços do Outro Lado" : `Transcender · NEX ${p.nex}%`}</span>
                </li>
              );
            })}
          </ul>
          <p className="muted small">Cada Transcender custa a Sanidade daquele aumento de NEX.</p>
        </section>
      )}
      <p className="muted small">Pré-requisitos de NEX contam o NEX do espaço em que o poder foi escolhido (NEX {refNex(0)}%, {refNex(1)}%…).</p>
    </>
  );
}
