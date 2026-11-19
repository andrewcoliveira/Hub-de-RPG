export interface PillOption<T extends string> {
  value: T;
  label: string;
}

export interface PillToggleProps<T extends string> {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
}

/** Grupo de pílulas mutuamente exclusivas (ex.: modo Criação|Jogo, +1 de Nação). */
export function PillToggle<T extends string>({ options, value, onChange, name }: PillToggleProps<T>) {
  return (
    <div role="group" aria-label={name} className="sm-pill-group">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={["sm-pill", isActive ? "sm-pill-active" : ""].filter(Boolean).join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
