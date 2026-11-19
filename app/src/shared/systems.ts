// ══════════════════════════════════════════════════════════════════
//  Registro dos sistemas e ferramentas mostrados no hub.
//  Para um sistema novo: adicione um item aqui, crie src/systems/<sistema>/
//  e registre as páginas em site.config.mjs.
// ══════════════════════════════════════════════════════════════════

export type ToolKind = "ficha" | "recompensa";

export interface ToolDef {
  kind: ToolKind;
  title: string;
  desc: string;
  /** Endereço publicado, relativo à raiz do site. */
  href: string;
}

export interface SystemDef {
  key: string;
  name: string;
  tags: string[];
  desc: string;
  /** Variável CSS de cor do cartão (definida em hub.css). */
  color: string;
  /** Desenho do brasão do cartão (conteúdo de um <svg viewBox="0 0 120 120">). */
  banner: string;
  tools: ToolDef[];
}

export const TOOL_KINDS: { key: ToolKind | "all"; label: string }[] = [
  { key: "all", label: "Tudo" },
  { key: "ficha", label: "Fichas" },
  { key: "recompensa", label: "Recompensas" },
];

export const SYSTEMS: SystemDef[] = [
  {
    key: "imperio-de-jade",
    name: "Império de Jade",
    tags: ["Fantasia oriental", "d20"],
    desc: "Samurais, ninjas, shugenjas e youkai num império de honra e intriga.",
    color: "var(--sys-jade)",
    banner: '<circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="16"/><path d="M60 16v28M60 76v28M16 60h28M76 60h28"/>',
    tools: [
      { kind: "ficha", title: "Criador de Fichas", desc: "Atributos, raça, classe, perícias e talentos passo a passo", href: "imperio-de-jade/ficha.html" },
      { kind: "recompensa", title: "Gerador de Recompensas", desc: "Riquezas e equipamentos aleatórios por ND", href: "imperio-de-jade/gerador.html" },
    ],
  },
  {
    key: "setimo-mar",
    name: "7º Mar",
    tags: ["Capa e espada", "d10"],
    desc: "Heróis, duelistas e piratas nas intrigas das nações de Théah.",
    color: "var(--sys-sea)",
    banner: '<circle cx="60" cy="60" r="44"/><path d="M60 22v76M42 40h36M60 98c-20 0-34-12-38-26M60 98c20 0 34-12 38-26"/><circle cx="60" cy="30" r="8"/>',
    tools: [
      { kind: "ficha", title: "Criador de Fichas", desc: "Traços, formações, perícias, vantagens e arcanos", href: "setimo-mar/index.html" },
    ],
  },
  {
    key: "ordem-paranormal",
    name: "Ordem Paranormal",
    tags: ["Terror investigativo", "d20"],
    desc: "Agentes da Ordo Realitas contra as entidades do Outro Lado: Sangue, Morte, Conhecimento, Energia e Medo.",
    color: "var(--sys-ordem)",
    banner: '<circle cx="60" cy="60" r="44"/><path d="M60 16v88M22 82l76-44M22 38l76 44"/><path d="M60 34l23 40H37z"/>',
    tools: [
      { kind: "ficha", title: "Criador de Fichas", desc: "Atributos, origem, classe e NEX, perícias, poderes e rituais", href: "ordem-paranormal/ficha.html" },
    ],
  },
];
