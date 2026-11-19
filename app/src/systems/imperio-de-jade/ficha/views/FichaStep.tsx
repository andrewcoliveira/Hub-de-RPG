import { useRef } from "react";
import { copyText, downloadJson, slugify } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import { imageUrl } from "../../assets";
import {
  ABILITIES, CATEGORY_META, CLASSES, RACES, SKILLS_DATA, abilityMod, allAbilitiesSet, baseValueFor, blankState,
  canUseUntrained, classAbilities, classHonorFor, currentBBA, currentDefenses, currentPM, currentPV, finalValueFor,
  fmtMod, grantedTalents, honorTier, isSkillSelected, raceBonusFor, raceChoicesComplete, sanitizeState, sheetReady,
  sheetText, skillAttr, skillBonus, talentIndex, type StepKey,
} from "../engine";
import { useFicha, useJade } from "../store";
import { Feature, goTo, useUi } from "./ui";

function Missing() {
  const s = useJade();
  const missing: [StepKey, string][] = [];
  if (!allAbilitiesSet(s)) missing.push(["atributos", "Defina todos os atributos"]);
  if (!s.race) missing.push(["raca", "Escolha uma raça"]);
  else if (!raceChoicesComplete(s)) missing.push(["raca", "Escolha os bônus raciais"]);
  if (!s.classKey) missing.push(["classe", "Escolha uma classe"]);
  return (
    <div className="panel missing">
      <h3>Quase lá</h3>
      <p className="muted">Para montar a ficha ainda falta:</p>
      <ul>{missing.map(([k, t]) => <li key={t}><button type="button" className="btn btn-sm" onClick={() => goTo(k)}>{t} →</button></li>)}</ul>
    </div>
  );
}

