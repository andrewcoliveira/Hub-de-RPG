export interface BudgetProps {
  label: string;
  left: number;
  total: number;
}

/** Barra de orçamento (pontos restantes / total) — usada em Atributos, Perícias, Vantagens, Feitiçaria. */
export function Budget({ label, left, total }: BudgetProps) {
  const spent = total - left;
  const pct = total > 0 ? Math.min(100, Math.max(0, (spent / total) * 100)) : 0;
  const over = left < 0;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-ink-soft">{label}</span>
      <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-2">
        <div
          className={over ? "h-full bg-red-500" : "h-full bg-accent"}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={over ? "font-semibold text-red-500" : "text-ink"}>
        {left} / {total}
      </span>
    </div>
  );
}
