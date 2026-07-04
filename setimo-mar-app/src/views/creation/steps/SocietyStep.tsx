import { useFicha } from "@/store/ficha";
import { SOCIETIES } from "@/engine";
import { Card } from "@/components/Card";

export function SocietyStep() {
  const f = useFicha((s) => s.f);
  const setSociety = useFicha((s) => s.setSociety);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Object.entries(SOCIETIES).map(([key, def]) => {
        const active = f.society.key === key;
        const disabled = !!def.heroisNao;
        return (
          <button
            key={key}
            type="button"
            data-testid={`society-${key}`}
            onClick={() => setSociety(key)}
            disabled={disabled}
            className="w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Card active={active}>
              <div className="font-semibold text-ink">{def.label}</div>
              <div className="mt-1 text-xs text-ink-soft">{def.quer}</div>
              <div className="mt-2 text-xs text-ink">
                <span className="text-ink-soft">Ganha Favor: </span>
                {def.favorGanha}
              </div>
              <div className="text-xs text-ink">
                <span className="text-ink-soft">Gasta Favor: </span>
                {def.favorGasta}
              </div>
              {disabled ? (
                <div className="mt-2 text-xs font-semibold text-ink-soft">
                  Começa com Favor 2
                </div>
              ) : null}
            </Card>
          </button>
        );
      })}
    </div>
  );
}
