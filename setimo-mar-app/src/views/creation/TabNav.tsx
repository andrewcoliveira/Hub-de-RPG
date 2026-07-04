import { useFicha } from "@/store/ficha";

/** Botões Anterior/Próximo — navega dentro das abas visíveis (via store.nextTab/prevTab). */
export function TabNav() {
  const nextTab = useFicha((s) => s.nextTab);
  const prevTab = useFicha((s) => s.prevTab);

  return (
    <div className="no-print flex items-center justify-between border-t border-line pt-3">
      <button
        type="button"
        onClick={() => prevTab()}
        className="rounded-md border border-line bg-surface px-4 py-2 text-sm text-ink hover:ring-2 hover:ring-accent"
      >
        ← Anterior
      </button>
      <button
        type="button"
        onClick={() => nextTab()}
        className="rounded-md border border-line bg-surface px-4 py-2 text-sm text-ink hover:ring-2 hover:ring-accent"
      >
        Próximo →
      </button>
    </div>
  );
}
