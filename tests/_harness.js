// Carrega os módulos do builder sob stubs de browser e devolve o escopo global.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function makeStubs() {
  const store = {};
  const el = () => ({ innerHTML: "", style: {}, value: "", textContent: "",
    classList: { add(){}, remove(){}, toggle(){} }, appendChild(){}, remove(){},
    click(){}, setAttribute(){}, querySelectorAll: () => [], scrollIntoView(){} });
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  };
  sandbox.document = {
    addEventListener(){}, getElementById: () => null,
    querySelector: () => null, querySelectorAll: () => [],
    createElement: () => el(), body: el(),
  };
  sandbox.confirm = () => true;
  sandbox.alert = () => {};
  sandbox.URL = { createObjectURL: () => "blob:x", revokeObjectURL(){} };
  sandbox.Blob = class {};
  sandbox.FileReader = class {};
  sandbox.console = console;
  sandbox._store = store;
  return sandbox;
}

function loadSM(files, presetStore) {
  const sandbox = makeStubs();
  if (presetStore) Object.assign(sandbox._store, presetStore);
  vm.createContext(sandbox);
  const root = path.join(__dirname, "..");
  for (const f of files) {
    const code = fs.readFileSync(path.join(root, f), "utf8");
    vm.runInContext(code, sandbox, { filename: f });
  }
  // `let`/`const` de nível superior não viram propriedades do objeto sandbox
  // (só `var`/`function` viram). Reexpõe `SM` explicitamente para os testes.
  sandbox.SM = vm.runInContext("typeof SM !== 'undefined' ? SM : undefined", sandbox);
  return sandbox;
}

// mini-assert
let pass = 0, fail = 0;
function eq(name, a, b) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) pass++;
  else { fail++; console.log(`FAIL ${name}: esperado ${B}, obteve ${A}`); }
}
function ok(name, cond) { eq(name, !!cond, true); }
function report() {
  console.log(`\n=== ${pass} passaram, ${fail} falharam ===`);
  process.exit(fail ? 1 : 0);
}

module.exports = { loadSM, eq, ok, report };
