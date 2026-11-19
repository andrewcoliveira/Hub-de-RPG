import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { TRAITS, CREATION, NATIONS } from "@/systems/setimo-mar/engine";
import { traitFreeLeft, traitFinal } from "@/systems/setimo-mar/engine/derive";
import { Stepper } from "@/systems/setimo-mar/components/Stepper";
import { Budget } from "@/systems/setimo-mar/components/Budget";
import { InfoTip } from "@/systems/setimo-mar/components/InfoTip";

export function TraitsStep() {
  const f = useFicha((s) => s.f);
  const adjustTrait = useFicha((s) => s.adjustTrait);
  const freeLeft = traitFreeLeft(f);

  return (
    <div className="flex flex-col gap-4">
      <Budget label="Pontos de Atributo" left={freeLeft} total={CREATION.traitFree} />
      <div className="flex flex-col gap-2">
        {TRAITS.map((trait) => {
          const value = f.traits[trait.key];
          const decDisabled = value <= CREATION.traitBase;
          const incDisabled = value >= CREATION.traitCreationMax || freeLeft <= 0;
          const isNation = f.nationTrait === trait.key;
          const final = traitFinal(f, trait.key);
          const nationLabel = f.nation ? NATIONS[f.nation].label : null;
          return (
            <div
              key={trait.key}
              data-testid={`trait-${trait.key}`}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-3"
            >
              <div>
                <div className="font-semibold text-ink">
                  <InfoTip
                    tip={
                      <>
                        <span className="sm-tip-title">{trait.label}</span>
                        <div>{trait.desc}</div>
                        <div className="sm-tip-calc">
                          Base <strong>{value}</strong>
                          {isNation && nationLabel ? (
                            <> {" + "}{CREATION.traitNation} de Nação ({nationLabel})</>
                          ) : null}
                          {" = "}
                          <strong>{final}</strong> — rola {final} dado{final === 1 ? "" : "s"}
                        </div>
                      </>
                    }
                  >
                    {trait.label}
                  </InfoTip>
                </div>
                <div className="text-xs text-ink-soft">{trait.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <span data-testid={`trait-${trait.key}-val`} className="text-lg font-bold text-accent">
                  {value}
                </span>
                <Stepper
                  value={value}
                  onDec={() => adjustTrait(trait.key, -1)}
                  onInc={() => adjustTrait(trait.key, 1)}
                  decDisabled={decDisabled}
                  incDisabled={incDisabled}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
