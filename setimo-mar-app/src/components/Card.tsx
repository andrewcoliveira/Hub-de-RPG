import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  title?: string;
}

/** Contêiner básico reutilizável — superfície temática com borda e destaque opcional. */
export function Card({ children, active = false, className = "", title }: CardProps) {
  return (
    <div
      title={title}
      className={[
        "rounded-lg border bg-surface text-ink border-line p-4",
        active ? "ring-2 ring-accent" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
