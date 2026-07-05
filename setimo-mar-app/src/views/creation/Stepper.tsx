import { useFicha } from "@/store/ficha";
import { tabComplete } from "@/engine/derive";
import { visibleTabs } from "@/lib/tabs";

/** Stepper vertical da Criação — lista as etapas visíveis (fonte única em
 *  src/lib/tabs.ts). Navegação livre: clicar em qualquer etapa vai até ela.
 *  Cada item é um <button> com o título da etapa (usado por testes/a11y). */
export function Stepper() {
  const f = useFicha((s) => s.f);
  const activeTab = useFicha((s) => s.activeTab);
  const goTab = useFicha((s) => s.goTab);

  const tabs = visibleTabs(f);

  return (
    <nav aria-label="Etapas de criação" className="sm-frame sm-stepper no-print">
      {tabs.map((tab, i) => {
        const isActive = tab.id === activeTab;
        const isDone = tabComplete(f, tab.id);
        const cls = ["sm-step", isActive ? "sm-step-active" : "", isDone ? "sm-step-done" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "step" : undefined}
            onClick={() => goTab(tab.id)}
            className={cls}
          >
            <span className="sm-step-number" aria-hidden="true">
              {isDone ? "✓" : i + 1}
            </span>
            <span>
              <span className="sm-step-title">{tab.title}</span>
              <span className="sm-step-sub">{tab.subtitle}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
