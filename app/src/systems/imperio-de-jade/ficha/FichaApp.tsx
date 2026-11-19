// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Criador de fichas (interface)
//  Regras em engine/; estado em store.ts; aqui a página e a navegação.
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { imageUrl } from "../assets";
import { JadeFooter, JadeHero, JadeTopbar } from "../components/JadeShell";
import {
  ABILITIES, CLASSES, CORE_STEPS, RACES, STEPS, abilityMod, currentBBA, currentPM, currentPV, finalValueFor, fmtMod,
  isStepKey, sheetReady, stepStatus, type StepKey,
} from "./engine";
import { useFicha, useJade } from "./store";
import { Check, goTo, useChangedAbilities, useUi } from "./views/ui";
import { AtributosStep } from "./views/AtributosStep";
import { ClasseStep, RacaStep } from "./views/RacaClasseSteps";
import { PericiasStep, TalentosStep } from "./views/PericiasTalentosSteps";
import { FichaStep } from "./views/FichaStep";

const STEP_INFO: Record<StepKey, { n: number; title: string; lead: string; Body: () => ReactNode }> = {
  atributos: { n: 1, title: "Atributos", lead: "Defina os sete atributos básicos rolando dados ou distribuindo pontos.", Body: AtributosStep },
  raca: { n: 2, title: "Raça", lead: "Cada raça modifica atributos e concede habilidades próprias.", Body: RacaStep },
  classe: { n: 3, title: "Classe & Nível", lead: "Escolha o caminho do seu personagem e em que nível ele começa.", Body: ClasseStep },
  pericias: { n: 4, title: "Perícias", lead: "Marque as perícias treinadas. O bônus de cada uma é calculado com seu nível e atributos.", Body: PericiasStep },
  talentos: { n: 5, title: "Talentos", lead: "Você ganha 1 escolha por nível (talento ou +1 em uma habilidade básica), mais os talentos extras da raça e da classe.", Body: TalentosStep },
  ficha: { n: 6, title: "Ficha final", lead: "Revise, imprima ou exporte o seu personagem.", Body: FichaStep },
};

