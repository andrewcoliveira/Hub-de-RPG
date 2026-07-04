import { useFicha } from "@/store/ficha";
import { SKILLS, CREATION } from "@/engine";
import { skillFinal, skillBackgroundBonus, skillPointsLeft } from "@/engine/derive";
import { Stepper } from "@/components/Stepper";
import { Budget } from "@/components/Budget";

export function SkillsStep() {
  const f = useFicha((s) => s.f);
  const adjustSkill = useFicha((s) => s.adjustSkill);
  const pointsLeft = skillPointsLeft(f);

  return (
    <div className="flex flex-col gap-4">
      <Budget label="Pontos de Perícia" left={pointsLeft} total={CREATION.skillPoints} />
      <div className="flex flex-col gap-2">
        {SKILLS.map((skill) => {
          const value = f.skills[skill.key] ?? 0;
          const bonus = skillBackgroundBonus(f, skill.key);
          const final = skillFinal(f, skill.key);
          const decDisabled = value <= 0;
          const incDisabled = value >= CREATION.skillCreationMax || pointsLeft <= 0;
          return (
            <div
              key={skill.key}
              data-testid={`skill-${skill.key}`}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-3"
            >
              <div>
                <div className="font-semibold text-ink">{skill.label}</div>
                <div className="text-xs text-ink-soft">{skill.desc}</div>
                {bonus > 0 && (
                  <div className="text-xs text-accent">+{bonus} de Formação</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span data-testid={`skill-${skill.key}-final`} className="text-lg font-bold text-accent">
                  {final}
                </span>
                <Stepper
                  value={value}
                  onDec={() => adjustSkill(skill.key, -1)}
                  onInc={() => adjustSkill(skill.key, 1)}
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
