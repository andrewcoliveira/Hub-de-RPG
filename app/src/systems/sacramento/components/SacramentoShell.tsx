// ══════════════════════════════════════════════════════════════════
//  Moldura das páginas de Sacramento RPG: barra do topo, capa e rodapé.
// ══════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Toaster } from "@/shared/components/Toaster";

/** Estrela de xerife (desenho original). */
export function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
      <circle cx="60" cy="60" r="54" strokeDasharray="2 7" strokeLinecap="round" />
      <path d="M60 14l12 30 32 2-25 20 9 31-28-18-28 18 9-31-25-20 32-2z" />
      <circle cx="60" cy="14" r="5" fill="currentColor" /><circle cx="104" cy="46" r="5" fill="currentColor" />
      <circle cx="88" cy="97" r="5" fill="currentColor" /><circle cx="32" cy="97" r="5" fill="currentColor" />
      <circle cx="16" cy="46" r="5" fill="currentColor" />
      <circle cx="60" cy="60" r="13" />
    </svg>
  );
}

export function SacramentoTopbar() {
  return (
    <header className="topbar">
      <a className="hub-link" href="../index.html" title="Voltar ao Hub de RPG">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        <span>Hub</span>
      </a>
      <span className="sys-name">Sacramento</span>
      <nav className="page-tabs" aria-label="Ferramentas de Sacramento RPG">
        <a href="ficha.html" aria-current="page"><span className="long">Criador de </span>Fichas</a>
      </nav>
      <ThemeToggle />
    </header>
  );
}

export function SacramentoHero({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <Star className="page-hero-logo" />
        <div className="page-hero-text">
          <span className="hero-stamp">Oeste Selvagem · 1880</span>
          <h1>{title}</h1>
          <p>{children}</p>
        </div>
      </div>
    </section>
  );
}

export function SacramentoFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Rodapé">
        <a href="../index.html">Hub de RPG</a>
        <a href="ficha.html">Criador de Fichas</a>
      </nav>
      <p>
        Sacramento RPG é de Calango e Mineiro, publicado pela <a href="https://jamboeditora.com.br" target="_blank" rel="noopener">Jambô Editora</a>.
        Ferramenta de fã, sem vínculo oficial.
      </p>
      <Toaster />
    </footer>
  );
}
