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
      <span className="text-ink-soft">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}
