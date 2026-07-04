import type { ReactNode } from "react";

export interface TagChipProps {
  children: ReactNode;
  tone?: "accent" | "muted";
}

/** Chip pequeno para custo/etiqueta (ex.: "2 pts", "gratis") — usado em Vantagens/Formacoes. */
export function TagChip({ children, tone = "muted" }: TagChipProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        tone === "accent"
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-surface-2 text-ink-soft",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
