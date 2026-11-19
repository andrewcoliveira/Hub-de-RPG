// ══════════════════════════════════════════════════════════════════
//  Páginas publicadas e saídas do build (fonte única de verdade).
//  Para um sistema novo: crie src/systems/<sistema>/, acrescente as páginas
//  aqui e o cartão em src/shared/systems.ts.
//  (Arquivo .mjs para ser lido tanto pelo Vite quanto pelo clean-site.)
// ══════════════════════════════════════════════════════════════════

/**
 * @typedef {object} PageDef
 * @property {string} name  Nome da entrada no Rollup (único).
 * @property {string} html  Caminho do HTML relativo a app/ — é também o endereço publicado.
 */

/** @type {PageDef[]} */
export const PAGES = [
  { name: "hub", html: "index.html" },
  { name: "imperio-de-jade-ficha", html: "imperio-de-jade/ficha.html" },
  { name: "imperio-de-jade-gerador", html: "imperio-de-jade/gerador.html" },
  { name: "setimo-mar", html: "setimo-mar/index.html" },
  { name: "ordem-paranormal-ficha", html: "ordem-paranormal/ficha.html" },
];

/**
 * Tudo o que o build escreve na raiz do repositório (e que o clean-site
 * apaga antes de um novo build). Nunca inclua app/, docs/ ou README.md.
 * @type {string[]}
 */
export const BUILD_OUTPUTS = [
  "index.html",
  "assets",
  "favicon.ico",
  ".nojekyll",
  ...new Set(PAGES.map((p) => p.html.split("/")[0]).filter((top) => top !== "index.html")),
];