function Sheet() {
  const s = useJade();
  const race = RACES[s.race!], cls = CLASSES[s.classKey!];
  const pv = currentPV(s)!, pm = currentPM(s), bba = currentBBA(s);
  const def = currentDefenses(s);
  const granted = grantedTalents(s);
  const totalMod = ABILITIES.reduce((t, a) => t + abilityMod(finalValueFor(s, a.key)!), 0);

  const byCat: Record<string, string[]> = {};
  s.selectedTalents.forEach((t) => { (byCat[t.category] ||= []).push(t.name); });

  return (
    <article className="sheet">
      <header className="sheet-head">
        <div className="sheet-portraits">
          <img src={imageUrl(race.img)} alt={race.label} className="no-drag" />
          <img src={imageUrl(cls.img)} alt={cls.label} className="no-drag" />
        </div>
        <div className="sheet-title">
          <span className="eyebrow">Império de Jade · Ficha de personagem</span>
          <h3>{s.name || <span className="muted">Personagem sem nome</span>}</h3>
          <p>{race.label} · {cls.label} · {s.level}º nível</p>
        </div>
      </header>

      <div className="sheet-vitals">
        <div><span>PV</span><b className="num">{pv.value}</b></div>
        <div><span>PM</span><b className="num">{pm}</b></div>
        <div><span>BBA</span><b className="num">+{bba}</b></div>
        <div><span>Honra</span><b className="num">{finalValueFor(s, "hon")}</b></div>
        <div><span>CA</span><b className="num">{def.ca}</b></div>
        <div><span>Fortitude</span><b className="num">{fmtMod(def.fort)}</b></div>
        <div><span>Reflexos</span><b className="num">{fmtMod(def.ref)}</b></div>
        <div><span>Vontade</span><b className="num">{fmtMod(def.von)}</b></div>
        <div><span>Método</span><b>{s.mode === "roll" ? "Dados" : "Pontos"}</b></div>
      </div>
      <p className="muted small">CA = 10 + ½ nível + Des; resistências = ½ nível + mod. (com traços raciais e talentos). Some armadura, escudo e habilidades de classe.</p>

      <section className="sheet-sec">
        <h4>Atributos</h4>
        <div className="table-wrap">
          <table className="sheet-table">
            <thead><tr><th>Atributo</th><th>Base</th><th>Raça</th><th>Nível/classe</th><th>Final</th><th>Mod</th></tr></thead>
            <tbody>
              {ABILITIES.map((a) => {
                const fin = finalValueFor(s, a.key)!, mod = abilityMod(fin);
                const rb = raceBonusFor(s, a.key);
                const inc = a.key === "hon" ? 0 : s.abilityIncrements[a.key] ?? 0;
                const ch = classHonorFor(s, a.key);
                return (
                  <tr key={a.key}>
                    <th scope="row">{a.label}{a.key === "hon" && <> <small className="muted">({honorTier(fin)})</small></>}</th>
                    <td className="num">{baseValueFor(s, a.key)}</td>
                    <td className="num">{rb ? fmtMod(rb) : "—"}</td>
                    <td className="num">{ch ? fmtMod(ch) : inc ? `+${inc}` : "—"}</td>
                    <td className="num strong">{fin}</td>
                    <td className="num"><span className={`mod-pill ${mod >= 0 ? "pos" : "neg"}`}>{fmtMod(mod)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small">Soma dos modificadores: <b>{fmtMod(totalMod)}</b></p>
      </section>

      <div className="sheet-cols">
        <section className="sheet-sec">
          <h4>Perícias</h4>
          <table className="sheet-table compact skills-table">
            <thead><tr><th>Perícia</th><th>Atr.</th><th>Total</th></tr></thead>
            <tbody>
              {Object.keys(SKILLS_DATA).sort((a, b) => a.localeCompare(b, "pt")).map((name) => {
                const sel = isSkillSelected(s, name);
                const entry = s.selectedSkills.find((x) => x.name === name);
                const unusable = !canUseUntrained(s, name) && !sel;
                return (
                  <tr key={name} className={`${sel ? "is-trained" : ""} ${unusable ? "is-unusable" : ""}`}>
                    <td><span className="dot" aria-hidden="true" />{name}{entry?.specialty && <> <small>({entry.specialty})</small></>}</td>
                    <td>{skillAttr(s, name)}</td>
                    <td className="num strong">{unusable ? "—" : fmtMod(skillBonus(s, name, sel)!)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted small"><span className="dot dot-on" aria-hidden="true" /> treinada (3 + nível + mod) · demais: ½ nível + mod · inclui traços raciais</p>
        </section>
        <section className="sheet-sec">
          <h4>Talentos</h4>
          <p className="small"><b>Iniciais da classe:</b> {cls.talentos_iniciais}</p>
          {granted.size > 0 && (
            <p className="small"><b>Concedidos:</b> {[...granted].map(([n, src], i) => (
              <span key={n}>{i > 0 && ", "}{n} <span className="muted">({src})</span></span>
            ))}</p>
          )}
          {s.selectedTalents.length ? Object.entries(byCat).map(([cat, names]) => (
            <div key={cat} className="sh-talent-group">
              <span className="eyebrow">{CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label ?? cat}</span>
              <ul>{names.map((n) => (
                <li key={n}><b>{n}</b>{talentIndex.get(n)?.data.desc && <span>{talentIndex.get(n)!.data.desc}</span>}</li>
              ))}</ul>
            </div>
          )) : <p className="muted">Nenhum talento escolhido.</p>}
        </section>
      </div>

      <section className="sheet-sec">
        <h4>Habilidades de classe</h4>
        <ul className="sheet-features">
          {classAbilities(s).gained.map((a) => <li key={a.name}><b>{a.name}</b> <small>({a.level}º)</small> {a.desc}</li>)}
          {!classAbilities(s).gained.length && <li className="muted">Nenhuma.</li>}
        </ul>
      </section>

      <section className="sheet-sec">
        <h4>Habilidades raciais</h4>
        <ul className="sheet-features">{race.abilities.map((t, i) => <li key={i}><Feature text={t} /></li>)}</ul>
      </section>
    </article>
  );
}

export function FichaStep() {
  const s = useJade();
  const replace = useFicha((x) => x.replace);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = sheetReady(s);

  function exportSheet() {
    downloadJson(`${slugify(s.name, "personagem")}.json`, { app: "imperio-de-jade-ficha", version: 1, state: s });
    toast("Ficha exportada");
  }

  async function importSheet(file: File) {
    try {
      const json = JSON.parse(await file.text());
      const raw = json?.state ?? json;
      if (!raw || typeof raw !== "object" || !("mode" in raw)) throw new Error("formato");
      if (!confirm("Substituir a ficha atual pela importada?")) return;
      replace(sanitizeState(raw));
      useUi.setState({ pickedRoll: null });
      toast("Ficha importada");
    } catch {
      toast("Arquivo inválido: não parece uma ficha exportada daqui");
    }
  }

  function newSheet() {
    if (!confirm("Começar uma nova ficha? A ficha atual será apagada deste navegador.")) return;
    replace(blankState());
    useUi.setState({ pickedRoll: null, expanded: [], search: "" });
    goTo("atributos");
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
