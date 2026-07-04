import { useState } from "react";
import { useFicha } from "@/store/ficha";
import { completeness } from "@/engine/derive";
import { Card } from "@/components/Card";
import { SheetSummary } from "@/views/SheetSummary";

export function ReviewStep() {
  const f = useFicha((s) => s.f);
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const issues = completeness(f);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="mb-2 font-semibold text-ink">Checklist</h3>
        {issues.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-ink" data-testid="review-issues">
            {issues.map((issue, i) => (
              <li key={i} className="text-ink-soft">
                • {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="review-complete" className="text-sm text-accent">
            Ficha completa!
          </p>
        )}
      </Card>

      <button
        type="button"
        data-testid="review-toggle-summary"
        onClick={() => setMostrarFicha((v) => !v)}
        className="w-fit rounded-md border border-line bg-surface-2 px-4 py-2 text-sm text-ink hover:text-accent"
      >
        {mostrarFicha ? "Ocultar Ficha Completa" : "Ver Ficha Completa"}
      </button>

      {mostrarFicha ? <SheetSummary f={f} /> : null}
    </div>
  );
}
