import type { ComponentType } from "react";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { visibleTabs } from "@/systems/setimo-mar/lib/tabs";
import { Stepper } from "./Stepper";
import { ProgressTrack } from "./ProgressTrack";
import { FlavorPanel } from "./FlavorPanel";
import { ConceptNationStep } from "./steps/ConceptNationStep";
import { TraitsStep } from "./steps/TraitsStep";
import { BackgroundsStep } from "./steps/BackgroundsStep";
import { SkillsStep } from "./steps/SkillsStep";
import { AdvantagesStep } from "./steps/AdvantagesStep";
import { ArcanaStep } from "./steps/ArcanaStep";
import { SorceryStep } from "./steps/SorceryStep";
import { DuelingStep } from "./steps/DuelingStep";
import { StoriesStep } from "./steps/StoriesStep";
import { SocietyStep } from "./steps/SocietyStep";
import { FinalTouchesStep } from "./steps/FinalTouchesStep";
import { ReviewStep } from "./steps/ReviewStep";

const STEP_COMPONENTS: Partial<Record<string, ComponentType>> = {
  conceito: ConceptNationStep,
  atributos: TraitsStep,
  formacoes: BackgroundsStep,
  pericias: SkillsStep,
  vantagens: AdvantagesStep,
  arcanos: ArcanaStep,
  feiticaria: SorceryStep,
  duelo: DuelingStep,
  historias: StoriesStep,
  sociedade: SocietyStep,
  toques: FinalTouchesStep,
  revisao: ReviewStep,
};

function Placeholder() {
  return <div className="p-4 text-ink-soft">Em construção</div>;
}

export function CreationView() {
  const f = useFicha((s) => s.f);
  const activeTab = useFicha((s) => s.activeTab);
  const nextTab = useFicha((s) => s.nextTab);
  const prevTab = useFicha((s) => s.prevTab);
  const setMode = useFicha((s) => s.setMode);

  const tabs = visibleTabs(f);
  const idx = Math.max(0, tabs.findIndex((t) => t.id === activeTab));
  const def = tabs[idx];
  const isFirst = idx <= 0;
  const isLast = idx >= tabs.length - 1;
  const StepComponent = STEP_COMPONENTS[activeTab] ?? Placeholder;

  return (
    <>
      <div className="sm-layout">
        <Stepper />

        <section className="sm-frame sm-sheet">
          <span className="sm-eyebrow">
            Etapa {idx + 1} de {tabs.length}
          </span>
          <h2 className="sm-sheet-title">{def.title}</h2>
          <p className="sm-subtitle">{def.subtitle}</p>

          <div className="sm-stage" key={activeTab}>
            <StepComponent />
          </div>

          <div className="sm-actions no-print">
            <button
              type="button"
              onClick={() => prevTab()}
              className="sm-btn"
              style={{ visibility: isFirst ? "hidden" : "visible" }}
            >
              ← Voltar
            </button>
            {isLast ? (
              <button type="button" onClick={() => setMode("jogo")} className="sm-btn sm-btn-primary">
                Jogar ⚓
              </button>
            ) : (
              <button type="button" onClick={() => nextTab()} className="sm-btn sm-btn-primary">
                Continuar ⚓
              </button>
            )}
          </div>
        </section>

        <FlavorPanel />
      </div>

      <ProgressTrack />
    </>
  );
}
