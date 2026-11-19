// ══════════════════════════════════════════════════════════════════
//  8 · FICHA FINAL — revisão, impressão, texto e JSON
// ══════════════════════════════════════════════════════════════════

import { useRef } from "react";
import { copyText, downloadJson, slugify } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import {
  ANTECEDENTS, ATTRS, CUSTOM_TRAIL, FIDELITY, PAIN_TABLE, antecedentLeft, antecedentRoll, attrLeft, blankState, conditions,
  fmtLines, fmtMoney, isRedeemed, moneyLeft, mountStats, ownedItems, packing, sanitizeState, scaleAt, sheetReady,
  sheetText, skillIndex, trailIndex, type StepKey,
} from "../engine";
import { useFicha, useSacramento } from "../store";
import { Circles, DamageTag, goTo, useUi } from "./ui";
import { Star } from "../../components/SacramentoShell";

function Missing() {
  const s = useSacramento();
  const missing: [StepKey, string][] = [];
  if (attrLeft(s) !== 0) missing.push(["atributos", "Distribua os pontos de Atributo"]);
  if (antecedentLeft(s) !== 0) missing.push(["antecedentes", "Distribua os pontos de Antecedente"]);
  return (
    <div className="panel missing">
      <h3>Quase lá, forasteiro</h3>
      <p className="muted">Para montar a ficha ainda falta:</p>
      <ul>{missing.map(([k, t]) => <li key={t}><button type="button" className="btn btn-sm" onClick={() => goTo(k)}>{t} →</button></li>)}</ul>
    </div>
  );
}

