import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "@/shared/components/Toaster";
import {
  BASIC_ABILITIES, CATEGORIES, CATEGORY_META, CLASSES, SKILLS_DATA, abilityMod, bonusTalentSources, canIncrementAbility,
  canUseUntrained, checkPrerequisitos, checkSinglePrereq, decrementAbility, finalValueFor, fmtMod, freeSlotCount,
  grantedTalents, incrementAbility, isClassSkill, isSkillSelected, isTalentSelected, modOf, raceSkillBonus,
  setSkillSpecialty, skillAttr, skillBonus, skillSlotCount, skillWarnings, slotsLeft, talentEntries,
  toggleSkill, toggleTalent, totalAbilityIncrements, usedFreeSlots, type JadeState, type TalentCategory, type TalentEntry,
} from "../engine";
import { useFicha, useJade } from "../store";
import { Check, Meter, goTo, useUi } from "./ui";
import { DevotionChoice } from "./RacaClasseSteps";

// ══════════════════════════════════════════════════════════════════
//  4 · PERÍCIAS
// ══════════════════════════════════════════════════════════════════

const FILTERS = [
  { f: "all", label: "Todas" },
  { f: "class", label: "De classe" },
  { f: "out", label: "Fora da classe" },
  { f: "trained", label: "Treinadas" },
] as const;

