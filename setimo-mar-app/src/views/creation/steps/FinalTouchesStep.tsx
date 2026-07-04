import { useState } from "react";
import { useFicha } from "@/store/ficha";
import { numIdiomas, fortunaPersiste } from "@/engine/derive";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { TagChip } from "@/components/TagChip";

export function FinalTouchesStep() {
  const f = useFicha((s) => s.f);
  const addReputacao = useFicha((s) => s.addReputacao);
  const removeReputacao = useFicha((s) => s.removeReputacao);
  const addIdioma = useFicha((s) => s.addIdioma);
  const removeIdioma = useFicha((s) => s.removeIdioma);
  const setFortunaInicial = useFicha((s) => s.setFortunaInicial);

  const [novaReputacao, setNovaReputacao] = useState("");
  const [novoIdioma, setNovoIdioma] = useState("");

  const idiomasMax = numIdiomas(f);
  const persiste = fortunaPersiste(f);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h3 className="mb-2 font-semibold text-ink">Reputação</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {f.finalTouches.reputacoes.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <TagChip>{r}</TagChip>
              <button
                type="button"
                data-testid={`reputacao-remove-${i}`}
                onClick={() => removeReputacao(i)}
                className="text-xs text-ink-soft hover:text-accent"
                aria-label={`Remover reputação ${r}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            data-testid="reputacao-input"
            value={novaReputacao}
            onChange={(e) => setNovaReputacao(e.target.value)}
            placeholder="Nova reputação..."
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            data-testid="reputacao-add"
            onClick={() => {
              addReputacao(novaReputacao);
              setNovaReputacao("");
            }}
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:text-accent"
          >
            Adicionar
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold text-ink">
          Idiomas{" "}
          <span data-testid="idioma-count" className="text-sm font-normal text-ink-soft">
            {f.finalTouches.idiomas.length + " / " + idiomasMax}
          </span>
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {f.finalTouches.idiomas.map((idioma, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <TagChip>{idioma}</TagChip>
              <button
                type="button"
                data-testid={`idioma-remove-${i}`}
                onClick={() => removeIdioma(i)}
                className="text-xs text-ink-soft hover:text-accent"
                aria-label={`Remover idioma ${idioma}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            data-testid="idioma-input"
            value={novoIdioma}
            onChange={(e) => setNovoIdioma(e.target.value)}
            placeholder="Novo idioma..."
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            data-testid="idioma-add"
            onClick={() => {
              addIdioma(novoIdioma);
              setNovoIdioma("");
            }}
            className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-ink hover:text-accent"
          >
            Adicionar
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold text-ink">Fortuna Inicial</h3>
        <Field
          label="Fortuna"
          value={String(f.finalTouches.fortunaInicial)}
          onChange={(v) => setFortunaInicial(Number(v))}
        />
        <div data-testid="fortuna-note" className="mt-2 text-xs text-ink-soft">
          {persiste ? "Persiste entre sessões." : "Zera a cada sessão."}
        </div>
      </Card>
    </div>
  );
}
