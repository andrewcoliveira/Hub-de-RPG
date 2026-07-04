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
    <div role="group" aria-label={name} className="inline-flex gap-1 rounded-full border border-line bg-surface-2 p-1">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-full px-3 py-1 text-sm transition-colors",
              isActive ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
