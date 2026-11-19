// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Criador de fichas (interface)
//  Regras em engine/; estado em store.ts; aqui a página e a navegação.
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { OrdemFooter, OrdemHero, OrdemTopbar } from "../components/OrdemShell";
import {
  ATTRS, CLASSES, CORE_STEPS, STEPS, attrFinal, currentDefense, currentPE, currentPV, currentSAN, currentTrail,
  isStepKey, nexOf, originIndex, sheetReady, stepStatus, type StepKey,
} from "./engine";
import { useFicha, useOrdem } from "./store";
import { Check, goTo, useChangedAttrs, useUi } from "./views/ui";
import { AtributosStep, ConceitoStep } from "./views/ConceitoAtributos";
import { OrigemStep } from "./views/OrigemStep";
import { ClasseStep } from "./views/ClasseStep";
import { PericiasStep } from "./views/PericiasStep";
import { PoderesStep } from "./views/PoderesStep";
import { RituaisStep } from "./views/RituaisStep";
import { FichaStep } from "./views/FichaStep";

const STEP_INFO: Record<StepKey, { n: number; title: string; lead: string; Body: () => ReactNode }> = {
  conceito: { n: 1, title: "Conceito", lead: "Quem é seu agente? Pense no que fazia antes de encontrar o paranormal e resuma isso em uma frase.", Body: ConceitoStep },
  atributos: { n: 2, title: "Atributos", lead: "Agilidade, Força, Intelecto, Presença e Vigor definem suas capacidades — ou incapacidades.", Body: AtributosStep },
  origem: { n: 3, title: "Origem", lead: "O que seu agente fazia antes de ingressar na Ordem: duas perícias treinadas e um poder.", Body: OrigemStep },
  classe: { n: 4, title: "Classe & NEX", lead: "O treinamento recebido na Ordem, o nível de exposição paranormal e, a partir de NEX 10%, a trilha.", Body: ClasseStep },
  pericias: { n: 5, title: "Perícias", lead: "As habilidades mundanas do agente, definidas pela origem, pela classe e pelo Intelecto.", Body: PericiasStep },
  poderes: { n: 6, title: "Poderes", lead: "Poderes de classe, aumentos de atributo, Versatilidade e poderes paranormais conforme o NEX.", Body: PoderesStep },
  rituais: { n: 7, title: "Rituais", lead: "Manifestações controladas do Outro Lado. Todo poder tem um preço.", Body: RituaisStep },
  ficha: { n: 8, title: "Ficha final", lead: "Revise seu agente: confira perícias, poderes, PV, PE e Sanidade. Depois imprima ou exporte.", Body: FichaStep },
};

function Stepper() {
  const s = useOrdem();
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
  const s = useOrdem();
  const update = useFicha((x) => x.update);
  const changed = useChangedAttrs(s);
  const cls = s.classKey ? CLASSES[s.classKey] : null;
  const origin = s.origin ? originIndex.get(s.origin) : null;
  const trail = currentTrail(s);
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
        <input type="text" className="ls-name" placeholder="Nome do agente" maxLength={60} autoComplete="off" aria-label="Nome do agente"
          value={s.name} onChange={(e) => { const v = e.target.value; update((d) => { d.name = v; }); }} />
        <div className="ls-id">
          <div className="ls-nex"><span>NEX</span><b className="num">{nexOf(s)}%</b></div>
          <div className="ls-id-text">
            <b>{origin ? origin.label : <span className="muted">Origem</span>} · {cls ? cls.label : <span className="muted">Classe</span>}</b>
            <span>{trail ? trail.label : s.classKey && nexOf(s) >= 10 ? "Trilha pendente" : "Sem trilha"}</span>
          </div>
        </div>
        <div className="ls-abs">
          {ATTRS.map((a) => (
            <div key={a.key} className={`ls-ab ${changed.has(a.key) ? "changed" : ""}`}>
              <span>{a.abbr}</span>
              <b className="num">{attrFinal(s, a.key)}</b>
            </div>
          ))}
        </div>
        <div className="ls-vitals">
          <div className="v-pv"><span>PV</span><b className="num">{currentPV(s) ?? "—"}</b></div>
          <div className="v-pe"><span>PE</span><b className="num">{currentPE(s) ?? "—"}</b></div>
          <div className="v-san"><span>SAN</span><b className="num">{currentSAN(s) ?? "—"}</b></div>
          <div><span>DEF</span><b className="num">{currentDefense(s)}</b></div>
        </div>
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
          {ready ? "Ver ficha final" : "Complete atributos, origem e classe"}
        </button>
      </div>
    </aside>
  );
}

export default function FichaApp() {
  const s = useOrdem();
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
      else if (useUi.getState().openPicker) useUi.setState({ openPicker: null });
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <>
      <OrdemTopbar />
      <OrdemHero title={<>Criador de <em>Fichas</em></>}>
        Monte seu agente da Ordo Realitas seguindo o passo a passo do livro de regras — do conceito aos rituais, em qualquer NEX.
        A ficha se atualiza ao vivo e fica salva neste navegador.
      </OrdemHero>

      <Stepper />

      <div className="wizard">
        <main className="wizard-main">
          <section key={step} className={`step ${firstRender.current ? "" : "is-entering"}`} id={`step-${step}`} aria-labelledby={`t-${step}`}>
            <header className={`step-head ${step === "ficha" ? "no-print" : ""}`}>
              <span className="step-kicker">Passo {info.n} de {STEPS.length}</span>
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

      <OrdemFooter />
    </>
  );
}
