import { useFicha } from "@/store/ficha";
import { TRAITS, NATIONS } from "@/engine";
import type { NationKey, TraitKey } from "@/engine/types";
import { Field } from "@/components/Field";
import { Card } from "@/components/Card";
import { PillToggle } from "@/components/PillToggle";

const NATION_KEYS = Object.keys(NATIONS) as NationKey[];

function traitLabel(key: TraitKey): string {
  return TRAITS.find((t) => t.key === key)?.label ?? key;
}

export function ConceptNationStep() {
  const f = useFicha((s) => s.f);
  const setConcept = useFicha((s) => s.setConcept);
  const selectNation = useFicha((s) => s.selectNation);
  const setNationTrait = useFicha((s) => s.setNationTrait);

  const nation = f.nation ? NATIONS[f.nation] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome" value={f.concept.name} onChange={(v) => setConcept("name", v)} />
        <Field label="Jogador" value={f.concept.player} onChange={(v) => setConcept("player", v)} />
        <Field label="Conceito" value={f.concept.concept} onChange={(v) => setConcept("concept", v)} />
        <Field label="Religião" value={f.concept.religion} onChange={(v) => setConcept("religion", v)} />
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-ink">Nação</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {NATION_KEYS.map((key) => {
            const def = NATIONS[key];
            const active = f.nation === key;
            return (
              <button key={key} type="button" onClick={() => selectNation(key)} className="text-left">
                <Card active={active} title={def.blurb}>
                  <div className="font-semibold text-ink">{def.label}</div>
                  <div className="text-xs text-ink-soft">{def.blurb}</div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>

      {nation && (
        <div>
          <h3 className="mb-2 font-semibold text-ink">+1 de Nação</h3>
          <PillToggle<TraitKey | "">
            name="Atributo de Nação"
            value={f.nationTrait ?? ""}
            onChange={(v) => setNationTrait(v as TraitKey)}
            options={nation.traits.map((t) => ({ value: t, label: traitLabel(t) }))}
          />
        </div>
      )}
    </div>
  );
}
