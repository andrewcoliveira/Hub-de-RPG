import { useFicha } from "@/store/ficha";
import { tabComplete } from "@/engine/derive";
import { visibleTabs } from "@/lib/tabs";

/** Barra de abas da Criação — única fonte de verdade em src/lib/tabs.ts (TAB_DEFS/visibleTabs). */
export function TabBar() {
  const f = useFicha((s) => s.f);
  const activeTab = useFicha((s) => s.activeTab);
  const goTab = useFicha((s) => s.goTab);

  const tabs = visibleTabs(f);

  return (
    <nav aria-label="Abas de criação" className="no-print flex flex-wrap gap-2 border-b border-line pb-3">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isComplete = tabComplete(f, tab.id);
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => goTab(tab.id)}
            className={[
              "flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm bg-surface text-ink border-line",
              isActive ? "ring-2 ring-accent text-accent" : "hover:text-accent",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            {isComplete && (
              <span aria-label="completo" className="text-accent">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
