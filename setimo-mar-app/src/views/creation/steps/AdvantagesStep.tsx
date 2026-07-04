import { useFicha } from "@/store/ficha";
import { ADVANTAGES, CREATION } from "@/engine";
import { freeAdvantages, advantagePointsLeft } from "@/engine/derive";
import { Card } from "@/components/Card";
import { TagChip } from "@/components/TagChip";
import { Budget } from "@/components/Budget";

export function AdvantagesStep() {
  const f = useFicha((s) => s.f);
  const toggleAdvantage = useFicha((s) => s.toggleAdvantage);
  const free = freeAdvantages(f);
  const pointsLeft = advantagePointsLeft(f);

  return (
    <div className="flex flex-col gap-4">
      <Budget label="Pontos de Vantagem" left={pointsLeft} total={CREATION.advantagePoints} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries(ADVANTAGES).map(([key, def]) => {
          const isFree = free.has(key);
          const active = f.advantages.includes(key) || isFree;
          const cost = isFree ? 0 : def.cost;
          const cantAfford = !active && cost > pointsLeft;
          const disabled = isFree || cantAfford;

          return (
            <button
              key={key}
              type="button"
              data-testid={`adv-${key}`}
              data-active={active ? "true" : "false"}
              onClick={() => toggleAdvantage(key)}
              disabled={disabled}
              className="w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Card active={active} title={def.desc}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-ink">{def.label}</div>
                  <TagChip tone={active ? "accent" : "muted"}>
                    {isFree ? "grátis" : `${def.cost} pts`}
                  </TagChip>
                </div>
                <div className="mt-1 text-xs text-ink-soft">{def.desc}</div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
