// ══════════════════════════════════════════════════════════════════
//  7º MAR — Rastreador de Histórias (Modo Jogo)
//  Lista os passos de f.stories[0] com checkbox e permite adicionar novos.
// ══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Card } from "@/components/Card";
import { useFicha } from "@/store/ficha";

export function StoriesTracker() {
  const f = useFicha((s) => s.f);
  const toggleStoryStep = useFicha((s) => s.toggleStoryStep);
  const addStoryStep = useFicha((s) => s.addStoryStep);
  const [texto, setTexto] = useState("");

  const story = f.stories[0] ?? null;
  const passos = story?.passos ?? [];

  return (
    <Card>
      <h3 className="mb-2 font-semibold text-ink">
        História {story?.nome ? <span className="text-accent">— {story.nome}</span> : null}
      </h3>
      {story?.final ? <p className="mb-2 text-sm text-ink-soft">{story.final}</p> : null}

      <ul className="flex flex-col gap-1">
        {passos.map((p, i) => (
          <li key={i} data-testid={`play-story-step-${i}`} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.feito}
              onChange={() => toggleStoryStep(0, i)}
              className="h-4 w-4 accent-accent"
            />
            <span className={p.feito ? "text-ink-soft line-through" : "text-ink"}>{p.texto}</span>
          </li>
        ))}
        {passos.length === 0 ? <p className="text-sm text-ink-soft">Nenhum passo ainda.</p> : null}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Novo passo..."
          className="flex-1 rounded-md border border-line bg-surface-2 p-1 text-ink"
        />
        <button
          type="button"
          onClick={() => {
            addStoryStep(0, texto.trim());
            setTexto("");
          }}
          className="rounded-md border border-line bg-surface-2 px-3 py-1 text-ink transition-colors hover:text-accent"
        >
          Adicionar
        </button>
      </div>
    </Card>
  );
}
