// ══════════════════════════════════════════════════════════════════
//  7º MAR — Marcadores do Modo Jogo (ficha viva)
//  Pontos Heroicos, Ferimentos, Espiral da Morte, Favor, Fortuna.
//  Clamps já garantidos na store — aqui só refletimos o estado.
// ══════════════════════════════════════════════════════════════════

import { Card } from "@/systems/setimo-mar/components/Card";
import { Stepper } from "@/systems/setimo-mar/components/Stepper";
import { useFicha } from "@/systems/setimo-mar/store/ficha";

const SPIRAL = [
  "Saudável",
  "1+ Ferimento Dramático (dado extra em Riscos próprios)",
  "2+ (Vilões ganham 2 dados extras contra você)",
  "3+ (seus 10s explodem)",
  "Desamparado",
];

export function Trackers() {
  const f = useFicha((s) => s.f);
  const adjustWound = useFicha((s) => s.adjustWound);
  const adjustHeroPoints = useFicha((s) => s.adjustHeroPoints);
  const adjustFavor = useFicha((s) => s.adjustFavor);
  const setFortuna = useFicha((s) => s.setFortuna);

  const dram = f.play.ferimentosDramaticos;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="flex flex-col items-center gap-2" title="Pontos Heroicos">
        <h3 className="font-semibold text-ink">Pontos Heroicos</h3>
        <div data-testid="track-pontos">
          <Stepper
            value={f.play.pontosHeroicos}
            onDec={() => adjustHeroPoints(-1)}
            onInc={() => adjustHeroPoints(1)}
          />
        </div>
        <span data-testid="track-pontos-val" className="sr-only">
          {f.play.pontosHeroicos}
        </span>
      </Card>

      <Card className="flex flex-col items-center gap-2" title="Ferimentos">
        <h3 className="font-semibold text-ink">Ferimentos</h3>
        <Stepper
          value={f.play.ferimentos}
          onDec={() => adjustWound("ferimentos", -1)}
          onInc={() => adjustWound("ferimentos", 1)}
        />
        <span data-testid="track-ferimentos-val" className="sr-only">
          {f.play.ferimentos}
        </span>
      </Card>

      <Card className="flex flex-col items-center gap-2" title="Espiral da Morte">
        <h3 className="font-semibold text-ink">Espiral da Morte</h3>
        <div data-testid="track-espiral">
          <Stepper
            value={dram}
            onDec={() => adjustWound("ferimentosDramaticos", -1)}
            onInc={() => adjustWound("ferimentosDramaticos", 1)}
          />
        </div>
        <span data-testid="track-espiral-val" className="sr-only">
          {dram}
        </span>
        <p data-testid="spiral-text" className="text-center text-sm text-ink-soft">
          {SPIRAL[dram]}
        </p>
      </Card>

      <Card className="flex flex-col items-center gap-2" title="Favor">
        <h3 className="font-semibold text-ink">Favor</h3>
        <Stepper value={f.play.favor} onDec={() => adjustFavor(-1)} onInc={() => adjustFavor(1)} />
        <span data-testid="track-favor-val" className="sr-only">
          {f.play.favor}
        </span>
      </Card>

      <Card className="flex flex-col items-center gap-2" title="Fortuna">
        <h3 className="font-semibold text-ink">Fortuna</h3>
        <input
          type="number"
          className="w-24 rounded-md border border-line bg-surface-2 p-1 text-center text-ink"
          value={f.play.fortuna}
          onChange={(e) => setFortuna(+e.target.value || 0)}
        />
        <span data-testid="track-fortuna-val" className="sr-only">
          {f.play.fortuna}
        </span>
      </Card>
    </div>
  );
}
