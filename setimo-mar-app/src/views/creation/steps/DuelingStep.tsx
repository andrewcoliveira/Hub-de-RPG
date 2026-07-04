import { useFicha } from "@/store/ficha";
import { DUELING_STYLES, MANEUVERS } from "@/engine";
import { temAcademiaDuelista } from "@/engine/derive";
import { Card } from "@/components/Card";

export function DuelingStep() {
  const f = useFicha((s) => s.f);
  const setStyle = useFicha((s) => s.setStyle);

  if (!temAcademiaDuelista(f)) {
    return (
      <div data-testid="dueling-locked" className="rounded-lg border border-line bg-surface-2 p-4 text-ink-soft">
        Compre a Vantagem Academia Duelista (Passo Vantagens) para desbloquear.
      </div>
    );
  }

  const activeStyle = f.dueling.style;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-ink">Estilo de Duelo</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(DUELING_STYLES).map(([key, def]) => {
            const active = activeStyle === key;
            return (
              <button
                key={key}
                type="button"
                data-testid={`dueling-style-${key}`}
                onClick={() => setStyle(key)}
                className="w-full text-left"
              >
                <Card active={active}>
                  <div className="font-semibold text-ink">{def.label}</div>
                  <div className="text-xs text-ink-soft">{def.nacao}</div>
                  <div className="mt-1 text-xs text-ink-soft">{def.bonus}</div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-ink">Manobras (referência)</h3>
        <div className="grid grid-cols-1 gap-2">
          {MANEUVERS.map((m) => (
            <div key={m.nome} className="rounded-lg border border-line bg-surface-2 p-3">
              <div className="font-semibold text-ink">{m.nome}</div>
              <div className="text-xs text-ink-soft">{m.efeito}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
