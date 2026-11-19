// ══════════════════════════════════════════════════════════════════
//  Moldura comum das páginas do Império de Jade: barra do topo, capa e rodapé.
// ══════════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Toaster } from "@/shared/components/Toaster";
import { LOGO_URL } from "../assets";

export type JadePage = "ficha" | "gerador";

const TOOLS: { page: JadePage; href: string; short: string; long: string }[] = [
  { page: "ficha", href: "ficha.html", short: "Fichas", long: "Criador de " },
  { page: "gerador", href: "gerador.html", short: "Recompensas", long: "Gerador de " },
];

export function JadeTopbar({ current }: { current: JadePage }) {
  return (
    <header className="topbar">
      <a className="hub-link" href="../index.html" title="Voltar ao Hub de RPG">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        <span>Hub</span>
      </a>
      <span className="sys-name">Império de Jade</span>
      <nav className="page-tabs" aria-label="Ferramentas do Império de Jade">
        {TOOLS.map((t) => (
          <a key={t.page} href={t.href} aria-current={t.page === current ? "page" : undefined}>
            <span className="long">{t.long}</span>{t.short}
          </a>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}

export function JadeHero({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <img className="page-hero-logo no-drag" src={LOGO_URL} alt="Império de Jade" />
        <div className="page-hero-text">
          <h1>{title}</h1>
          <p>{children}</p>
        </div>
      </div>
    </section>
  );
}

export function JadeFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Rodapé">
        <a href="../index.html">Hub de RPG</a>
        <a href="ficha.html">Criador de Fichas</a>
        <a href="gerador.html">Gerador de Recompensas</a>
      </nav>
      <p>
        Império de Jade pertence à <a href="https://jamboeditora.com.br" target="_blank" rel="noopener">Jambo Editora</a>.
        Ferramenta de fã, sem vínculo oficial.
      </p>
      <Toaster />
    </footer>
  );
}
