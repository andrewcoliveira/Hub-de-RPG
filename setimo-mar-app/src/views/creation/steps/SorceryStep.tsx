import { useFicha } from "@/store/ficha";
import { SORCERY, NATIONS } from "@/engine";
import type { SchoolKey, SorceryPower } from "@/engine/types";
import { temFeiticaria, sorceryBudget, powerRank } from "@/engine/derive";
import { Card } from "@/components/Card";
import { Budget } from "@/components/Budget";

function PowerGrid({ powers, rank }: { powers: SorceryPower[]; rank: "maior" | "menor" }) {
  const f = useFicha((s) => s.f);
  const toggleSorceryPower = useFicha((s) => s.toggleSorceryPower);
  const budget = sorceryBudget(f);
  const budgetKey = rank === "maior" ? "maiores" : "menores";
  const chosen = f.sorcery.powers.filter((k) => powerRank(f, k) === rank).length;
  const atCap = chosen >= budget[budgetKey];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {powers.map((p) => {
        const active = f.sorcery.powers.includes(p.key);
        const disabled = !active && atCap;
        return (
          <button
            key={p.key}
            type="button"
            data-testid={`sorcery-power-${p.key}`}
            onClick={() => toggleSorceryPower(p.key)}
            disabled={disabled}
            className="w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Card active={active}>
              <div className="font-semibold text-ink">{p.nome}</div>
              <div className="mt-1 text-xs text-ink-soft">{p.desc}</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

export function SorceryStep() {
  const f = useFicha((s) => s.f);
  const setSchool = useFicha((s) => s.setSchool);

  if (!temFeiticaria(f)) {
    return (
      <div data-testid="sorcery-locked" className="rounded-lg border border-line bg-surface-2 p-4 text-ink-soft">
        Compre a Vantagem Feitiçaria (Passo Vantagens) para desbloquear.
      </div>
    );
  }

  const nationSchoolLabel = f.nation ? NATIONS[f.nation].feiticaria : null;
  const budget = sorceryBudget(f);
  const school = f.sorcery.school;

  return (
    <div className="flex flex-col gap-4">
      <Budget
        label="Feitiçaria"
        left={budget.maiores + budget.menores - f.sorcery.powers.length}
        total={budget.maiores + budget.menores}
      />
      <p className="text-sm text-ink-soft">
        Orçamento: {budget.maiores} Maior(es) + {budget.menores} Menor(es)
      </p>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(SORCERY) as [SchoolKey, (typeof SORCERY)[SchoolKey]][]).map(([key, def]) => {
          const active = school === key;
          const isNationSchool = nationSchoolLabel === def.label;
          return (
            <button
              key={key}
              type="button"
              data-testid={`sorcery-school-${key}`}
              onClick={() => setSchool(key)}
              className={[
                "rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-accent bg-accent text-accent-ink"
                  : isNationSchool
                  ? "border-accent text-ink"
                  : "border-line bg-surface-2 text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {def.label}
            </button>
          );
        })}
      </div>

      {school ? (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-ink">Maiores</h3>
            <PowerGrid powers={SORCERY[school].maiores} rank="maior" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-ink">Menores</h3>
            <PowerGrid powers={SORCERY[school].menores} rank="menor" />
          </div>
        </>
      ) : (
        <div className="text-sm text-ink-soft">Escolha uma escola de Feitiçaria acima.</div>
      )}
    </div>
  );
}