function Stepper() {
  const s = useJade();
  const step = useFicha((x) => x.step);
  const ref = useRef<HTMLDivElement>(null);
  const done = CORE_STEPS.filter((st) => stepStatus(s, st.key).state === "done").length;

  // mantém a etapa atual visível quando a barra rola (celular)
  useEffect(() => {
    const box = ref.current, cur = box?.querySelector<HTMLElement>(".is-current");
    if (box && cur && box.scrollWidth > box.clientWidth) {
      box.scrollTo({ left: cur.offsetLeft - box.clientWidth / 2 + cur.clientWidth / 2, behavior: "smooth" });
    }
  }, [step]);

  return (
    <nav className="stepper-bar" aria-label="Etapas da ficha">
      <div className="stepper" ref={ref} style={{ ["--p" as string]: `${(done / CORE_STEPS.length) * 100}%` }}>
        <span className="stepper-track" aria-hidden="true"><span /></span>
        {STEPS.map((st, i) => {
          const status = stepStatus(s, st.key);
          const cur = step === st.key;
          return (
            <button key={st.key} type="button" className={`stp is-${status.state} ${cur ? "is-current" : ""}`} aria-current={cur ? "step" : undefined} onClick={() => goTo(st.key)}>
              <span className="stp-dot">{status.state === "done" ? <Check /> : status.state === "warn" ? "!" : i + 1}</span>
              <span className="stp-text"><span className="stp-label">{st.label}</span><span className="stp-status">{status.text}</span></span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function LiveSheet() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const changed = useChangedAbilities(s);
  const race = s.race ? RACES[s.race] : null, cls = s.classKey ? CLASSES[s.classKey] : null;
  const pv = currentPV(s), pm = currentPM(s), bba = currentBBA(s);
  const avatar = cls?.img ?? race?.img;
  const ready = sheetReady(s);

  return (
    <aside className="live-sheet no-print" aria-label="Ficha ao vivo">
      <div className="ls-card">
        <div className="ls-top">
          <span className="eyebrow">Ficha ao vivo</span>
          <button type="button" className="btn btn-icon btn-ghost ls-close" aria-label="Fechar ficha" onClick={() => useUi.setState({ sheetOpen: false })}>
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <input type="text" className="ls-name" placeholder="Nome do personagem" maxLength={60} autoComplete="off" aria-label="Nome do personagem"
          value={s.name} onChange={(e) => { const v = e.target.value; update((d) => { d.name = v; }); }} />
        <div>
          <div className="ls-id">
            <div className="ls-avatar">{avatar ? <img src={imageUrl(avatar)} alt="" className="no-drag" /> : <span>?</span>}</div>
            <div className="ls-id-text">
              <b>{race ? race.label : <span className="muted">Raça</span>} · {cls ? cls.label : <span className="muted">Classe</span>}</b>
              <span>{s.level}º nível</span>
            </div>
          </div>
          <div className="ls-abs">
            {ABILITIES.map((a) => {
              const v = finalValueFor(s, a.key);
              const m = v !== null ? abilityMod(v) : null;
              return (
                <div key={a.key} className={`ls-ab ${changed.has(a.key) ? "changed" : ""}`}>
                  <span>{a.abbr}</span>
                  <b className="num">{v ?? "—"}</b>
                  <i className={m === null ? "" : m >= 0 ? "pos" : "neg"}>{m === null ? " " : fmtMod(m)}</i>
                </div>
              );
            })}
          </div>
          <div className="ls-vitals">
            <div><span>PV</span><b className="num">{pv ? `${pv.value}${pv.partial ? "*" : ""}` : "—"}</b></div>
            <div><span>PM</span><b className="num">{pm ?? "—"}</b></div>
            <div><span>BBA</span><b className="num">{bba !== null ? `+${bba}` : "—"}</b></div>
          </div>
          {pv?.partial && <p className="ls-note">* sem o modificador de Constituição</p>}
          <ul className="ls-check">
            {CORE_STEPS.map((st) => {
              const status = stepStatus(s, st.key);
              return (
                <li key={st.key} className={`is-${status.state}`}>
                  <button type="button" onClick={() => goTo(st.key)}>
                    <span className="ls-dot" aria-hidden="true">{status.state === "done" && <Check />}</span>
                    <span className="ls-step">{st.label}</span>
                    <em>{status.text}</em>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn btn-primary ls-cta" disabled={!ready} onClick={() => goTo("ficha")}>
            {ready ? "Ver ficha final" : "Complete atributos, raça e classe"}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function FichaApp() {
  const s = useJade();
  const step = useFicha((x) => x.step);
  const sheetOpen = useUi((u) => u.sheetOpen);
  const info = STEP_INFO[step];
  const idx = STEPS.findIndex((st) => st.key === step);
  const prev = STEPS[idx - 1], next = STEPS[idx + 1];
  const done = CORE_STEPS.filter((st) => stepStatus(s, st.key).state === "done").length;
  const firstRender = useRef(true);
  useEffect(() => { firstRender.current = false; }, []);

  // A ficha lateral (celular) abre por cima da página
  useEffect(() => { document.body.classList.toggle("sheet-open", sheetOpen); }, [sheetOpen]);

  // #etapa na URL e Esc
  useEffect(() => {
    history.replaceState(null, "", `#${useFicha.getState().step}`);
    const onHash = () => {
      const k = decodeURIComponent(location.hash.slice(1));
      if (isStepKey(k) && k !== useFicha.getState().step) goTo(k);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (useUi.getState().sheetOpen) useUi.setState({ sheetOpen: false });
      else if (useUi.getState().pickedRoll !== null) useUi.setState({ pickedRoll: null });
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <>
      <JadeTopbar current="ficha" />
      <JadeHero title="Criador de Fichas">
        Monte seu personagem em seis etapas. A ficha se atualiza ao vivo a cada escolha e fica salva neste navegador.
      </JadeHero>

      <Stepper />

      <div className="wizard">
        <main className="wizard-main">
          <section key={step} className={`step ${firstRender.current ? "" : "is-entering"}`} id={`step-${step}`} aria-labelledby={`t-${step}`}>
            <header className={`step-head ${step === "ficha" ? "no-print" : ""}`}>
              <span className="step-kicker">Etapa {info.n}</span>
              <h2 id={`t-${step}`} tabIndex={-1}>{info.title}</h2>
              <p>{info.lead}</p>
            </header>
            <info.Body />
          </section>

          <div className="step-nav no-print">
            <button type="button" className="btn" style={{ visibility: prev ? "visible" : "hidden" }} onClick={() => prev && goTo(prev.key)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              <span>{prev?.label}</span>
            </button>
            <button type="button" className="btn btn-primary" style={{ visibility: next ? "visible" : "hidden" }} onClick={() => next && goTo(next.key)}>
              <span>{next?.label}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </main>

        <LiveSheet />
        <div className="ls-backdrop no-print" onClick={() => useUi.setState({ sheetOpen: false })} />
      </div>

      <button type="button" className="sheet-fab no-print" onClick={() => useUi.setState({ sheetOpen: true })}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></svg>
        <span>Ficha</span>
        <b className="num">{done}/{CORE_STEPS.length}</b>
      </button>

      <JadeFooter />
    </>
  );
}
