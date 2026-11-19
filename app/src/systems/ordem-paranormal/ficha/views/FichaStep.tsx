// ══════════════════════════════════════════════════════════════════
//  8 · FICHA FINAL — revisão, impressão, texto e JSON
// ══════════════════════════════════════════════════════════════════

import { useRef } from "react";
import { copyText, downloadJson, slugify } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import {
  ATTRS, CLASSES, GRADES, SKILLS, activeParas, attrFinal, blankState, canCastRituals, carryCapacity, currentDefense,
  currentPE, currentPV, currentSAN, currentTrail, defenseParts, diceText, elementLabel, expansionPowers, findPower,
  knownRituals, nexOf, originIndex, paranormalIndex, peLimit, peParts, pointsLeft, powerSlots, proficiencies,
  resistances, ritualCost, ritualDT, sanParts, sanitizeState, sheetReady, sheetText, simulateTraining, skillLine,
  activePowers, affinityActive, pvParts, versatilityTrail, type StepKey, type Part, type Element,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { ElementTag, goTo, useUi } from "./ui";
import { Sigil } from "../../components/OrdemShell";

function Missing() {
  const s = useOrdem();
  const missing: [StepKey, string][] = [];
  if (pointsLeft(s) !== 0) missing.push(["atributos", "Distribua os pontos de atributo"]);
  if (!s.origin) missing.push(["origem", "Escolha uma origem"]);
  if (!s.classKey) missing.push(["classe", "Escolha uma classe"]);
  return (
    <div className="panel missing">
      <h3>Quase lá</h3>
      <p className="muted">Para montar a ficha ainda falta:</p>
      <ul>{missing.map(([k, t]) => <li key={t}><button type="button" className="btn btn-sm" onClick={() => goTo(k)}>{t} →</button></li>)}</ul>
    </div>
  );
}

const partsTitle = (parts: Part[]) => parts.map((p) => `${p.label}: ${p.value >= 0 ? "+" : ""}${p.value}`).join("\n");

function Sheet() {
  const s = useOrdem();
  const cls = CLASSES[s.classKey!], origin = originIndex.get(s.origin!)!;
  const trail = currentTrail(s), vt = versatilityTrail(s);
  const nex = nexOf(s);
  const { grade } = simulateTraining(s);
  const rituals = knownRituals(s);
  const details = Object.entries({
    Gênero: s.details.genero, Idade: s.details.idade, Aparência: s.details.aparencia,
    Personalidade: s.details.personalidade, Histórico: s.details.historico, Objetivo: s.details.objetivo,
  }).filter(([, v]) => v.trim());

  return (
    <article className="sheet">
      <header className="sheet-head">
        <Sigil className="sheet-sigil" />
        <div className="sheet-title">
          <span className="eyebrow">Ordem Paranormal · Ficha de agente</span>
          <h3>{s.name || <span className="muted">Agente sem nome</span>}</h3>
          <p>{origin.label} · {cls.label}{trail ? ` · ${trail.label}` : ""}</p>
          {s.concept && <p className="sheet-concept">“{s.concept}”</p>}
        </div>
        <div className="sheet-nex"><span>NEX</span><b className="num">{nex}%</b></div>
      </header>

      <div className="sheet-attrs">
        {ATTRS.map((a) => (
          <div key={a.key}><span className="attr-full">{a.label}</span><span className="attr-short">{a.abbr}</span><b className="num">{attrFinal(s, a.key)}</b></div>
        ))}
      </div>

      <div className="sheet-vitals">
        <div title={partsTitle(pvParts(s))}><span>PV</span><b className="num">{currentPV(s)}</b></div>
        <div title={partsTitle(peParts(s))}><span>PE</span><b className="num">{currentPE(s)}</b></div>
        <div title={partsTitle(sanParts(s))}><span>Sanidade</span><b className="num">{currentSAN(s)}</b></div>
        <div title={partsTitle(defenseParts(s))}><span>Defesa</span><b className="num">{currentDefense(s)}</b></div>
        <div><span>Limite de PE</span><b className="num">{peLimit(s)}</b></div>
        <div><span>Deslocamento</span><b className="num">9m</b></div>
        <div><span>Carga</span><b className="num">{carryCapacity(s)}</b></div>
        {canCastRituals(s) && <div><span>DT rituais</span><b className="num">{ritualDT(s)}</b></div>}
      </div>

      <div className="sheet-cols">
        <section className="sheet-sec">
          <h4>Perícias</h4>
          <table className="sheet-table compact skills-table">
            <thead><tr><th>Perícia</th><th>Grau</th><th>Teste</th></tr></thead>
            <tbody>
              {SKILLS.map((k) => {
                const l = skillLine(s, k.name, grade.get(k.name));
                return (
                  <tr key={k.name} className={`${l.grade ? "is-trained" : ""} ${l.usable ? "" : "is-unusable"}`}>
                    <td><span className="dot" aria-hidden="true" />{k.name}{k.name === "Profissão" && s.profession ? <small> ({s.profession})</small> : null}{k.trainedOnly ? <sup title="Somente treinada">*</sup> : null}{k.load ? <sup title="Carga">+</sup> : null}</td>
                    <td>{l.grade ? GRADES[l.grade].label : ""}</td>
                    <td className="num strong">{l.usable ? diceText(l.dice, l.bonus) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small">* somente treinada · + penalidade de carga · atributo 0: role 2d20 e fique com o pior.</p>
        </section>

        <section className="sheet-sec">
          <h4>Habilidades e poderes</h4>
          <ul className="sheet-features">
            <li><b>{origin.power.name}</b> <small>(origem)</small> {origin.power.desc}</li>
            {cls.features.filter((f) => f.nex <= nex).map((f) => <li key={f.name}><b>{f.name}</b> <small>({f.nex}%)</small> {f.desc}</li>)}
            {trail?.abilities.filter((a) => a.nex <= nex).map((a) => <li key={a.name}><b>{a.name}</b> <small>({trail.label} {a.nex}%)</small> {a.desc}</li>)}
            {vt && <li><b>{vt.abilities[0].name}</b> <small>({vt.label}, Versatilidade)</small> {vt.abilities[0].desc}</li>}
            {powerSlots(s).filter((p) => p.pick).map((p) => {
              const def = findPower(p.pick!.id, s.classKey);
              const c = p.pick!.choice;
              const extra = c ? ` — ${def?.choice === "element" ? elementLabel(c as Element) : c}` : p.pick!.skills.length ? ` — ${p.pick!.skills.join(", ")}` : "";
              return <li key={p.nex}><b>{def?.name}{extra}</b> <small>({p.nex}%)</small> {def?.special === "transcender" ? "" : def?.desc}</li>;
            })}
            {activePowers(s).filter((a) => a.source === "versatility").map((a) => (
              <li key="v"><b>{a.def?.name}{a.pick.choice ? ` — ${a.pick.choice}` : ""}</b> <small>(Versatilidade)</small> {a.def?.special === "transcender" ? "" : a.def?.desc}</li>
            ))}
            {expansionPowers(s).map((x) => <li key={x.def.id}><b>{x.def.name}</b> <small>({CLASSES[x.cls].label}, Expansão de Conhecimento)</small> {x.def.desc}</li>)}
          </ul>
          {activeParas(s).length > 0 && (
            <>
              <h4 className="sheet-sub">Poderes paranormais{s.affinity ? <> · afinidade: <ElementTag el={s.affinity}>{elementLabel(s.affinity)}{affinityActive(s) ? "" : " (conectado)"}</ElementTag></> : null}</h4>
              <ul className="sheet-features">
                {activeParas(s).map((p, i) => {
                  const d = paranormalIndex.get(p.pick.id)!;
                  return (
                    <li key={i}>
                      <b>{d.name}{p.pick.element ? ` (${elementLabel(p.pick.element)})` : ""}{p.pick.id === "aprender-ritual" && p.pick.choice ? `: ${p.pick.choice}` : ""}</b>{" "}
                      <small>({p.source === "origin" ? "origem" : `${p.nex}%`})</small> {d.desc}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <h4 className="sheet-sub">Proficiências</h4>
          <p className="small">{proficiencies(s).join(", ")}.</p>
          {resistances(s).length > 0 && (<><h4 className="sheet-sub">Resistências</h4><p className="small">{resistances(s).join(" · ")}</p></>)}
        </section>
      </div>

      {rituals.length > 0 && (
        <section className="sheet-sec">
          <h4>Rituais <small className="muted">DT {ritualDT(s)}</small></h4>
          <div className="table-wrap">
          <table className="sheet-table compact">
            <thead><tr><th>Ritual</th><th>Círc.</th><th>Elemento</th><th>Execução</th><th>Alcance</th><th>Duração</th><th>PE</th></tr></thead>
            <tbody>
              {rituals.map((r) => (
                <tr key={r.def.name}>
                  <td><b>{r.def.name}</b>{r.grimoire ? <small className="muted"> (grimório)</small> : null}<br /><small className="muted">{r.def.summary}</small></td>
                  <td className="num">{r.def.circle}º</td>
                  <td>{r.element ? elementLabel(r.element) : "—"}</td>
                  <td>{r.def.exec}</td>
                  <td>{r.def.range}</td>
                  <td>{r.def.duration}</td>
                  <td className="num">{ritualCost(s, r.def, r.element)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}

      {details.length > 0 && (
        <section className="sheet-sec">
          <h4>Descrição</h4>
          <dl className="facts">{details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      )}
    </article>
  );
}

export function FichaStep() {
  const s = useOrdem();
  const replace = useFicha((x) => x.replace);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = sheetReady(s);

  function exportSheet() {
    downloadJson(`${slugify(s.name, "agente")}.json`, { app: "ordem-paranormal-ficha", version: 1, state: s });
    toast("Ficha exportada");
  }

  async function importSheet(file: File) {
    try {
      const json = JSON.parse(await file.text());
      const raw = json?.state ?? json;
      if (!raw || typeof raw !== "object" || !("attrs" in raw) || !("nexIndex" in raw)) throw new Error("formato");
      if (!confirm("Substituir a ficha atual pela importada?")) return;
      replace(sanitizeState(raw));
      toast("Ficha importada");
    } catch {
      toast("Arquivo inválido: não parece uma ficha exportada daqui");
    }
  }

  function newSheet() {
    if (!confirm("Começar uma nova ficha? A ficha atual será apagada deste navegador.")) return;
    replace(blankState());
    useUi.setState({ openPicker: null, ritualSearch: "" });
    goTo("conceito");
    toast("Nova ficha iniciada");
  }

  return (
    <>
      <div className="sheet-actions no-print">
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 18H4v-7h16v7h-3M7 14h10v7H7z" /></svg>
          Imprimir / PDF
        </button>
        <button type="button" className="btn" disabled={!ready} onClick={async () => toast((await copyText(sheetText(s))) ? "Ficha copiada como texto" : "Não foi possível copiar")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
          Copiar texto
        </button>
        <button type="button" className="btn" onClick={exportSheet}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
          Exportar
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 21h14" /></svg>
          Importar
        </button>
        <button type="button" className="btn btn-danger" onClick={newSheet}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Nova ficha
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importSheet(f); }} />
      </div>
      <div>{ready ? <Sheet /> : <Missing />}</div>
    </>
  );
}
