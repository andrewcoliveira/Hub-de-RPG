import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { tabComplete } from "@/systems/setimo-mar/engine/derive";
import { visibleTabs } from "@/systems/setimo-mar/lib/tabs";

/** Trilha de progresso da Criação — indicador visual (não é navegação; o
 *  Stepper cumpre esse papel). Um ponto por etapa visível; o preenchimento
 *  reflete a fração de etapas concluídas. Os pontos são decorativos
 *  (aria-hidden); o resumo textual vai no aria-label da seção. */
export function ProgressTrack() {
  const f = useFicha((s) => s.f);
  const activeTab = useFicha((s) => s.activeTab);

  const tabs = visibleTabs(f);
  const doneCount = tabs.filter((t) => tabComplete(f, t.id)).length;
  const denom = Math.max(tabs.length - 1, 1);
  const fillPct = Math.min(100, (doneCount / denom) * 100);

  return (
    <section
      className="sm-progress-wrap no-print"
      aria-label={`Progresso: ${doneCount} de ${tabs.length} etapas concluídas`}
    >
      <div className="sm-progress-track">
        <div className="sm-progress-fill" style={{ width: `${fillPct}%` }} />
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDone = tabComplete(f, tab.id);
          const cls = ["sm-dot", isActive ? "sm-dot-active" : "", isDone ? "sm-dot-done" : ""]
            .filter(Boolean)
            .join(" ");
          return (
            <span key={tab.id} className={cls} aria-hidden="true">
              {isDone ? "✓" : ""}
            </span>
          );
        })}
      </div>
    </section>
  );
}
