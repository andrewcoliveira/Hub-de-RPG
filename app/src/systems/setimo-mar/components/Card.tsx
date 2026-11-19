import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  title?: string;
}

/** Contêiner básico reutilizável — superfície temática com borda e destaque opcional.
 *  Passar a prop `active` (mesmo `false`) marca o card como selecionável: ele ganha
 *  hover-lift + borda de acento. Cards-contêiner (sem `active`) ficam estáticos. */
export function Card({ children, active, className = "", title }: CardProps) {
  const interactive = active !== undefined;
  return (
    <div
      title={title}
      className={[
        "sm-card rounded-lg border bg-surface text-ink border-line p-4",
        interactive ? "sm-card-hover" : "",
        active ? "sm-card-selected" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
