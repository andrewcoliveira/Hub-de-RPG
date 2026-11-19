import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { BACKGROUNDS, SKILLS, ADVANTAGES, CREATION } from "@/systems/setimo-mar/engine";
import { Card } from "@/systems/setimo-mar/components/Card";

function skillLabel(key: string): string {
  return SKILLS.find((s) => s.key === key)?.label ?? key;
}

export function BackgroundsStep() {
  const f = useFicha((s) => s.f);
  const toggleBackground = useFicha((s) => s.toggleBackground);
  const count = f.backgrounds.length;
  const atMax = count >= CREATION.backgroundsToPick;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-ink-soft">
        Formações escolhidas: <span className="font-semibold text-ink">{count} / {CREATION.backgroundsToPick}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries(BACKGROUNDS).map(([key, def]) => {
          const active = f.backgrounds.includes(key);
          const disabled = !active && atMax;
          const freeAdvantage = ADVANTAGES[def.freeAdvantage];
          return (
            <div key={key} data-testid={`bg-${key}`}>
              <button
                type="button"
                onClick={() => toggleBackground(key)}
                disabled={disabled}
                className="w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Card active={active} title={def.quirk}>
                  <div className="font-semibold text-ink">{def.label}</div>
                  <div className="mt-1 text-xs text-ink-soft">{def.quirk}</div>
                  <div className="mt-2 text-xs text-ink">
                    <span className="text-ink-soft">Perícias: </span>
                    {def.skills.map(skillLabel).join(", ")}
                  </div>
                  <div className="text-xs text-ink">
                    <span className="text-ink-soft">Vantagem: </span>
                    {freeAdvantage ? freeAdvantage.label : def.freeAdvantage}
                  </div>
                </Card>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
