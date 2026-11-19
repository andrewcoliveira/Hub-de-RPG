import { useState } from "react";
import { prefersReducedMotion } from "@/shared/browser";
import { toast } from "@/shared/components/Toaster";
import {
  ABILITIES, POINT_BUDGET, POINT_COST, abilityMod, assignRoll, assignedCount, baseValueFor, canIncreasePoint,
  changePointValue, classHonorFor, droppedDieIndex, finalValueFor, fmtMod, generateRolls, pointsSpent,
  raceBonusFor, resetAbilityBase, rollQuality, type AbilityKey,
} from "../engine";
import { useFicha, useJade } from "../store";
import { Meter, ModTag, useChangedAbilities, useUi } from "./ui";

const DiceIcon = ({ five = false }: { five?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="9" cy="9" r="1.2" /><circle cx="15" cy="15" r="1.2" />
    {five ? <><circle cx="15" cy="9" r="1.2" /><circle cx="9" cy="15" r="1.2" /></> : <circle cx="12" cy="12" r="1.2" />}
  </svg>
);

function RollPool() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const picked = useUi((u) => u.pickedRoll);
  const fresh = useUi((u) => u.freshRolls);
  const [rolling, setRolling] = useState(false);

  function rollAll() {
    if (rolling) return;
    if (assignedCount(s) > 0 && !confirm("Rolar de novo apaga os valores já atribuídos. Continuar?")) return;
    setRolling(true);
    setTimeout(() => {
      update((d) => generateRolls(d));
      useUi.setState({ pickedRoll: null, freshRolls: true });
      setRolling(false);
      setTimeout(() => useUi.setState({ freshRolls: false }), 900);
    }, prefersReducedMotion() ? 0 : 520);
  }

  const owners: Record<number, AbilityKey> = {};
  (Object.entries(s.assignments) as [AbilityKey, number | null][]).forEach(([k, idx]) => { if (idx !== null) owners[idx] = k; });
  const q = rollQuality(s);
  const n = assignedCount(s);

  return (
    <div className="panel roll-area">
      <div className="roll-intro">
        <p>Role <strong>4d6</strong> e descarte o menor, sete vezes. Toque em um valor e depois no atributo (ou arraste). Se a soma dos modificadores não chegar a <strong>+4</strong> ou nenhum valor for <strong>14+</strong>, você pode rolar de novo.</p>
        <button type="button" className={`btn btn-primary ${rolling ? "is-rolling" : ""}`} disabled={rolling} onClick={rollAll}>
          <DiceIcon />
          <span>{s.rolls.length ? "Rolar de novo" : "Rolar 7 valores"}</span>
        </button>
      </div>
      <div className="roll-pool" aria-live="polite">
        {!s.rolls.length ? (
          <p className="pool-empty">Nenhum valor rolado ainda.</p>
        ) : (
          s.rolls.map((r, i) => {
            const drop = droppedDieIndex(r.dice);
            const owner = owners[i] ? ABILITIES.find((a) => a.key === owners[i]) : null;
            const isPicked = picked === i;
            return (
              <button key={i} type="button" draggable
                className={`roll-chip ${owner ? "is-used" : ""} ${isPicked ? "is-picked" : ""} ${fresh ? "is-fresh" : ""}`}
                style={{ ["--i" as string]: i }} aria-pressed={isPicked}
                aria-label={`Valor ${r.sum}${owner ? `, em ${owner.label}` : ""}`}
                onClick={() => useUi.setState({ pickedRoll: isPicked ? null : i })}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(i));
                  e.dataTransfer.effectAllowed = "move";
                  e.currentTarget.classList.add("is-dragging");
                  document.querySelectorAll(".ab-tile").forEach((t) => t.classList.add("is-target"));
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove("is-dragging");
                  if (useUi.getState().pickedRoll === null) document.querySelectorAll(".ab-tile").forEach((t) => t.classList.remove("is-target", "is-over"));
                }}>
                <span className="rc-dice" aria-hidden="true">{r.dice.map((d, di) => <i key={di} className={di === drop ? "drop" : ""}>{d}</i>)}</span>
                <b className="rc-sum num">{r.sum}</b>
                <span className="rc-foot">{owner ? owner.abbr : fmtMod(abilityMod(r.sum))}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="roll-status">
        {q && (
          <>
            <span className={`tag ${q.ok ? "tag-pos" : "tag-warn"}`}>{q.ok ? "Rolagem válida" : "Você pode rolar de novo"}</span>
            <span className="muted">Soma dos modificadores <b>{fmtMod(q.modSum)}</b> · {q.hasHigh ? "tem valor 14+" : "nenhum valor 14+"}</span>
            <span className="roll-status-end">
              {picked !== null ? <span className="pick-hint">Agora toque em um atributo</span> : <span className="muted">{n}/7 atribuídos</span>}
              {n > 0 && (
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => {
                  update((d) => ABILITIES.forEach((a) => { d.assignments[a.key] = null; }));
                  useUi.setState({ pickedRoll: null });
                }}>Limpar</button>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function AbGrid() {
  const s = useJade();
  const update = useFicha((x) => x.update);
  const picked = useUi((u) => u.pickedRoll);
  const changed = useChangedAbilities(s);
  const picking = s.mode === "roll" && picked !== null;

  function onSlot(k: AbilityKey) {
    if (picked !== null) {
      update((d) => assignRoll(d, picked, k));
      useUi.setState({ pickedRoll: null });
    } else if (s.assignments[k] !== null) {
      update((d) => { d.assignments[k] = null; });
    } else {
      toast(s.rolls.length ? "Toque primeiro em um valor rolado" : "Role os valores primeiro");
    }
  }

  function onPoint(k: AbilityKey, delta: number) {
    const ok = update((d) => changePointValue(d, k, delta));
    if (!ok && delta > 0) toast("Pontos insuficientes");
  }

  return (
    <div className="ab-grid"
      onDragOver={(e) => {
        const tile = (e.target as HTMLElement).closest(".ab-tile");
        if (!tile || s.mode !== "roll") return;
        e.preventDefault();
        document.querySelectorAll(".ab-tile.is-over").forEach((t) => t !== tile && t.classList.remove("is-over"));
        tile.classList.add("is-over");
      }}
      onDrop={(e) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>(".ab-tile");
        if (!tile || s.mode !== "roll") return;
        e.preventDefault();
        document.querySelectorAll(".ab-tile").forEach((t) => t.classList.remove("is-target", "is-over"));
        const idx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (Number.isInteger(idx) && s.rolls[idx]) {
          update((d) => assignRoll(d, idx, tile.dataset.drop as AbilityKey));
          useUi.setState({ pickedRoll: null });
        }
      }}>
      {ABILITIES.map((a) => {
        const k = a.key;
        const base = baseValueFor(s, k);
        const fin = finalValueFor(s, k);
        const mod = fin !== null ? abilityMod(fin) : null;
        const inc = k === "hon" ? 0 : s.abilityIncrements[k] ?? 0;
        const v = s.pointValues[k];
        return (
          <div key={k} className={`ab-tile ${picking ? "is-target" : ""} ${changed.has(k) ? "changed" : ""}`} data-drop={k}>
            <div className="ab-head"><span className="ab-abbr">{a.abbr}</span><span className="ab-label">{a.label}</span></div>
            <div className="ab-base">
              {s.mode === "roll" ? (
                <button type="button" className={`ab-slot ${base !== null ? "filled" : ""}`} onClick={() => onSlot(k)}
                  aria-label={`${a.label}: ${base !== null ? `valor ${base}, toque para remover` : "vazio"}`}>
                  {base !== null
                    ? <><b className="num">{base}</b><span className="ab-x" aria-hidden="true">×</span></>
                    : <span className="ab-ph">{picking ? "Colocar aqui" : "Vazio"}</span>}
                </button>
              ) : (
                <div className="pt-ctrl">
                  <button type="button" className="btn btn-icon" disabled={v <= 8} aria-label={`Diminuir ${a.label}`} onClick={() => onPoint(k, -1)}>−</button>
                  <b className="num">{v}</b>
                  <button type="button" className="btn btn-icon" disabled={!canIncreasePoint(s, k)} aria-label={`Aumentar ${a.label}`} onClick={() => onPoint(k, 1)}>+</button>
                </div>
              )}
            </div>
            <div className="ab-mods">
              {s.mode === "points" && <span className="tag">custo {POINT_COST[v]}</span>}
              <ModTag v={raceBonusFor(s, k)} suffix=" raça" />
              <ModTag v={classHonorFor(s, k)} suffix=" classe" />
              {inc > 0 && <span className="tag tag-gold">+{inc} nível</span>}
            </div>
            <div className="ab-result">
              <span className="ab-final num">{fin ?? "—"}</span>
              <span className={`ab-mod ${mod === null ? "" : mod >= 0 ? "pos" : "neg"}`}>{mod === null ? "mod" : fmtMod(mod)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AtributosStep() {
  const s = useJade();
  const update = useFicha((x) => x.update);

  function setMode(m: "roll" | "points") {
    if (m === s.mode) return;
    const hasData = s.mode === "roll" ? s.rolls.length > 0 : pointsSpent(s) !== 0;
    if (hasData && !confirm("Trocar o método apaga os valores base dos atributos. Continuar?")) return;
    update((d) => { d.mode = m; resetAbilityBase(d); });
    useUi.setState({ pickedRoll: null });
  }

  return (
    <>
      <div className="segmented" role="group" aria-label="Método de geração">
        <button type="button" aria-pressed={s.mode === "roll"} onClick={() => setMode("roll")}><DiceIcon five /> Rolagem de dados</button>
        <button type="button" aria-pressed={s.mode === "points"} onClick={() => setMode("points")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h4V10H4zM10 18h4V6h-4zM16 18h4v-5h-4z" /></svg>
          Compra de pontos
        </button>
      </div>
      {s.mode === "roll" ? <RollPool /> : (
        <div className="panel points-area">
          <p>Distribua <strong>24 pontos</strong>. Todo atributo começa em 10 (custo 0) e pode ir de 8 (devolve 2 pontos) a 18 (custa 14).</p>
          <Meter label="Pontos gastos" used={pointsSpent(s)} total={POINT_BUDGET} />
        </div>
      )}
      <AbGrid />
    </>
  );
}
