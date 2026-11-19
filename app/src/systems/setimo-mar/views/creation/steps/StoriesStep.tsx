import { useState } from "react";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { STORY_PRESETS } from "@/systems/setimo-mar/engine";
import { Card } from "@/systems/setimo-mar/components/Card";
import { Field } from "@/systems/setimo-mar/components/Field";

export function StoriesStep() {
  const f = useFicha((s) => s.f);
  const applyStoryPreset = useFicha((s) => s.applyStoryPreset);
  const setStoryField = useFicha((s) => s.setStoryField);
  const addStoryStep = useFicha((s) => s.addStoryStep);
  const toggleStoryStep = useFicha((s) => s.toggleStoryStep);
  const [novoPasso, setNovoPasso] = useState("");

  const story = f.stories[0];
  const passos = story?.passos ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 font-semibold text-ink">Ponto de Partida</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STORY_PRESETS).map(([key, def]) => (
            <button
              key={key}
              type="button"
              data-testid={`story-preset-${key}`}
              onClick={() => applyStoryPreset(def.label, def.final, def.primeiroPasso)}
              title={def.final}
              className={[
                "rounded-full border px-3 py-1 text-sm transition-colors",
                story?.nome === def.label
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-surface-2 text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {def.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <Field
            label="Nome"
            value={story?.nome ?? ""}
            onChange={(v) => setStoryField(0, "nome", v)}
          />
          <Field
            label="Final"
            value={story?.final ?? ""}
            onChange={(v) => setStoryField(0, "final", v)}
          />
          <Field
            label="Recompensa"
            value={story?.recompensa ?? ""}
            onChange={(v) => setStoryField(0, "recompensa", v)}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-ink">Passos</h3>
        <ul className="flex flex-col gap-2">
          {passos.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                data-testid={`story-step-${i}`}
                checked={p.feito}
                onChange={() => toggleStoryStep(0, i)}
                className="h-4 w-4 accent-accent"
              />
              <span className={p.feito ? "text-ink-soft line-through" : "text-ink"}>
                {p.texto}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            data-testid="story-step-input"
            value={novoPasso}
            onChange={(e) => setNovoPasso(e.target.value)}
            placeholder="Novo passo..."
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            data-testid="story-step-add"
            onClick={() => {
              const texto = novoPasso.trim();
              if (!texto) return;
              addStoryStep(0, texto);
              setNovoPasso("");
            }}
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:text-accent"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
