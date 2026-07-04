import type { ComponentType } from "react";
import { useFicha } from "@/store/ficha";
import { TabBar } from "./TabBar";
import { TabNav } from "./TabNav";
import { ConceptNationStep } from "./steps/ConceptNationStep";
import { TraitsStep } from "./steps/TraitsStep";
import { BackgroundsStep } from "./steps/BackgroundsStep";
import { SkillsStep } from "./steps/SkillsStep";
import { AdvantagesStep } from "./steps/AdvantagesStep";
import { ArcanaStep } from "./steps/ArcanaStep";

// Mapa tabId → componente de Step. Preenchido incrementalmente nas Tasks 8-14;
// abas ainda não implementadas caem no fallback "Em construção".
const STEP_COMPONENTS: Partial<Record<string, ComponentType>> = {
  conceito: ConceptNationStep,
  atributos: TraitsStep,
  formacoes: BackgroundsStep,
  pericias: SkillsStep,
  vantagens: AdvantagesStep,
  arcanos: ArcanaStep,
};

function Placeholder() {
  return <div className="p-4 text-ink-soft">Em construção</div>;
}

export function CreationView() {
  const activeTab = useFicha((s) => s.activeTab);
  const StepComponent = STEP_COMPONENTS[activeTab] ?? Placeholder;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <TabBar />
      <div className="min-h-[16rem]">
        <StepComponent />
      </div>
      <TabNav />
    </div>
  );
}
