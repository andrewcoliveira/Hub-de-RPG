export interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Rótulo + input de texto controlado (Conceito & Nação). */
export function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium uppercase tracking-wide text-ink-soft" style={{ fontSize: "0.72rem" }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="sm-input"
      />
    </label>
  );
}
