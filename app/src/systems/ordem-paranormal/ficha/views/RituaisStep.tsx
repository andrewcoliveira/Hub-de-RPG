// ══════════════════════════════════════════════════════════════════
//  7 · RITUAIS
// ══════════════════════════════════════════════════════════════════

import { toast } from "@/shared/components/Toaster";
import {
  AFFINITY_ELEMENTS, ELEMENTS, POOL_LABEL, RITUALS, RITUAL_COST, currentTrail, elementLabel, grantedRituals, matchRituals,
  maxCircle, nexOf, ritualCost, ritualDT, ritualSlots, ritualUsage, toggleRitual, type RitualDef,
} from "../engine";
import { useFicha, useOrdem } from "../store";
import { ElementTag, Meter, goTo, useUi } from "./ui";

function RitualCard({ r }: { r: RitualDef }) {
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const idx = s.rituals.findIndex((x) => x.name === r.name);
  const chosen = idx >= 0 ? s.rituals[idx] : null;
  const granted = grantedRituals(s).find((g) => g.name === r.name);
  const max = maxCircle(s);
  const tooHigh = r.circle > max;
  const { slotOf } = matchRituals(s);
  const noSlot = chosen && slotOf[idx] === null;
  const grimoire = currentTrail(s)?.key === "graduado" && nexOf(s) >= 40;
  const el = chosen?.element ?? (r.elements.length === 1 ? r.elements[0] : null);

  function toggle() {
    const res = update((d) => toggleRitual(d, r.name));
    if (res === "full") toast("Sem vagas para rituais deste círculo");
    else if (res === "invalid") toast(r.trailOnly ? "Este ritual só é aprendido por um poder de trilha" : `Você ainda não pode lançar rituais de ${r.circle}º círculo`);
  }

  return (
    <article className={`ritual ${chosen || granted ? "is-on" : ""} ${tooHigh || r.trailOnly ? "is-locked" : ""} ${noSlot ? "is-warn" : ""}`}>
      <header className="ritual-head">
        <div className="ritual-title">
          <span className="circle-badge" title={`${r.circle}º círculo`}>{r.circle}º</span>
          <h4>{r.name}</h4>
          {r.elements.length > 1 ? <span className="el-tag el-medo">Qualquer elemento</span> : <ElementTag el={r.elements[0]} />}
        </div>
        {granted ? (
          <span className="tag tag-pos" title={granted.source}>{granted.source}</span>
        ) : s.classKey === "ocultista" && !r.trailOnly ? (
          <button type="button" className={`btn btn-sm ${chosen ? "is-remove" : ""}`} disabled={!chosen && tooHigh} onClick={toggle}>
            {chosen ? "Esquecer" : "Aprender"}
          </button>
        ) : r.trailOnly ? <span className="tag">Poder de trilha</span> : null}
      </header>
      <p className="ritual-summary">{r.summary}</p>
      <dl className="ritual-stats">
        <div><dt>Execução</dt><dd>{r.exec}</dd></div>
        <div><dt>Alcance</dt><dd>{r.range}</dd></div>
        <div><dt>{r.target.split(":")[0]}</dt><dd>{r.target.split(":").slice(1).join(":").trim()}</dd></div>
        <div><dt>Duração</dt><dd>{r.duration}</dd></div>
        {r.resistance && <div><dt>Resistência</dt><dd>{r.resistance}</dd></div>}
      </dl>
      <footer className="ritual-foot">
        <span className="tag">{chosen || granted ? ritualCost(s, r, el) : RITUAL_COST[r.circle]} PE</span>
        {r.discente !== null && <span className="tag">Discente +{r.discente} PE</span>}
        {r.verdadeiro !== null && <span className="tag">Verdadeiro +{r.verdadeiro} PE</span>}
        {chosen && r.elements.length > 1 && (
          <select className="input input-sm" aria-label="Elemento de Amaldiçoar Arma" value={chosen.element ?? ""}
            onChange={(e) => { const v = (e.target.value || null) as never; update((d) => { d.rituals[idx].element = v; }); }}>
            <option value="">Elemento…</option>
            {AFFINITY_ELEMENTS.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
        )}
        {chosen && grimoire && (
          <label className="switch switch-sm">
            <input type="checkbox" checked={chosen.grimoire}
              onChange={(e) => { const v = e.target.checked; update((d) => { d.rituals[idx].grimoire = v; }); }} />
            <span className="switch-track" aria-hidden="true" />
            <span>No grimório</span>
          </label>
        )}
        {noSlot && <span className="tag tag-warn">sem vaga</span>}
      </footer>
    </article>
  );
}

export function RituaisStep() {
  const s = useOrdem();
  const circle = useUi((u) => u.ritualCircle);
  const element = useUi((u) => u.ritualElement);
  const search = useUi((u) => u.ritualSearch);
  const onlyKnown = useUi((u) => u.onlyKnown);

  if (!s.classKey) {
    return (
      <div className="hint-box">
        Rituais dependem da classe.
        <button type="button" className="btn btn-sm btn-primary" onClick={() => goTo("classe")}>Escolher classe</button>
      </div>
    );
  }

  const isOcc = s.classKey === "ocultista";
  const granted = grantedRituals(s);
  const usage = ritualUsage(s);
  const slots = ritualSlots(s);
  const max = maxCircle(s);
  const q = search.trim().toLocaleLowerCase("pt");
  const known = new Set([...s.rituals.map((r) => r.name), ...granted.map((g) => g.name)]);
  const list = RITUALS.filter((r) =>
    (circle === "all" || r.circle === circle) &&
    (element === "all" || r.elements.includes(element)) &&
    (!q || `${r.name} ${r.summary}`.toLocaleLowerCase("pt").includes(q)) &&
    (!onlyKnown || known.has(r.name)))
    .sort((a, b) => a.circle - b.circle || a.name.localeCompare(b.name, "pt"));

  return (
    <>
      {!isOcc && (
        <div className="panel">
          <h3 className="panel-title">Rituais para {s.classKey === "combatente" ? "combatentes" : "especialistas"}</h3>
          <p className="panel-sub">
            Só ocultistas conjuram rituais pela classe. Qualquer agente pode aprender rituais com o poder paranormal <b>Aprender Ritual</b>
            (escolhido ao Transcender, na etapa Poderes), até um número igual ao seu Intelecto.
          </p>
          {granted.length ? <p className="small">Rituais conhecidos: {granted.map((g) => g.name).join(", ")}.</p> : null}
        </div>
      )}

      {isOcc && (
        <div className="panel toolbar ritual-toolbar">
          {usage.map((u) => (
            <div key={u.pool} className="toolbar-meter">
              <Meter label={POOL_LABEL[u.pool]} used={u.used} total={u.total}
                note={u.pool === "classe" ? `3 de 1º círculo + 1 por NEX alcançado depois de 5% · até ${max}º círculo` : u.pool === "graduado" ? "Trilha Graduado: 1 por círculo acessado" : "Intelecto de 1º/2º círculo + 1 de cada novo círculo"} />
            </div>
          ))}
          <div className="ritual-facts">
            <div><span>Círculo máximo</span><b>{max}º</b></div>
            <div><span>DT dos rituais</span><b className="num">{ritualDT(s)}</b></div>
            <div><span>Custo</span><b className="num small">1 · 3 · 6 · 10 PE</b></div>
          </div>
        </div>
      )}
      {slots.length > 0 && <p className="muted small">Os rituais são encaixados nas vagas automaticamente: as vagas iniciais aceitam só 1º círculo; as de novos NEX, qualquer círculo que você possa lançar.</p>}

      {granted.length > 0 && isOcc && (
        <p className="small"><b>Concedidos:</b> {granted.map((g) => `${g.name} (${g.source})`).join(" · ")}</p>
      )}

      <div className="ritual-filters">
        <div className="chip-row" role="group" aria-label="Círculo">
          {(["all", 1, 2, 3, 4] as const).map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={circle === c} onClick={() => useUi.setState({ ritualCircle: c })}>
              {c === "all" ? "Todos" : `${c}º círculo`}
            </button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="Elemento">
          <button type="button" className="chip" aria-pressed={element === "all"} onClick={() => useUi.setState({ ritualElement: "all" })}>Todos</button>
          {ELEMENTS.map((e) => (
            <button key={e.key} type="button" className={`chip el-chip el-${e.key}`} aria-pressed={element === e.key} onClick={() => useUi.setState({ ritualElement: e.key })}>{e.label}</button>
          ))}
        </div>
        <div className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Buscar ritual…" aria-label="Buscar ritual" value={search} onChange={(e) => useUi.setState({ ritualSearch: e.target.value })} />
        </div>
        <label className="switch">
          <input type="checkbox" checked={onlyKnown} onChange={(e) => useUi.setState({ onlyKnown: e.target.checked })} />
          <span className="switch-track" aria-hidden="true" />
          <span>Só conhecidos</span>
        </label>
      </div>

      <div className="ritual-grid">
        {list.length ? list.map((r) => <RitualCard key={r.name} r={r} />) : <div className="hint-box">Nenhum ritual com esses filtros.</div>}
      </div>
      <p className="muted small">
        Conjurar exige gestos, componentes do elemento (exceto Medo) e um teste de Ocultismo (DT 20 + custo) para não perder Sanidade.
        Rituais de Medo sempre custam Sanidade. Elementos: {ELEMENTS.map((e) => elementLabel(e.key)).join(", ")}.
      </p>
    </>
  );
}
