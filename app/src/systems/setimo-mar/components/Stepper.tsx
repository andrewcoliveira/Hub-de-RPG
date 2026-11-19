export interface StepperProps {
  value: number;
  onDec: () => void;
  onInc: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
}

/** Controle numérico +/- reutilizável (Atributos, Perícias). */
export function Stepper({ value, onDec, onInc, decDisabled = false, incDisabled = false }: StepperProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="-"
        onClick={onDec}
        disabled={decDisabled}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        -
      </button>
      <span className="w-6 text-center font-semibold text-ink">{value}</span>
      <button
        type="button"
        aria-label="+"
        onClick={onInc}
        disabled={incDisabled}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
