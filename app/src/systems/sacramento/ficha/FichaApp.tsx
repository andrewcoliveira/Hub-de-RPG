// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Criador de fichas (interface)
//  Regras em engine/; estado em store.ts; aqui a página e a navegação.
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, type ReactNode } from "react";
import { SacramentoFooter, SacramentoHero, SacramentoTopbar } from "../components/SacramentoShell";
import { ATTRS, CORE_STEPS, STEPS, conditions, fmtMoney, isStepKey, moneyLeft, sheetReady, stepStatus, type StepKey } from "./engine";
import { useFicha, useSacramento } from "./store";
import { Check, goTo, useUi } from "./views/ui";
import { AntecedentesStep, AtributosStep, ConceitoStep } from "./views/BaseSteps";
import { HabilidadesStep, MontariaStep, RedencaoStep } from "./views/StorySteps";
import { EquipamentoStep } from "./views/EquipamentoStep";
import { FichaStep } from "./views/FichaStep";

const STEP_INFO: Record<StepKey, { title: string; lead: string; Body: () => ReactNode }> = {
  conceito: { title: "Conceito & Nível", lead: "Quem é seu personagem? A resposta mais curta possível: a essência de quem ele é e o que ele faz.", Body: ConceitoStep },
  atributos: { title: "Atributos", lead: "Físico, Velocidade, Intelecto e Coragem mudam suas Condições iniciais: Vida, Movimentos, Antecedentes e Ações de Combate.", Body: AtributosStep },
  antecedentes: { title: "Antecedentes", lead: "O que seu personagem sabe fazer bem — e a história pregressa que explica isso.", Body: AntecedentesStep },
  habilidades: { title: "Habilidades", lead: "O que destaca você entre patifes, canalhas, coveiros e bandidos. Escolha duas no primeiro nível.", Body: HabilidadesStep },
  redencao: { title: "Redenção", lead: "Algo no passado aperta seu peito. A Trilha de Redenção é o que faz você querer viver.", Body: RedencaoStep },
  montaria: { title: "Montaria", lead: "Do cavalo mais bonito ao burrico mais coitado: a qualidade da montaria é medida pela amizade.", Body: MontariaStep },
  equipamento: { title: "Equipamento", lead: "Chapéu para o sol, uma ou duas armas por precaução e, claro, café. Você tem $200.", Body: EquipamentoStep },
  ficha: { title: "Ficha final", lead: "Revise seu personagem e parta para o Oeste Selvagem.", Body: FichaStep },
};

function StepBar() {
  const s = useSacramento();
  const step = useFicha((x) => x.step);
  const ref = useRef<HTMLDivElement>(null);
  const done = CORE_STEPS.filter((st) => stepStatus(s, st.key).state === "done").length;

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
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const c = conditions(s);
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
        <div className="ls-id">
          <div className="ls-nex"><span>Nível</span><b className="num">{s.level}</b></div>
          <div className="ls-id-text">
            <b>{s.concept ? s.concept : <span className="muted">Sem conceito</span>}</b>
            <span>{fmtMoney(moneyLeft(s))} na algibeira</span>
          </div>
        </div>
        <div className="ls-abs">
          {ATTRS.map((a) => (
            <div key={a.key} className="ls-ab"><span>{a.label.slice(0, 3)}</span><b className="num">{s.attrs[a.key]}</b></div>
          ))}
        </div>
        <div className="ls-vitals">
          <div className="v-vida"><span>VIDA</span><b className="num">{c.vida}</b></div>
          <div className="v-dor"><span>DOR</span><b className="num">{c.dor}</b></div>
          <div><span>MOV</span><b className="num">{c.movimentos}</b></div>
          <div><span>AÇÕES</span><b className="num">{c.acoes}</b></div>
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
          {ready ? "Ver ficha final" : "Distribua atributos e antecedentes"}
        </button>
      </div>
    </aside>
  );
}

export default function FichaApp() {
  const s = useSacramento();
  const step = useFicha((x) => x.step);
  const sheetOpen = useUi((u) => u.sheetOpen);
  const info = STEP_INFO[step];
  const idx = STEPS.findIndex((st) => st.key === step);
  const prev = STEPS[idx - 1], next = STEPS[idx + 1];
  const done = CORE_STEPS.filter((st) => stepStatus(s, st.key).state === "done").length;
  const firstRender = useRef(true);
  useEffect(() => { firstRender.current = false; }, []);

  useEffect(() => { document.body.classList.toggle("sheet-open", sheetOpen); }, [sheetOpen]);

  useEffect(() => {
    history.replaceState(null, "", `#${useFicha.getState().step}`);
    const onHash = () => {
      const k = decodeURIComponent(location.hash.slice(1));
      if (isStepKey(k) && k !== useFicha.getState().step) goTo(k);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") useUi.setState({ sheetOpen: false }); };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <>
      <SacramentoTopbar />
      <SacramentoHero title={<>Criador de <em>Fichas</em></>}>
        Monte seu personagem para o Oeste Selvagem seguindo o livro básico: conceito, atributos, antecedentes, habilidades,
        Redenção, montaria e os $200 de equipamento. A ficha se atualiza ao vivo e fica salva neste navegador.
      </SacramentoHero>

      <StepBar />

      <div className="wizard">
        <main className="wizard-main">
          <section key={step} className={`step ${firstRender.current ? "" : "is-entering"}`} id={`step-${step}`} aria-labelledby={`t-${step}`}>
            <header className={`step-head ${step === "ficha" ? "no-print" : ""}`}>
              <span className="step-kicker">Passo {idx + 1} de {STEPS.length}</span>
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

      <SacramentoFooter />
    </>
  );
}
