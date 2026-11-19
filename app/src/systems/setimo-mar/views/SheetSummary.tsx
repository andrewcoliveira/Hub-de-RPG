// ══════════════════════════════════════════════════════════════════
//  7º MAR — Resumo da Ficha (componente PURO)
//  Recebe `f: Ficha` por prop — NÃO lê a store diretamente — para ser
//  reusável tanto na etapa de Revisão (criação) quanto no Modo Jogo e
//  na impressão.
// ══════════════════════════════════════════════════════════════════

import type { Ficha, SchoolKey } from "@/systems/setimo-mar/engine/types";
import { TRAITS, SKILLS, NATIONS, ARCANA, SORCERY, DUELING_STYLES, SOCIETIES } from "@/systems/setimo-mar/engine";
import { traitFinal, skillFinal } from "@/systems/setimo-mar/engine/derive";

export interface SheetSummaryProps {
  f: Ficha;
}

export function SheetSummary({ f }: SheetSummaryProps) {
  const nationDef = f.nation ? NATIONS[f.nation] : null;
  const skillsComGrau = SKILLS.filter((s) => skillFinal(f, s.key) > 0);
  const virtude = f.arcana?.virtude ? ARCANA[f.arcana.virtude] : null;
  const hubris = f.arcana?.hubris ? ARCANA[f.arcana.hubris] : null;

  const schoolKey = f.sorcery?.school as SchoolKey | null | undefined;
  const school = schoolKey ? SORCERY[schoolKey] : null;
  const chosenPowers = school
    ? [...school.maiores, ...school.menores].filter((p) => f.sorcery.powers.includes(p.key))
    : [];

  const dueling = f.dueling?.style ? DUELING_STYLES[f.dueling.style] : null;

  const story = f.stories?.[0];
  const proximoPasso = story?.passos?.find((p) => !p.feito);

  const society = f.society?.key ? SOCIETIES[f.society.key] : null;

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-4 text-ink">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-ink">{f.concept?.name || "Sem nome"}</h2>
        {f.concept?.concept ? <p className="text-sm text-ink-soft">{f.concept.concept}</p> : null}
        {nationDef ? <p className="text-sm text-accent">{nationDef.label}</p> : null}
      </div>

      {/* Atributos */}
      <div data-testid="summary-traits">
        <h3 className="mb-2 font-semibold text-ink">Atributos</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TRAITS.map((t) => (
            <div key={t.key} className="rounded-md border border-line bg-surface-2 p-2 text-center">
              <div className="text-xs text-ink-soft">{t.label}</div>
              <div className="text-lg font-bold text-ink">{traitFinal(f, t.key)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Perícias */}
      {skillsComGrau.length > 0 ? (
        <div data-testid="summary-skills">
          <h3 className="mb-2 font-semibold text-ink">Perícias</h3>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {skillsComGrau.map((s) => (
              <div key={s.key} className="text-sm text-ink">
                {s.label}: <span className="font-semibold">{skillFinal(f, s.key)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Formações */}
      {f.backgrounds.length > 0 ? (
        <div data-testid="summary-backgrounds">
          <h3 className="mb-2 font-semibold text-ink">Formações</h3>
          <p className="text-sm text-ink">{f.backgrounds.join(", ")}</p>
        </div>
      ) : null}

      {/* Vantagens */}
      {f.advantages.length > 0 ? (
        <div data-testid="summary-advantages">
          <h3 className="mb-2 font-semibold text-ink">Vantagens</h3>
          <p className="text-sm text-ink">{f.advantages.join(", ")}</p>
        </div>
      ) : null}

      {/* Arcano */}
      {virtude || hubris ? (
        <div data-testid="summary-arcana">
          <h3 className="mb-2 font-semibold text-ink">Arcano</h3>
          {virtude ? (
            <p className="text-sm text-ink">
              <span className="text-ink-soft">Virtude — {virtude.label}: </span>
              {virtude.virtude}
            </p>
          ) : null}
          {hubris ? (
            <p className="text-sm text-ink">
              <span className="text-ink-soft">Húbris — {hubris.label}: </span>
              {hubris.hubris}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Feitiçaria (condicional) */}
      {school ? (
        <div data-testid="summary-sorcery">
          <h3 className="mb-2 font-semibold text-ink">
            Feitiçaria — <span>{school.label}</span>
          </h3>
          {chosenPowers.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm text-ink">
              {chosenPowers.map((p) => (
                <li key={p.key}>{p.nome}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Nenhum poder selecionado ainda.</p>
          )}
        </div>
      ) : null}

      {/* Estilo de Duelo (condicional) */}
      {dueling ? (
        <div data-testid="summary-dueling">
          <h3 className="mb-2 font-semibold text-ink">
            Estilo de Duelo — <span>{dueling.label}</span>
          </h3>
          <p className="text-sm text-ink-soft">{dueling.bonus}</p>
        </div>
      ) : null}

      {/* História (condicional) */}
      {story?.nome ? (
        <div data-testid="summary-story">
          <h3 className="mb-2 font-semibold text-ink">
            História — <span>{story.nome}</span>
          </h3>
          {story.final ? <p className="text-sm text-ink">{story.final}</p> : null}
          {proximoPasso ? (
            <p className="mt-1 text-sm text-ink-soft">Próximo passo: {proximoPasso.texto}</p>
          ) : null}
        </div>
      ) : null}

      {/* Sociedade (condicional) */}
      {society ? (
        <div data-testid="summary-society">
          <h3 className="mb-2 font-semibold text-ink">
            Sociedade — <span>{society.label}</span>
          </h3>
          <p className="text-sm text-ink-soft">Favor inicial: 2</p>
        </div>
      ) : null}

      {/* Toques Finais */}
      <div data-testid="summary-final-touches">
        <h3 className="mb-2 font-semibold text-ink">Toques Finais</h3>
        {f.finalTouches?.reputacoes?.length > 0 ? (
          <p className="text-sm text-ink">
            <span className="text-ink-soft">Reputação: </span>
            {f.finalTouches.reputacoes.join(", ")}
          </p>
        ) : null}
        {f.finalTouches?.idiomas?.length > 0 ? (
          <p className="text-sm text-ink">
            <span className="text-ink-soft">Idiomas: </span>
            {f.finalTouches.idiomas.join(", ")}
          </p>
        ) : null}
        <p className="text-sm text-ink">
          <span className="text-ink-soft">Fortuna inicial: </span>
          {f.finalTouches?.fortunaInicial ?? 0}
        </p>
      </div>
    </div>
  );
}
