// ══════════════════════════════════════════════════════════════════
//  7º MAR — Check estático de fiação (Node puro, sem deps externas)
//  Lê setimo-mar.html + scripts/setimo-mar/*.js e verifica:
//   (a) IDs referenciados por getElementById que não existem no HTML
//       nem são criados dinamicamente (allowlist abaixo).
//   (b) Handlers onclick/oninput/onchange (do HTML e dos template
//       strings dos renderizadores JS) cujo nome de função não está
//       definido em nenhum .js nem exposto via Object.assign(window,{...}).
// ══════════════════════════════════════════════════════════════════
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML_FILE = path.join(ROOT, "setimo-mar.html");
const SCRIPTS_DIR = path.join(ROOT, "scripts", "setimo-mar");

// IDs que não existem estaticamente no HTML, mas são criados/usados em
// tempo de execução via innerHTML de algum renderizador, ou são
// puramente dinâmicos (montados por template string com `${...}` no nome).
const DYNAMIC_ID_ALLOWLIST = new Set([
  "sm-print-area",
  "sm-new-step",
  "sm-rep-in",
  "sm-idi-in",
  "sm-sorcery",
  "sm-dueling",
  "sm-stories",
  "sm-societies",
  "sm-toques",
  "sm-summary",
]);

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function listJsFiles() {
  return fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith(".js"))
    .map(f => path.join(SCRIPTS_DIR, f));
}

// ── extração ──────────────────────────────────────────────────────
function extractHtmlIds(html) {
  const ids = new Set();
  const re = /\bid=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  return ids;
}

