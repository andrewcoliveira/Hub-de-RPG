import type { ReactNode } from "react";

export interface InfoTipProps {
  /** Gatilho visível (ex.: o nome do Atributo). */
  children: ReactNode;
  /** Conteúdo do balão exibido no hover/foco. */
  tip: ReactNode;
}

/** Tooltip temático (CSS puro): mostra `tip` ao passar o mouse ou focar o
 *  gatilho. Acessível via teclado (tabIndex + focus-within) e leitores de
 *  tela (role="tooltip"). */
export function InfoTip({ children, tip }: InfoTipProps) {
  return (
    <span className="sm-tip">
      <span className="sm-tip-trigger" tabIndex={0}>
        {children}
        <span className="sm-tip-mark" aria-hidden="true">
          ⓘ
        </span>
      </span>
      <span className="sm-tip-body" role="tooltip">
        {tip}
      </span>
    </span>
  );
}
