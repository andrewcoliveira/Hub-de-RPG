// ══════════════════════════════════════════════════════════════════
//  Moldura das páginas de Ordem Paranormal: barra do topo, capa e rodapé.
// ══════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Toaster } from "@/shared/components/Toaster";

/** Sigilo decorativo (desenho original, não é o símbolo oficial). */
export function Sigil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="60" cy="60" r="52" />
      <circle cx="60" cy="60" r="40" strokeWidth="1.5" strokeDasharray="3 6" />
      <path d="M60 14v92M24 81l72-42M24 39l72 42" strokeWidth="2" />
      <path d="M60 30l26 45H34z" />
      <circle cx="60" cy="60" r="9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function OrdemTopbar() {
  return (
    <header className="topbar">
      <a className="hub-link" href="../index.html" title="Voltar ao Hub de RPG">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        <span>Hub</span>
      </a>
      <span className="sys-name">Ordem Paranormal</span>
      <nav className="page-tabs" aria-label="Ferramentas de Ordem Paranormal">
        <a href="ficha.html" aria-current="page"><span className="long">Criador de </span>Fichas</a>
      </nav>
      <ThemeToggle />
    </header>
  );
}

export function OrdemHero({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <Sigil className="page-hero-logo" />
        <div className="page-hero-text">
          <span className="hero-stamp">Ordo Realitas · Arquivo de agentes</span>
          <h1>{title}</h1>
          <p>{children}</p>
        </div>
      </div>
    </section>
  );
}

export function OrdemFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Rodapé">
        <a href="../index.html">Hub de RPG</a>
        <a href="ficha.html">Criador de Fichas</a>
      </nav>
      <p>
        Ordem Paranormal RPG pertence a Cellbit e à <a href="https://jamboeditora.com.br" target="_blank" rel="noopener">Jambô Editora</a>.
        Ferramenta de fã, sem vínculo oficial.
      </p>
      <Toaster />
    </footer>
  );
}