// Extrai o nome de função de um atributo de handler cujo valor começa
// com o nome da função seguido de "(". Ignora templates cujo nome de
// função é dinâmico (ex.: `${rm}(...)` ou variável interpolada).
function extractHandlerCalls(text) {
  const calls = [];
  // onclick="fn(...)"  |  onclick='fn(...)'  |  onclick=`fn(...)` (dentro de template strings JS)
  const re = /\bon(?:click|input|change)\s*=\s*["'`]([^"'`]*)["'`]/g;
  let m;
  while ((m = re.exec(text))) {
    const body = m[1].trim();
    // um handler pode ter múltiplas instruções separadas por ";"
    // (ex.: "renderSummary(); document.getElementById('sm-summary').scrollIntoView(...)").
    // Para cada instrução, só nos interessa a chamada de função no INÍCIO da instrução
    // (ex.: "renderSummary(") — chamadas encadeadas em métodos (ex.: "document.getElementById(")
    // não são "handlers" no sentido desta checagem, então são ignoradas.
    body.split(";").forEach(stmt => {
      const s = stmt.trim();
      const fnMatch = s.match(/^([A-Za-z_$][\w$]*)\s*\(/);
      if (fnMatch) calls.push(fnMatch[1]);
    });
  }
  return calls;
}

// Detecta handlers com nome de função interpolado dinamicamente, ex.:
// onclick="${rm}(${i})" dentro de um template string (chips() em create.js,
// que recebe o nome da função como argumento literal, ex.: chips(arr,'smRemoveReputacao')).
// Quando encontramos esse padrão em algum handler, coletamos todos os literais
// de string que parecem nomes de função "sm*" usados como argumento em QUALQUER
// chamada no arquivo — são os candidatos a nome real do handler dinâmico — e
// validamos que cada um está definido, para não deixar passar um typo silencioso.
function hasInterpolatedHandlerName(text) {
  return /\bon(?:click|input|change)\s*=\s*["'`]\$\{[A-Za-z_$][\w$]*\}\s*\(/.test(text);
}
function extractInterpolatedHandlerNameLiterals(text) {
  const names = new Set();
  // convenção do projeto: funções de ação/render são "sm" + PascalCase (ex.: smRemoveReputacao).
  // Isso exclui palavras comuns como "smooth" (não seguido de maiúscula).
  const re = /['"`](sm[A-Z][A-Za-z0-9_$]*)['"`]/g;
  let m;
  while ((m = re.exec(text))) names.add(m[1]);
  return names;
}

function extractGetElementByIdIds(text) {
  const ids = new Set();
  const re = /getElementById\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  // getElementById com concatenação simples: getElementById("sm-arcana-" + type) — extraímos o prefixo
  const rePrefix = /getElementById\(\s*["'`]([^"'`]+)["'`]\s*\+/g;
  while ((m = rePrefix.exec(text))) ids.add(m[1] + "*"); // marca como prefixo dinâmico
  return ids;
}

function extractDefinedFunctions(text) {
  const names = new Set();
  const re = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(text))) names.add(m[1]);
  return names;
}

function extractWindowAssignedNames(text) {
  const names = new Set();
  // Object.assign(window, { a, b, c: d, ... }) — captura o bloco e os identificadores dentro dele
  const re = /Object\.assign\(\s*window\s*,\s*\{([\s\S]*?)\}\s*\)/g;
  let m;
  while ((m = re.exec(text))) {
    const body = m[1];
    // cada entrada é `nome` ou `nome: valor` — pegamos o identificador antes de ":" ou "," ou fim
    const entryRe = /([A-Za-z_$][\w$]*)\s*(?::\s*[A-Za-z_$][\w$]*)?\s*(?:,|$)/g;
    let e;
    while ((e = entryRe.exec(body))) names.add(e[1]);
  }
  return names;
}

// ── main ──────────────────────────────────────────────────────────
function main() {
  const html = readText(HTML_FILE);
  const jsFiles = listJsFiles();
  const jsTexts = jsFiles.map(readText);
  const allJsText = jsTexts.join("\n");

  // (a) IDs
  const htmlIds = extractHtmlIds(html);
  const gebIdsFromHtml = extractGetElementByIdIds(html); // não deveria ter, mas por precaução
  const gebIdsFromJs = extractGetElementByIdIds(allJsText);
  const allGebIds = new Set([...gebIdsFromHtml, ...gebIdsFromJs]);

  const missingIds = [];
  for (const id of allGebIds) {
    if (id.endsWith("*")) continue; // prefixo dinâmico (ex.: "sm-arcana-" + type) — não checável estaticamente
    if (htmlIds.has(id)) continue;
    if (DYNAMIC_ID_ALLOWLIST.has(id)) continue;
    missingIds.push(id);
  }

  // (b) handlers
  const handlerCallsHtml = extractHandlerCalls(html);
  const handlerCallsJs = extractHandlerCalls(allJsText);
  const allHandlerCalls = new Set([...handlerCallsHtml, ...handlerCallsJs]);

  const definedFns = extractDefinedFunctions(allJsText);
  const windowAssigned = extractWindowAssignedNames(allJsText);
  const knownNames = new Set([...definedFns, ...windowAssigned]);

  const missingHandlers = [];
  for (const name of allHandlerCalls) {
    if (knownNames.has(name)) continue;
    missingHandlers.push(name);
  }

  // handlers com nome de função interpolado dinamicamente (ex.: onclick="${rm}(${i})")
  if (hasInterpolatedHandlerName(allJsText)) {
    const literalCandidates = extractInterpolatedHandlerNameLiterals(allJsText);
    for (const name of literalCandidates) {
      if (knownNames.has(name)) continue;
      missingHandlers.push(`${name} (candidato a handler dinâmico via string literal)`);
    }
  }

  // reporta
  let ok = true;
  if (missingIds.length === 0) {
    console.log("IDs sem elemento: nenhum ✓");
  } else {
    ok = false;
    console.log("IDs sem elemento (getElementById sem correspondente no HTML nem na allowlist):");
    missingIds.sort().forEach(id => console.log(`  - ${id}`));
  }

  if (missingHandlers.length === 0) {
    console.log("Handlers sem função: nenhum ✓");
  } else {
    ok = false;
    console.log("Handlers onclick/oninput/onchange sem função definida:");
    missingHandlers.sort().forEach(name => console.log(`  - ${name}`));
  }

  if (!ok) {
    console.log("\n=== fiação com problemas ===");
    process.exit(1);
  } else {
    console.log("\n=== fiação limpa ===");
    process.exit(0);
  }
}

main();
