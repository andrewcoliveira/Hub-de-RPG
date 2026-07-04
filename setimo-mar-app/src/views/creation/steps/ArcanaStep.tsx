import { useFicha } from "@/store/ficha";
import { ARCANA } from "@/engine";
import { Card } from "@/components/Card";

function ArcanaGrid({
  type,
  selected,
  other,
}: {
  type: "virtude" | "hubris";
  selected: string | null;
  other: string | null;
}) {
  const setArcana = useFicha((s) => s.setArcana);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Object.entries(ARCANA).map(([key, def]) => {
        const active = selected === key;
        const disabled = other === key;
        return (
          <button
            key={key}
            type="button"
            data-testid={`arcana-${type}-${key}`}
            onClick={() => setArcana(type, key)}
            disabled={disabled}
            className="w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Card active={active}>
              <div className="font-semibold text-ink">{def.label}</div>
              <div className="mt-1 text-xs text-ink-soft">
                {type === "virtude" ? def.virtude : def.hubris}
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

export function ArcanaStep() {
  const f = useFicha((s) => s.f);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-ink">Virtude</h3>
        <ArcanaGrid type="virtude" selected={f.arcana.virtude} other={f.arcana.hubris} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-ink">Húbris</h3>
        <ArcanaGrid type="hubris" selected={f.arcana.hubris} other={f.arcana.virtude} />
      </div>
    </div>
  );
}