export function PericiasStep() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const filter = useUi((u) => u.skillFilter);

  const names = Object.keys(SKILLS_DATA).sort((a, b) => a.localeCompare(b, "pt"));
  const filtered = names.filter((n) => {
    if (filter === "class") return isClassSkill(s, n);
    if (filter === "out") return !isClassSkill(s, n);
    if (filter === "trained") return isSkillSelected(s, n);
    return true;
  });
  const slots = skillSlotCount(s), used = s.selectedSkills.length;

  function toggle(name: string) {
    const r = update((d) => toggleSkill(d, name));
    if (r === "full") toast(`Limite de ${slots} perícias treinadas atingido`);
  }

  return (
    <>
      <div className="panel toolbar">
        <div className="toolbar-meter">
          {s.classKey && (
            <Meter label="Perícias treinadas" used={used} total={slots}
              note={`${CLASSES[s.classKey].pericias_treinadas} (${fmtMod(modOf(s, "int"))})${s.race === "humano" ? " · +2 por ser humano" : ""}`} />
          )}
        </div>
        <div className="chip-row" role="group" aria-label="Filtrar perícias">
          {FILTERS.map(({ f, label }) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => useUi.setState({ skillFilter: f })}>{label}</button>
          ))}
        </div>
      </div>

      <div className="skills-list">
        {!s.classKey ? (
          <div className="hint-box">
            As perícias dependem da classe.
            <button type="button" className="btn btn-sm btn-primary" onClick={() => goTo("classe")}>Escolher classe</button>
          </div>
        ) : !filtered.length ? (
          <div className="hint-box">Nenhuma perícia neste filtro.</div>
        ) : (
          filtered.map((name) => {
            const skill = SKILLS_DATA[name];
            const sel = isSkillSelected(s, name);
            const entry = s.selectedSkills.find((x) => x.name === name);
            const full = used >= slots && !sel;
            const inClass = isClassSkill(s, name);
            const warnings = skillWarnings(s, name).filter((w) => w.type !== "outclass");
            const bonus = canUseUntrained(s, name) || sel ? skillBonus(s, name, sel) : null;
            const race = raceSkillBonus(s, name);
            return (
              <div key={name} className={`skill-row ${sel ? "is-on" : ""} ${full ? "is-full" : ""}`}>
                <button type="button" className="skill-toggle" aria-pressed={sel} onClick={() => toggle(name)}>
                  <span className="check" aria-hidden="true"><Check /></span>
                  <span className="skill-name">{name}</span>
                </button>
                <div className="skill-meta">
                  <span className="tag">{skillAttr(s, name)}</span>
                  {race > 0 && <span className="tag tag-pos" title="Traço racial">+{race} raça</span>}
                  {inClass
                    ? <span className="tag tag-pos">Classe</span>
                    : <span className="tag tag-warn" title="Treinar perícia fora da classe é violação de honra leve">Fora da classe</span>}
                  {skill.trained && !canUseUntrained(s, name) && <span className="tag">Só treinada</span>}
                  {warnings.map((w) => (
                    <span key={w.type} className={`tag ${w.type === "armor" ? "" : "tag-warn"}`} title={w.label}>{w.type === "armor" ? "Armadura" : w.label}</span>
                  ))}
                  {sel && skill.specialties && (
                    <select className="skill-spec" aria-label={`Especialidade de ${name}`} value={entry?.specialty ?? ""}
                      onChange={(e) => update((d) => setSkillSpecialty(d, name, e.target.value))}>
                      {skill.specialties.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
                    </select>
                  )}
                </div>
                <div className={`skill-bonus ${bonus === null ? "" : bonus >= 0 ? "pos" : "neg"}`}>
                  <b className="num">{bonus === null ? "—" : fmtMod(bonus)}</b>
                  <small>{bonus === null ? (canUseUntrained(s, name) ? "defina atributos" : "requer treino") : sel ? "treinada" : "sem treino"}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
//  5 · TALENTOS
// ══════════════════════════════════════════════════════════════════

function PrereqChip({ s, p, self }: { s: JadeState; p: string; self: string }) {
  const ok = checkSinglePrereq(s, p, self);
  if (ok === null) return <span className="prereq unknown" title="Não verificado automaticamente — confira com o mestre">? {p}</span>;
  const granted = grantedTalents(s);
  const via = ok && granted.has(p) && !isTalentSelected(s, p) ? <> <small>({granted.get(p)})</small></> : null;
  return <span className={`prereq ${ok ? "ok" : "fail"}`} title={ok ? "Atendido" : "Não atendido"}>{ok ? "✓" : "✕"} {p}{via}</span>;
}

interface Row extends TalentEntry { met: boolean; sel: boolean; grantedBy: string | null }

function TalentCard({ e, full }: { e: Row; full: boolean }) {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const expanded = useUi((u) => u.expanded.includes(e.name));
  const desc = e.data.desc || "";
  const long = desc.length > 170;

  function toggle() {
    const r = update((d) => toggleTalent(d, e.name, e.cat));
    if (r === "full") toast("Sem escolhas disponíveis neste nível");
    else if (r === "locked") toast("Pré-requisitos não atendidos");
    else if (r === "granted") toast("Esse talento já é concedido pela classe ou raça");
    else if (r === "added") toast(`${e.name} adicionado`);
  }

  let btn;
  if (e.sel) btn = <button type="button" className="btn btn-sm is-remove" onClick={toggle}>Remover</button>;
  else if (e.grantedBy) btn = <button type="button" className="btn btn-sm" disabled>Já possui</button>;
  else if (!e.met) btn = <button type="button" className="btn btn-sm" disabled>Bloqueado</button>;
  else if (full) btn = <button type="button" className="btn btn-sm" disabled>Sem escolhas</button>;
  else btn = <button type="button" className="btn btn-sm btn-primary" onClick={toggle}>Adicionar</button>;

  return (
    <article className={`talent cat-${e.cat} ${e.sel ? "is-on" : ""} ${e.grantedBy ? "is-granted" : ""} ${!e.met && !e.sel && !e.grantedBy ? "is-locked" : ""}`}>
      <header className="talent-head">
        <div className="talent-title">
          <h4>{e.name}</h4>
          {e.deity && <span className="tag tag-gold">{e.deity}</span>}
          {e.grantedBy && <span className="tag tag-pos">Concedido · {e.grantedBy}</span>}
          {e.sel && !e.met && <span className="tag tag-warn">Requisito pendente</span>}
        </div>
        {btn}
      </header>
      <div className="prereqs">
        <span className="prereq-label">Pré-requisitos</span>
        {e.prereqs.length
          ? e.prereqs.map((p) => <PrereqChip key={p} s={s} p={p} self={e.name} />)
          : <span className="prereq none">Nenhum — qualquer personagem pode escolher</span>}
      </div>
      <p className={`talent-desc ${long && !expanded ? "is-clamped" : ""}`}>{desc}</p>
      {long && (
        <button type="button" className="link-btn" onClick={() => useUi.setState((u) => ({
          expanded: expanded ? u.expanded.filter((n) => n !== e.name) : [...u.expanded, e.name],
        }))}>{expanded ? "Mostrar menos" : "Mostrar mais"}</button>
      )}
    </article>
  );
}

function matches(e: TalentEntry, q: string) {
  if (!q) return true;
  const t = q.toLowerCase();
  return e.name.toLowerCase().includes(t) || (e.data.desc || "").toLowerCase().includes(t) || (e.deity || "").toLowerCase().includes(t);
}

function TalentList() {
  const s = useJade();
  const cat = useUi((u) => u.talentCat);
  const onlyAvail = useUi((u) => u.onlyAvail);
  const search = useUi((u) => u.search);
  const granted = grantedTalents(s);
  const full = slotsLeft(s) <= 0;
  const cats = cat === "all" ? CATEGORIES : CATEGORIES.filter((c) => c === cat);

  const groups = cats.map((c) => {
    const entries: Row[] = talentEntries(c)
      .map((e) => ({ ...e, met: checkPrerequisitos(s, e.prereqs, e.name).met, sel: isTalentSelected(s, e.name), grantedBy: granted.get(e.name) ?? null }))
      .filter((e) => matches(e, search) && (!onlyAvail || e.sel || (e.met && !e.grantedBy)))
      .sort((a, b) => (+b.sel - +a.sel) || (+!!b.grantedBy - +!!a.grantedBy) || (+b.met - +a.met) || a.name.localeCompare(b.name, "pt"));
    return { c, entries };
  }).filter((g) => g.entries.length);

  if (!groups.length) return <div className="talents-list" aria-live="polite"><div className="hint-box">Nenhum talento encontrado{search ? ` para “${search}”` : ""}.</div></div>;

  return (
    <div className="talents-list" aria-live="polite">
      {groups.map(({ c, entries }) => (
        <Fragment key={c}>
          {cats.length > 1 && (
            <h3 className={`cat-head cat-${c}`}><span className="cat-dot" aria-hidden="true" />{CATEGORY_META[c].label}<span className="count">{entries.length}</span></h3>
          )}
          <div className="talent-grid">{entries.map((e) => <TalentCard key={e.name} e={e} full={full} />)}</div>
        </Fragment>
      ))}
    </div>
  );
}

function TalentCats() {
  const s = useJade();
  const current = useUi((u) => u.talentCat);
  const granted = grantedTalents(s);
  const chip = (key: string, label: string, entries: TalentEntry[]) => {
    const avail = entries.filter((e) => !granted.has(e.name) && checkPrerequisitos(s, e.prereqs, e.name).met).length;
    const sel = entries.filter((e) => isTalentSelected(s, e.name)).length;
    return (
      <button key={key} type="button" className={`chip cat-chip cat-${key}`} aria-pressed={current === key} onClick={() => useUi.setState({ talentCat: key })}>
        {label} <span className="count">{sel ? `${sel} ✓ · ` : ""}{avail}/{entries.length}</span>
      </button>
    );
  };
  return (
    <div className="chip-row cat-row" role="group" aria-label="Categoria">
      {chip("all", "Todos", CATEGORIES.flatMap(talentEntries))}
      {CATEGORIES.map((c: TalentCategory) => chip(c, CATEGORY_META[c].label, talentEntries(c)))}
    </div>
  );
}

function SearchBox() {
  const [value, setValue] = useState(useUi.getState().search);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  // "Nova ficha" limpa a busca
  useEffect(() => useUi.subscribe((u) => { if (!u.search) setValue(""); }), []);
  return (
    <div className="search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <input type="search" placeholder="Buscar por nome ou descrição…" autoComplete="off" aria-label="Buscar talento" value={value}
        onChange={(e) => {
          setValue(e.target.value);
          clearTimeout(timer.current);
          const v = e.target.value.trim();
          timer.current = setTimeout(() => useUi.setState({ search: v }), 120);
        }} />
    </div>
  );
}

export function TalentosStep() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const onlyAvail = useUi((u) => u.onlyAvail);
  const used = usedFreeSlots(s), free = freeSlotCount(s);
  const incs = totalAbilityIncrements(s);
  const granted = grantedTalents(s);
  const [incOpen, setIncOpen] = useState(incs > 0);

  function inc(key: (typeof BASIC_ABILITIES)[number]["key"], d: number) {
    const ok = update((x) => (d > 0 ? incrementAbility(x, key) : decrementAbility(x, key)));
    if (!ok && d > 0) toast("Sem escolhas disponíveis neste nível");
  }

  return (
    <>
      <div className="panel toolbar">
        <div className="toolbar-meter">
          <Meter label="Escolhas usadas" used={used} total={free}
            note={`${s.selectedTalents.length} talento(s) · ${incs} aumento(s) de atributo · ${s.level} por nível${bonusTalentSources(s).map((b) => ` + ${b.count} ${b.label.toLowerCase()} (${b.note})`).join("")}`} />
        </div>
        {(s.classKey || granted.size > 0) && (
          <div className="init-talents">
            <span className="eyebrow">Talentos que você já possui</span>
            {s.classKey && <p>{CLASSES[s.classKey].talentos_iniciais}</p>}
            {granted.size > 0 && (
              <div className="tag-row granted-row">
                {[...granted].map(([n, src]) => <span key={n} className="tag tag-pos" title={`Concedido por ${src}`}>{n}</span>)}
              </div>
            )}
            <DevotionChoice />
          </div>
        )}
      </div>

      <details className="panel inc-panel" open={incOpen} onToggle={(e) => setIncOpen((e.target as HTMLDetailsElement).open)}>
        <summary>
          <span className="inc-title">Aumentar atributos</span>
          <span className="inc-sub">1 escolha por nível = +1 em uma habilidade básica (não Honra)</span>
        </summary>
        <div className="inc-grid">
          {BASIC_ABILITIES.map((a) => {
            const cur = s.abilityIncrements[a.key] ?? 0;
            const v = finalValueFor(s, a.key);
            return (
              <div key={a.key} className={`inc-row ${cur ? "is-on" : ""}`}>
                <span className="inc-abbr">{a.abbr}</span>
                <span className="inc-val num">{v ?? "—"}{v !== null && <> <small>{fmtMod(abilityMod(v))}</small></>}</span>
                <div className="inc-ctrl">
                  <button type="button" className="btn btn-icon" disabled={!cur} aria-label={`Remover +1 de ${a.label}`} onClick={() => inc(a.key, -1)}>−</button>
                  <b className="num">{cur ? `+${cur}` : "0"}</b>
                  <button type="button" className="btn btn-icon" disabled={!canIncrementAbility(s, a.key)} aria-label={`Adicionar +1 em ${a.label}`} onClick={() => inc(a.key, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <div className="talent-filters">
        <SearchBox />
        <label className="switch">
          <input type="checkbox" checked={onlyAvail} onChange={(e) => useUi.setState({ onlyAvail: e.target.checked })} />
          <span className="switch-track" aria-hidden="true" />
          Só disponíveis
        </label>
      </div>
      <TalentCats />
      <TalentList />
    </>
  );
}
