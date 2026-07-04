// ══════════════════════════════════════════════════════════════════
//  7º MAR — Modo Jogo (ficha viva)
//  Cabeçalho + Atributos/Perícias somente-leitura + Trackers + Histórias + Notas.
// ══════════════════════════════════════════════════════════════════

import { Card } from "@/components/Card";
import { useFicha } from "@/store/ficha";
import { TRAITS, SKILLS, NATIONS } from "@/engine";
import { traitFinal, skillFinal } from "@/engine/derive";
import { Trackers } from "@/views/play/Trackers";
import { StoriesTracker } from "@/views/play/StoriesTracker";

export function PlayView() {
  const f = useFicha((s) => s.f);
  const setNotas = useFicha((s) => s.setNotas);

  const nationDef = f.nation ? NATIONS[f.nation] : null;
  const skillsComGrau = SKILLS.filter((s) => skillFinal(f, s.key) > 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Cabeçalho */}
      <Card>
        <h2 className="text-xl font-bold text-ink">{f.concept?.name || "Sem nome"}</h2>
        {f.concept?.concept ? <p className="text-sm text-ink-soft">{f.concept.concept}</p> : null}
        {nationDef ? <p className="text-sm text-accent">{nationDef.label}</p> : null}
      </Card>

      {/* Atributos (somente-leitura) */}
      <Card>
        <h3 className="mb-2 font-semibold text-ink">Atributos</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TRAITS.map((t) => (
            <div key={t.key} className="rounded-md border border-line bg-surface-2 p-2 text-center">
              <div className="text-xs text-ink-soft">{t.label}</div>
              <div className="text-lg font-bold text-ink">{traitFinal(f, t.key)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Perícias (somente-leitura, grau > 0) */}
      {skillsComGrau.length > 0 ? (
        <Card>
          <h3 className="mb-2 font-semibold text-ink">Perícias</h3>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {skillsComGrau.map((s) => (
              <div key={s.key} className="text-sm text-ink">
                {s.label}: <span className="font-semibold">{skillFinal(f, s.key)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Marcadores da ficha viva */}
      <Trackers />

      {/* Histórias */}
      <StoriesTracker />

      {/* Notas */}
      <Card>
        <h3 className="mb-2 font-semibold text-ink">Notas</h3>
        <textarea
          value={f.play.notas}
          onChange={(e) => setNotas(e.target.value)}
          className="min-h-[8rem] w-full rounded-md border border-line bg-surface-2 p-2 text-ink"
          placeholder="Anotações de sessão..."
        />
      </Card>
    </div>
  );
}