function Sheet() {
  const s = useSacramento();
  const c = conditions(s);
  const owned = ownedItems(s);
  const lines = packing(s).lines;
  const weapons = owned.filter((x) => x.def.damage);
  const items = owned.filter((x) => !x.def.damage);
  const skills = [...new Set(s.skills)];
  const r = s.redemption;
  const m = mountStats(s);

  return (
    <article className="sheet wanted">
      <header className="sheet-head">
        <Star className="sheet-sigil" />
        <div className="sheet-title">
          <span className="eyebrow">Sacramento RPG · Ficha de personagem</span>
          <h3>{s.name || <span className="muted">Forasteiro sem nome</span>}</h3>
          {s.concept && <p className="sheet-concept">“{s.concept}”</p>}
        </div>
        <div className="sheet-nex"><span>Nível</span><b className="num">{s.level}</b><small>{s.xp} XP</small></div>
      </header>

      <div className="sheet-attrs">
        {ATTRS.map((a) => <div key={a.key}><span>{a.label}</span><b className="num">{s.attrs[a.key]}</b></div>)}
      </div>

      <div className="sheet-vitals">
        <div><span>Movimentos</span><b className="num">{c.movimentos}</b></div>
        <div><span>Ações de Combate</span><b className="num">{c.acoes}</b></div>
        <div><span>Defesa</span><b className="num">{c.defesa}{c.defesaFuria !== null ? <small> ({c.defesaFuria} c/ Fúria)</small> : null}</b></div>
        <div><span>Iniciativa</span><b className="small-b">{c.iniciativa}</b></div>
      </div>

      <div className="sheet-cols">
        <section className="sheet-sec">
          <h4>Círculos de Dor</h4>
          <Circles kind="dor" n={c.dor} />
          <ol className="pain-table compact">{PAIN_TABLE.map((p) => <li key={p.roll}><b>{p.name}:</b> {p.effect}</li>)}</ol>
          <h4 className="sheet-sub">Círculos de Vida <small className="muted">({c.vida})</small></h4>
          <Circles kind="vida" n={c.vida} />
        </section>
        <section className="sheet-sec">
          <h4>Antecedentes</h4>
          <table className="sheet-table compact">
            <tbody>
              {ANTECEDENTS.map((a) => {
                const roll = antecedentRoll(s, a.key);
                return (
                  <tr key={a.key} className={s.antecedents[a.key] ? "is-trained" : ""}>
                    <td><span className="dot" aria-hidden="true" />{a.label}{roll.best.length ? <small className="muted"> · 2d6 ({roll.best.map((b) => b.skill).join(", ")})</small> : null}</td>
                    <td className="num strong">{roll.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small">Sucesso com resultado igual ou maior que o NA (normalmente 6).</p>
        </section>
      </div>

      <section className="sheet-sec">
        <h4>Habilidades</h4>
        <ul className="sheet-features">
          {skills.length ? skills.map((k) => {
            const def = skillIndex.get(k)!, n = s.skills.filter((x) => x === k).length, sc = scaleAt(def, s.level);
            return <li key={k}><b>{def.name}{n > 1 ? ` ×${n}` : ""}</b> {def.desc}{sc ? <> <b>{def.scale!.title} (nível {s.level}): {sc}.</b></> : null}</li>;
          }) : <li className="muted">Nenhuma escolhida.</li>}
        </ul>
      </section>

      {r.trail && (
        <section className="sheet-sec">
          <h4>Redenção · {r.trail === CUSTOM_TRAIL ? "Trilha própria" : trailIndex.get(r.trail)!.label}{isRedeemed(s) ? " · Redimido" : ""}</h4>
          <p className="sheet-concept">{r.premise}</p>
          <ol className="sheet-steps">
            {r.steps.map((st, i) => <li key={i} className={r.done[i] ? "is-done" : ""}><span className="box" aria-hidden="true">{r.done[i] ? "✕" : ""}</span>{st || <span className="muted">—</span>}</li>)}
          </ol>
        </section>
      )}

      <div className="sheet-cols">
        <section className="sheet-sec">
          <h4>Armas</h4>
          {weapons.length ? (
            <table className="sheet-table compact">
              <thead><tr><th>Arma</th><th>Dano</th><th>Balas</th></tr></thead>
              <tbody>
                {weapons.map((x) => (
                  <tr key={x.def.key}>
                    <td>{x.def.name}{x.qty > 1 ? ` ×${x.qty}` : ""}</td>
                    <td><DamageTag {...x.def.damage} />{x.def.damage2 && <DamageTag {...x.def.damage2} />}</td>
                    <td className="small">{x.def.bullets ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">Desarmado.</p>}
        </section>
        <section className="sheet-sec">
          <h4>Itens</h4>
          {items.length ? (
            <table className="sheet-table compact">
              <tbody>
                {items.map((x) => (
                  <tr key={x.def.key}><td>{x.def.name}{x.qty > 1 ? ` ×${x.qty}` : ""}</td><td className="small">{x.def.cat === "roupas" ? "vestida" : fmtLines(lines.get(x.def.key) ?? 0)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">Nada além da roupa do corpo.</p>}
          <p className="small"><b>Dinheiro:</b> {fmtMoney(moneyLeft(s))} · <b>Recompensa pela cabeça:</b> $0</p>
        </section>
      </div>

      {s.mount.enabled && (
        <section className="sheet-sec">
          <h4>Montaria · {s.mount.name || "sem nome"} <small className="muted">({s.mount.kind})</small></h4>
          <p className="small"><b>Potência</b> {m.potencia} ({m.teste}) · <b>Resistência</b> {m.resistencia} · <b>Fidelidade</b> {s.mount.fidelidade}: {FIDELITY[s.mount.fidelidade]}</p>
          <div className="mount-circles">
            <div><span className="eyebrow">Dor</span><Circles kind="dor" n={m.dor} /></div>
            <div><span className="eyebrow">Vida</span><Circles kind="vida" n={m.vida} /></div>
          </div>
        </section>
      )}

      {(s.details.aparencia || s.details.historia || s.details.notas) && (
        <section className="sheet-sec">
          <h4>Descrição</h4>
          <dl className="facts">
            {s.details.aparencia && <div><dt>Aparência</dt><dd>{s.details.aparencia}</dd></div>}
            {s.details.historia && <div><dt>História</dt><dd>{s.details.historia}</dd></div>}
            {s.details.notas && <div><dt>Anotações</dt><dd>{s.details.notas}</dd></div>}
          </dl>
        </section>
      )}
    </article>
  );
}

export function FichaStep() {
  const s = useSacramento();
  const replace = useFicha((x) => x.replace);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = sheetReady(s);

  function exportSheet() {
    downloadJson(`${slugify(s.name, "personagem")}.json`, { app: "sacramento-ficha", version: 1, state: s });
    toast("Ficha exportada");
  }

  async function importSheet(file: File) {
    try {
      const json = JSON.parse(await file.text());
      const raw = json?.state ?? json;
      if (!raw || typeof raw !== "object" || !("antecedents" in raw) || !("attrs" in raw)) throw new Error("formato");
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
    useUi.setState({ itemSearch: "" });
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
