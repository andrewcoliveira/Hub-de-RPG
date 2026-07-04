# Ficha de 7º Mar — Migração React + Tailwind — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a UI da ficha de 7º Mar como um app **Vite + React + TypeScript + Tailwind** temável, reaproveitando um núcleo de regras puro e testado, com paridade funcional com a v2 vanilla antes de remover a versão antiga.

**Architecture:** Sub-app Vite isolado em `setimo-mar-app/` (Império de Jade fica vanilla e intocado). Núcleo puro TS (`src/engine`) sem React, testado em Vitest. Store Zustand (`src/store`) com `persist` na chave `setimoMar.ficha.v2`. UI React com Tailwind lendo tokens CSS dirigidos por `data-theme` (claro/escuro) e `data-nation` (acento). Build → `setimo-mar/` (dist commitado) que o hub `index.html` linka.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, Zustand, Vitest, @testing-library/react, jsdom.

## Global Constraints

- Stack fixa: Vite + React 18 + TypeScript + Tailwind + Zustand; testes em Vitest + @testing-library/react (jsdom). — spec §2.
- Sub-app em `setimo-mar-app/`; NÃO tocar em `index.html` de Império de Jade além do card do 7º Mar; NÃO tocar `ficha.html`, `gerador.html`, `styles.css`, `scripts/` (exceto remover `scripts/setimo-mar/*` na fase final). — spec §4.1, §9.
- Persistência: `localStorage`, chave `setimoMar.ficha.v2`, `schemaVersion: 2`, migração do v1; compatível com fichas salvas na v2 vanilla. — spec §7.
- Núcleo `src/engine/` é puro (sem import de React/DOM) e 100% testável. — spec §4.2.
- Temas: tokens CSS via `data-theme="light|dark"` e `data-nation="<nação>"`; Tailwind consome os tokens como cores semânticas (`surface, surface-2, ink, ink-soft, line, accent, accent-ink`). — spec §5.
- Build com `base: './'`; dist em `setimo-mar/` **commitado**. — spec §8.
- Remoção dos arquivos vanilla do 7º Mar SÓ após paridade verificada. — spec §8.
- Paridade = todos os blocos da v2 + modo Jogo + Revisão + export/import/imprimir + temas. — spec §9.
- Tudo em português (rótulos), presente de 1668 no conteúdo. Dados curados permanecem curados.
- **Commits são feitos pelo usuário**: nos passos "Commit", entregue o comando; não commite.
- Fonte de verdade dos DADOS e da LÓGICA a portar: os arquivos vanilla existentes em `scripts/setimo-mar/*.js` (data-core, data-sorcery, data-dueling, data-stories, data-societies, state, create, play). Portar = transcrever com tipos, sem mudar valores/regras.

---

## File Structure

```
setimo-mar-app/
  package.json  vite.config.ts  tsconfig.json  tsconfig.node.json
  tailwind.config.ts  postcss.config.js  index.html  .gitignore
  vitest.setup.ts
  src/
    main.tsx  App.tsx  index.css
    engine/
      types.ts
      data/traits.ts skills.ts nations.ts backgrounds.ts advantages.ts
           arcana.ts sorcery.ts dueling.ts stories.ts societies.ts index.ts
      creation.ts        (constantes de orçamento)
      derive.ts          (funções puras derivadas)
      migrate.ts         (defaultFicha, mergeDefaults, loadFrom)
      index.ts
    store/ficha.ts
    theme/tokens.css themes.ts ThemeProvider.tsx
    components/ Card.tsx Stepper.tsx PillToggle.tsx Budget.tsx TagChip.tsx Field.tsx
    views/
      TopBar.tsx
      creation/CreationView.tsx TabBar.tsx TabNav.tsx
        steps/ConceptNationStep.tsx TraitsStep.tsx BackgroundsStep.tsx SkillsStep.tsx
              AdvantagesStep.tsx ArcanaStep.tsx SorceryStep.tsx DuelingStep.tsx
              StoriesStep.tsx SocietyStep.tsx FinalTouchesStep.tsx ReviewStep.tsx
      play/PlayView.tsx Trackers.tsx StoriesTracker.tsx
      SheetSummary.tsx
    lib/persistIO.ts   (export/import/print helpers)
  tests/
    engine/data.test.ts derive.test.ts migrate.test.ts
    store/ficha.test.ts
    components/*.test.tsx
setimo-mar/            (dist buildado — commitado; criado no build)
index.html            (só o card do 7º Mar muda, na fase final)
```

**Interface global compartilhada:** o núcleo exporta tudo por `src/engine/index.ts`. A store por `src/store/ficha.ts` (`useFicha`, hooks derivados). Componentes importam via caminhos `@/…` (alias configurado no Vite/TS).

---

## Task 1: Scaffold do app (Vite + React + TS + Tailwind + Vitest)

**Files:**
- Create: `setimo-mar-app/package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.gitignore`, `vitest.setup.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Test: `setimo-mar-app/tests/smoke.test.ts`

**Interfaces:**
- Produces: um app que roda (`npm run dev`), builda (`npm run build` → `../setimo-mar/`) e testa (`npm run test`). Alias `@` → `src`.

- [ ] **Step 1: Escrever teste de smoke (falhará por falta de deps)**

`setimo-mar-app/tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => {
  it("soma", () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 2: Criar os arquivos de configuração**

`package.json`:
```json
{
  "name": "setimo-mar-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.3",
    "vitest": "^2.0.5"
  }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { outDir: "../setimo-mar", emptyOutDir: true },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext",
    "skipLibCheck": true, "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true, "noEmit": true,
    "jsx": "react-jsx", "strict": true, "noUnusedLocals": true,
    "noUnusedParameters": true, "noFallthroughCasesInSwitch": true,
    "baseUrl": ".", "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests", "vitest.setup.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{ "compilerOptions": { "composite": true, "skipLibCheck": true, "module": "ESNext", "moduleResolution": "bundler", "allowSyntheticDefaultImports": true }, "include": ["vite.config.ts", "tailwind.config.ts"] }
```

`postcss.config.js`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)", "surface-2": "var(--surface-2)",
        ink: "var(--ink)", "ink-soft": "var(--ink-soft)", line: "var(--line)",
        accent: "var(--accent)", "accent-ink": "var(--accent-ink)",
      },
      fontFamily: { serif: ["Georgia", "serif"], sans: ["system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`.gitignore`:
```
node_modules/
dist/
```

`index.html`:
```html
<!doctype html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Criador de Fichas — 7º Mar</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/App.tsx`:
```tsx
export default function App() {
  return <div className="min-h-screen bg-surface text-ink p-6">7º Mar — em construção</div>;
}
```

`src/main.tsx`:
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme/tokens.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
```
Nota: `theme/tokens.css` é criado na Task 6; até lá, crie um `src/theme/tokens.css` vazio com apenas `:root{--surface:#f4ecd8;--surface-2:#efe3c6;--ink:#2c2117;--ink-soft:#5b4a38;--line:#d8c79e;--accent:#b6862f;--accent-ink:#20160a;}` para o app subir.

- [ ] **Step 3: Instalar e rodar os testes**

```bash
cd setimo-mar-app && npm install
npm run test
```
Expected: `smoke.test.ts` passa (1 passed). `npm run build` gera `../setimo-mar/index.html`.

- [ ] **Step 4: Commit (rode você mesmo)**
```bash
git add setimo-mar-app/ .gitignore
git commit -m "chore(setimo-mar): scaffold Vite + React + TS + Tailwind + Vitest"
```

---

## Task 2: Núcleo — tipos e dados portados

**Files:**
- Create: `src/engine/types.ts`, `src/engine/creation.ts`, `src/engine/data/*.ts`, `src/engine/data/index.ts`, `src/engine/index.ts`
- Test: `tests/engine/data.test.ts`

**Interfaces:**
- Produces: tipos `Ficha, TraitKey, SkillKey, NationKey, SchoolKey` e os dados `TRAITS, SKILLS, NATIONS, BACKGROUNDS, ADVANTAGES, ARCANA, SORCERY, DUELING_STYLES, MANEUVERS, STORY_PRESETS, SOCIETIES, CREATION`. Reexportados por `src/engine/index.ts`.

- [ ] **Step 1: Teste de integridade dos dados**

`tests/engine/data.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { TRAITS, SKILLS, NATIONS, SORCERY, SOCIETIES, DUELING_STYLES, MANEUVERS, STORY_PRESETS, ADVANTAGES } from "@/engine";

describe("dados portados", () => {
  it("5 atributos, 16 perícias", () => { expect(TRAITS).toHaveLength(5); expect(SKILLS).toHaveLength(16); });
  it("10 nações", () => { expect(Object.keys(NATIONS)).toHaveLength(10); });
  it("feitiçarias incluem laerdom (Vesten)", () => { expect(SORCERY.laerdom).toBeTruthy(); expect(SORCERY.glamour.menores.length).toBeGreaterThan(0); });
  it("10 sociedades; novusOrdo heroisNao", () => { expect(Object.keys(SOCIETIES)).toHaveLength(10); expect(SOCIETIES.novusOrdo.heroisNao).toBe(true); });
  it("12 estilos de duelo, 6 manobras", () => { expect(Object.keys(DUELING_STYLES).length).toBeGreaterThanOrEqual(12); expect(MANEUVERS.length).toBeGreaterThanOrEqual(6); });
  it("8 pontos de partida com vendeta", () => { expect(Object.keys(STORY_PRESETS)).toHaveLength(8); expect(STORY_PRESETS.vendeta).toBeTruthy(); });
  it("vantagem feiticaria e academiaduelista existem", () => { expect(ADVANTAGES.feiticaria).toBeTruthy(); expect(ADVANTAGES.academiaduelista).toBeTruthy(); });
});
```

- [ ] **Step 2: Rodar e ver FALHAR** — `npm run test tests/engine/data.test.ts` → módulo inexistente.

- [ ] **Step 3: Escrever tipos e portar os dados**

`src/engine/types.ts` — defina os tipos do domínio. Base:
```ts
export type TraitKey = "vigor" | "finesse" | "determinacao" | "argucia" | "panache";
export type SkillKey = string; // chaves de SKILLS
export type NationKey = "avalon"|"castilha"|"sarmacia"|"eisen"|"inismore"|"montaigne"|"terrasaltas"|"ussura"|"vesten"|"vodacce";
export type SchoolKey = "glamour"|"hexenwerk"|"condao"|"porte"|"sanderis"|"sortilegio"|"laerdom";

export interface Ficha {
  schemaVersion: 2;
  concept: { name: string; player: string; concept: string; religion: string };
  nation: NationKey | null;
  nationTrait: TraitKey | null;
  traits: Record<TraitKey, number>;
  backgrounds: string[];
  skills: Record<string, number>;
  advantages: string[];
  arcana: { virtude: string | null; hubris: string | null };
  sorcery: { school: SchoolKey | null; powers: string[] };
  dueling: { style: string | null };
  society: { key: string | null };
  stories: { nome: string; final: string; recompensa: string; passos: { texto: string; feito: boolean }[] }[];
  finalTouches: { reputacoes: string[]; idiomas: string[]; fortunaInicial: number };
  play: { ferimentos: number; ferimentosDramaticos: number; pontosHeroicos: number; fortuna: number; favor: number; notas: string };
}
```
`src/engine/creation.ts`: porte `SM_CREATION` de `scripts/setimo-mar/data-core.js` (valores idênticos), exportando `CREATION`.
`src/engine/data/*.ts`: porte cada objeto/array dos arquivos vanilla correspondentes, tipando as entradas. **Não altere valores.** Fonte:
- `traits.ts, skills.ts, nations.ts, backgrounds.ts, advantages.ts, arcana.ts` ← `scripts/setimo-mar/data-core.js` (`SM_TRAITS, SM_SKILLS, SM_NATIONS, SM_BACKGROUNDS, SM_ADVANTAGES, SM_ARCANA`).
- `sorcery.ts` ← `scripts/setimo-mar/data-sorcery.js` (`SM_SORCERY`, incluindo `laerdom`).
- `dueling.ts` ← `scripts/setimo-mar/data-dueling.js` (`SM_DUELING_STYLES, SM_MANEUVERS`).
- `stories.ts` ← `scripts/setimo-mar/data-stories.js` (`SM_STORY_PRESETS`).
- `societies.ts` ← `scripts/setimo-mar/data-societies.js` (`SM_SOCIETIES`, `novusOrdo.heroisNao`).
Exporte com os nomes novos (`TRAITS, SKILLS, NATIONS, BACKGROUNDS, ADVANTAGES, ARCANA, SORCERY, DUELING_STYLES, MANEUVERS, STORY_PRESETS, SOCIETIES`). `src/engine/data/index.ts` reexporta todos. `src/engine/index.ts` reexporta `./types`, `./creation`, `./data`, e (nas próximas tasks) `./derive`, `./migrate`.

- [ ] **Step 4: Rodar e ver PASSAR** — `npm run test tests/engine/data.test.ts`.

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/engine setimo-mar-app/tests/engine/data.test.ts
git commit -m "feat(setimo-mar): nucleo — tipos e dados portados (TS)"
```

---

## Task 3: Núcleo — derivações puras

**Files:** Create `src/engine/derive.ts`; Modify `src/engine/index.ts`; Test `tests/engine/derive.test.ts`.

**Interfaces:**
- Consumes: dados + tipos da Task 2.
- Produces (funções puras que recebem `Ficha` e retornam valores; NÃO mutam):
  `traitFinal(f,key), traitFreeLeft(f), skillBackgroundBonus(f,key), skillFinal(f,key), skillPointsLeft(f), freeAdvantages(f):Set<string>, advantagePointsLeft(f), temVantagem(f,key), temFeiticaria(f), temAcademiaDuelista(f), numIdiomas(f), fortunaPersiste(f), sorceryBudget(f):{maiores:number,menores:number}, powerRank(f,key):"maior"|"menor"|null, tabComplete(f,tabId):boolean, completeness(f):string[]`.

- [ ] **Step 1: Testes de derivação (porte das asserções v2)**

`tests/engine/derive.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { defaultFicha } from "@/engine/migrate";
import * as D from "@/engine/derive";

function novo() { return defaultFicha(); }
describe("derivações", () => {
  it("orçamentos iniciais", () => { const f = novo(); expect(D.traitFreeLeft(f)).toBe(2); expect(D.skillPointsLeft(f)).toBe(10); expect(D.advantagePointsLeft(f)).toBe(5); });
  it("bônus de nação não gasta livre", () => { const f = novo(); f.nation = "avalon"; f.nationTrait = "finesse"; expect(D.traitFinal(f, "finesse")).toBe(3); expect(D.traitFreeLeft(f)).toBe(2); });
  it("formações empilham perícias", () => { const f = novo(); f.backgrounds = ["duelista", "soldado"]; expect(D.skillFinal(f, "armas")).toBe(2); });
  it("vantagens grátis das formações", () => { const f = novo(); f.backgrounds = ["duelista", "soldado"]; expect([...D.freeAdvantages(f)].sort()).toEqual(["esgrimista", "espiritovaloroso"]); });
  it("orçamento de feitiçaria", () => { const f = novo(); f.advantages = ["feiticaria"]; expect(D.sorceryBudget(f)).toEqual({ maiores: 1, menores: 2 }); });
  it("idiomas = argúcia; fortuna persiste com rico", () => { const f = novo(); f.nation = "vodacce"; f.nationTrait = "argucia"; expect(D.numIdiomas(f)).toBe(3); expect(D.fortunaPersiste(f)).toBe(false); f.advantages = ["rico"]; expect(D.fortunaPersiste(f)).toBe(true); });
  it("completeness lista faltas", () => { const f = novo(); expect(D.completeness(f).length).toBeGreaterThan(0); });
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**

- [ ] **Step 3: Implementar `derive.ts`** — porte a lógica das funções `sm*` de `scripts/setimo-mar/state.js` e `create.js` (as puras: derivados + `tabComplete`/`completeness`), agora recebendo `Ficha` como parâmetro (sem estado global). Mesma matemática. `CREATION` vem de `@/engine/creation`.

- [ ] **Step 4: Rodar e ver PASSAR.**

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/engine/derive.ts setimo-mar-app/src/engine/index.ts setimo-mar-app/tests/engine/derive.test.ts
git commit -m "feat(setimo-mar): nucleo — derivacoes puras"
```

---

## Task 4: Núcleo — defaults, merge e migração

**Files:** Create `src/engine/migrate.ts`; Modify `src/engine/index.ts`; Test `tests/engine/migrate.test.ts`.

**Interfaces:**
- Produces: `defaultFicha(): Ficha`, `mergeDefaults(data: unknown): Ficha` (merge PROFUNDO robusto a payload parcial — corrige o bug da v2: nunca perde sub-objetos), `loadFrom(getItem: (k:string)=>string|null): Ficha | null` (lê `setimoMar.ficha.v2`, senão migra `setimoMar.ficha.v1`).

- [ ] **Step 1: Testes de merge/migração**

`tests/engine/migrate.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { defaultFicha, mergeDefaults, loadFrom } from "@/engine/migrate";

describe("merge/migração", () => {
  it("defaultFicha tem schemaVersion 2 e sub-objetos", () => { const f = defaultFicha(); expect(f.schemaVersion).toBe(2); expect(f.play.pontosHeroicos).toBe(1); expect(f.stories.length).toBe(1); });
  it("mergeDefaults preenche sub-objetos vazios (bug v2)", () => {
    const m = mergeDefaults({ stories: [], play: {}, sorcery: {}, finalTouches: {} });
    expect(m.play.pontosHeroicos).toBe(1); expect(m.play.favor).toBe(2);
    expect(Array.isArray(m.sorcery.powers)).toBe(true); expect(m.stories.length).toBe(1);
  });
  it("migra v1 (sem campos v2)", () => {
    const store: Record<string,string> = { "setimoMar.ficha.v1": JSON.stringify({ concept:{name:"Velho"}, nation:"avalon", traits:{vigor:3,finesse:2,determinacao:2,argucia:2,panache:2} }) };
    const f = loadFrom(k => store[k] ?? null)!;
    expect(f.concept.name).toBe("Velho"); expect(f.nation).toBe("avalon"); expect(f.schemaVersion).toBe(2); expect(f.play.pontosHeroicos).toBe(1);
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**

- [ ] **Step 3: Implementar `migrate.ts`** — `defaultFicha()` retorna a `Ficha` inicial (idêntica ao `smDefaultState` da v2). `mergeDefaults(data)` faz merge profundo por sub-objeto (salve as referências dos defaults ANTES de copiar campos de topo; nunca `Object.assign` raso sobre os sub-objetos — este é o bug corrigido na v2). `loadFrom(getItem)` tenta `setimoMar.ficha.v2`, senão `setimoMar.ficha.v1`, aplicando `mergeDefaults`.

- [ ] **Step 4: Rodar e ver PASSAR.**

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/engine/migrate.ts setimo-mar-app/src/engine/index.ts setimo-mar-app/tests/engine/migrate.test.ts
git commit -m "feat(setimo-mar): nucleo — defaults, merge profundo e migracao"
```

---

## Task 5: Store Zustand (estado + ações + persistência)

**Files:** Create `src/store/ficha.ts`; Test `tests/store/ficha.test.ts`.

**Interfaces:**
- Consumes: engine (dados, derive, migrate).
- Produces: `useFicha` (hook Zustand) com `state.f: Ficha`, `state.mode`, `state.activeTab`, `state.theme`, e as ações (ver Global/§4.3 da spec). Ações relevantes com regras: `adjustTrait` (respeita `traitCreationMax` e `traitFreeLeft>0`), `adjustSkill` (0..`skillCreationMax`, `skillPointsLeft>0`), `toggleAdvantage` (respeita orçamento; grátis não custa), `toggleSorceryPower` (respeita `sorceryBudget` por rank), `setSociety` (guard `heroisNao`), `adjustWound`/`adjustHeroPoints`/`adjustFavor` (clamps: dramáticos 0..4, demais ≥0), `importFicha(json)` (usa `mergeDefaults`), `setSchool` (zera powers). Persist na chave `setimoMar.ficha.v2` (persiste só `f`). Todas as mutações são IMUTÁVEIS (retornam novo `f`).

- [ ] **Step 1: Testes da store**

`tests/store/ficha.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useFicha } from "@/store/ficha";
import { SORCERY } from "@/engine";

const s = () => useFicha.getState();
beforeEach(() => { s().reset(); });

describe("store", () => {
  it("adjustTrait respeita orçamento (2 livres)", () => {
    s().adjustTrait("vigor", 1); s().adjustTrait("vigor", 1);
    expect(s().f.traits.vigor).toBe(4);
    s().adjustTrait("argucia", 1); // sem pontos
    expect(s().f.traits.argucia).toBe(2);
  });
  it("toggleSorceryPower respeita o teto do orçamento", () => {
    s().selectNation("avalon"); s().toggleAdvantage("feiticaria"); s().setSchool("glamour");
    s().toggleSorceryPower(SORCERY.glamour.maiores[0].key);
    s().toggleSorceryPower(SORCERY.glamour.maiores[1].key); // 2º maior — orçamento é 1
    const chosenMaiores = s().f.sorcery.powers.filter(
      (k) => SORCERY.glamour.maiores.some((p) => p.key === k)
    ).length;
    expect(chosenMaiores).toBe(1);
  });
  it("setSociety bloqueia novusOrdo", () => { s().setSociety("novusOrdo"); expect(s().f.society.key).toBeNull(); s().setSociety("exploradores"); expect(s().f.society.key).toBe("exploradores"); });
  it("espiral clampa 0..4 e desamparado", () => { for (let i=0;i<6;i++) s().adjustWound("ferimentosDramaticos", 1); expect(s().f.play.ferimentosDramaticos).toBe(4); });
  it("pontos heroicos ≥ 0", () => { s().adjustHeroPoints(-5); expect(s().f.play.pontosHeroicos).toBe(0); });
  it("importFicha usa mergeDefaults", () => { s().importFicha({ concept:{name:"Imp"}, play:{} }); expect(s().f.concept.name).toBe("Imp"); expect(s().f.play.pontosHeroicos).toBe(1); });
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**

- [ ] **Step 3: Implementar `store/ficha.ts`** com `create` + `persist` do Zustand. Estado inicial: `{ f: defaultFicha(), mode:"criar", activeTab:"conceito", theme: prefereEscuro()?"dark":"light" }`. Cada ação usa `set(state => ({ f: novoF }))`, computando `novoF` imutavelmente e reusando as regras de `derive` para os limites. Reaproveite a lógica de cada `sm*` da v2 (`create.js`/`play.js`), agora imutável e tipada. `persist` com `partialize: s => ({ f: s.f })`, `name: "setimoMar.ficha.v2"`, `version: 2`, `migrate: (persisted) => ({ f: mergeDefaults((persisted as any)?.f ?? persisted) })`, e `onRehydrateStorage`/merge que também tenta `loadFrom` do v1 na primeira carga (se `v2` ausente).

- [ ] **Step 4: Rodar e ver PASSAR.**

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/store setimo-mar-app/tests/store
git commit -m "feat(setimo-mar): store Zustand + persistencia"
```

---

## Task 6: Sistema de temas (tokens + ThemeProvider + acentos)

**Files:** Create `src/theme/tokens.css`, `src/theme/themes.ts`, `src/theme/ThemeProvider.tsx`; Modify `src/main.tsx` (já importa tokens.css); Test `tests/components/theme.test.tsx`.

**Interfaces:**
- Produces: `ThemeProvider` (aplica `data-theme` e `data-nation` no `<html>`); `NATION_ACCENTS: Record<NationKey,{accent:string,accentInk:string}>`. Lê `theme`/`f.nation` da store.

- [ ] **Step 1: Teste do ThemeProvider (RTL)**

`tests/components/theme.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { useFicha } from "@/store/ficha";

beforeEach(() => useFicha.getState().reset());
describe("tema", () => {
  it("aplica data-theme e data-nation no html", () => {
    useFicha.getState().setTheme("dark");
    useFicha.getState().selectNation("vodacce");
    render(<ThemeProvider><div /></ThemeProvider>);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-nation")).toBe("vodacce");
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**

- [ ] **Step 3: Implementar tokens + provider**

`src/theme/tokens.css` — paleta neutra por tema + acento default, e um bloco de acento por nação:
```css
:root { --surface:#f4ecd8; --surface-2:#efe3c6; --ink:#2c2117; --ink-soft:#5b4a38; --line:#d8c79e; --accent:#b6862f; --accent-ink:#20160a; }
[data-theme="dark"] { --surface:#0d2436; --surface-2:#123049; --ink:#eadfc6; --ink-soft:#b8a882; --line:#284a63; --accent:#d8b45a; --accent-ink:#20160a; }
/* acentos por nação — um por nação; complete as 10 curando da identidade de cada uma */
[data-nation="avalon"]{--accent:#2c7a7b;--accent-ink:#eafcfb}
[data-nation="castilha"]{--accent:#a3341f;--accent-ink:#ffe9e2}
[data-nation="sarmacia"]{--accent:#b0872f;--accent-ink:#241a06}
[data-nation="eisen"]{--accent:#6b6f76;--accent-ink:#f2f3f5}
[data-nation="inismore"]{--accent:#2f7d4f;--accent-ink:#e8fbef}
[data-nation="montaigne"]{--accent:#3f5fb0;--accent-ink:#eaefff}
[data-nation="terrasaltas"]{--accent:#5a6e3a;--accent-ink:#f0f5e4}
[data-nation="ussura"]{--accent:#4a7fa5;--accent-ink:#eaf4fb}
[data-nation="vesten"]{--accent:#7a5aa0;--accent-ink:#f3ecff}
[data-nation="vodacce"]{--accent:#8c2f57;--accent-ink:#ffe9f1}
```

`src/theme/themes.ts`: exporte `NATION_ACCENTS` (documentando os hex por nação — a mesma fonte de verdade do CSS acima; pode ser usado por testes/legendas).

`src/theme/ThemeProvider.tsx`:
```tsx
import { useEffect, type ReactNode } from "react";
import { useFicha } from "@/store/ficha";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useFicha(s => s.theme);
  const nation = useFicha(s => s.f.nation);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => {
    if (nation) document.documentElement.setAttribute("data-nation", nation);
    else document.documentElement.removeAttribute("data-nation");
  }, [nation]);
  return <>{children}</>;
}
```

- [ ] **Step 4: Rodar e ver PASSAR.**

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/theme setimo-mar-app/tests/components/theme.test.tsx
git commit -m "feat(setimo-mar): sistema de temas (claro/escuro + acento por nacao)"
```

---

## Task 7: Shell — App, TopBar, abas e navegação

**Files:** Create `src/components/{Card,PillToggle,Budget}.tsx`, `src/views/TopBar.tsx`, `src/views/creation/{CreationView,TabBar,TabNav}.tsx`; Modify `src/App.tsx`; Test `tests/components/tabs.test.tsx`.

**Interfaces:**
- Produces: `App` que envolve tudo em `ThemeProvider`, mostra `TopBar` + (mode==="criar" ? `CreationView` : `PlayView`). `TabBar` lê `visibleTabs`/`activeTab`; `CreationView` renderiza o `Step*` da aba ativa. `TAB_DEFS: {id,label,cond?}[]` (mesma ordem da v2). Componentes `Card`, `PillToggle`, `Budget` reutilizáveis.

- [ ] **Step 1: Teste de navegação/abas condicionais (RTL)**

`tests/components/tabs.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "@/App";
import { useFicha } from "@/store/ficha";

beforeEach(() => useFicha.getState().reset());
describe("abas", () => {
  it("aba Feitiçaria aparece só após comprar a Vantagem", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: /Feitiçaria/i })).toBeNull();
    useFicha.getState().selectNation("avalon");
    useFicha.getState().toggleAdvantage("feiticaria");
    expect(screen.getByRole("button", { name: /Feitiçaria/i })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**

- [ ] **Step 3: Implementar shell + componentes.** `PlayView` e os `Step*` ainda não existem — use um placeholder `<div/>` para os que faltam (serão preenchidos nas Tasks 8-14; importe cada `Step*` conforme criado, ou renderize um mapa `tabId → componente` com fallback `<div>Em construção</div>`). `TAB_DEFS` com `cond` usando `temFeiticaria`/`temAcademiaDuelista` da store/derive. `TabBar` mostra `label` + ✓ (via `tabComplete`) e destaca a ativa; clique chama `goTab`. `TopBar`: `PillToggle` de modo, toggle de tema (`setTheme`), botões export/import/print/reset (podem chamar handlers stub por ora; implementados na Task 15).

- [ ] **Step 4: Rodar e ver PASSAR.**

- [ ] **Step 5: Commit**
```bash
git add setimo-mar-app/src/components setimo-mar-app/src/views/TopBar.tsx setimo-mar-app/src/views/creation setimo-mar-app/src/App.tsx setimo-mar-app/tests/components/tabs.test.tsx
git commit -m "feat(setimo-mar): shell — App, TopBar, abas e navegacao"
```

---

## Task 8: Etapas Conceito·Nação e Atributos

**Files:** Create `src/components/{Stepper,Field}.tsx`, `src/views/creation/steps/{ConceptNationStep,TraitsStep}.tsx`; Test `tests/components/traits.test.tsx`.

**Interfaces:** Consome store + `NATIONS`/`TRAITS`. Produz os dois primeiros `Step*`. `Stepper` (props: `value, onDec, onInc, decDisabled, incDisabled`), `Field` (label + input controlado).

- [ ] **Step 1: Teste** — `tests/components/traits.test.tsx`: renderiza `TraitsStep`; clicar "+ Vigor" duas vezes leva Vigor a 4 e desabilita o "+" (orçamento 2). Selecionar nação em `ConceptNationStep` aplica `data-nation`.
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TraitsStep } from "@/views/creation/steps/TraitsStep";
import { useFicha } from "@/store/ficha";
beforeEach(() => useFicha.getState().reset());
it("stepper de atributo respeita orçamento", () => {
  render(<TraitsStep />);
  const linha = screen.getByTestId("trait-vigor");
  const mais = within(linha).getByRole("button", { name: "+" });
  fireEvent.click(mais); fireEvent.click(mais);
  expect(within(linha).getByTestId("trait-vigor-val").textContent).toBe("4");
  expect(mais).toBeDisabled();
});
```

- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `ConceptNationStep` (inputs de nome/jogador/conceito/religião via `setConcept`; grid de nações via `selectNation`; pílulas do +1 de Nação via `setNationTrait`) e `TraitsStep` (5 linhas com `Stepper`, `data-testid="trait-<key>"` e `-val`; barra de `Budget` com `traitFreeLeft`). Use classes Tailwind semânticas (`bg-surface text-ink border-line`, ativo `ring-2 ring-accent`).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapas Conceito-Nacao e Atributos"`

---

## Task 9: Etapas Formações e Perícias

**Files:** Create `src/views/creation/steps/{BackgroundsStep,SkillsStep}.tsx`; Test `tests/components/skills.test.tsx`.

- [ ] **Step 1: Teste** — escolher 2 formações desabilita as demais; `SkillsStep` mostra Grau final = pontos + bônus de formação; "+" desabilita ao zerar o orçamento (10). (Asserções concretas via testids `bg-<key>`, `skill-<key>-final`.)
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `BackgroundsStep` (cards `toggleBackground`, contador `x/2`, desabilita ao atingir 2) e `SkillsStep` (16 linhas `Stepper` + bônus de formação exibido + `Budget` com `skillPointsLeft`).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapas Formacoes e Pericias"`

---

## Task 10: Etapas Vantagens e Arcanos

**Files:** Create `src/views/creation/steps/{AdvantagesStep,ArcanaStep}.tsx`, `src/components/TagChip.tsx`; Test `tests/components/advantages.test.tsx`.

- [ ] **Step 1: Teste** — comprar `contato`(2)+`rico`(3) zera o orçamento (5) e desabilita uma vantagem de 4; grátis das formações aparecem marcadas sem custo; em `ArcanaStep`, escolher a mesma carta como Virtude e Húbris é bloqueado.
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `AdvantagesStep` (grid `toggleAdvantage`, mostra custo/`grátis`, `Budget` com `advantagePointsLeft`, desabilita as que não cabem) e `ArcanaStep` (duas grades Virtude/Húbris via `setArcana`, desabilita a carta já usada no outro lado).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapas Vantagens e Arcanos"`

---

## Task 11: Etapas Feitiçaria e Duelo (condicionais)

**Files:** Create `src/views/creation/steps/{SorceryStep,DuelingStep}.tsx`; Test `tests/components/sorcery.test.tsx`.

- [ ] **Step 1: Teste** — sem a Vantagem, `SorceryStep` mostra o aviso de bloqueio; com `feiticaria`+escola `glamour`, selecionar um 2º Maior é bloqueado (orçamento 1); `DuelingStep` seleciona um estilo e mostra as manobras.
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `SorceryStep` (pílulas de escola via `setSchool`; grades de Maiores/Menores via `toggleSorceryPower`; hint do orçamento) e `DuelingStep` (grade de estilos via `setStyle`; lista de `MANEUVERS`). Ambas mostram aviso quando `!temFeiticaria`/`!temAcademiaDuelista`.
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapas Feiticaria e Duelo"`

---

## Task 12: Etapas Histórias, Sociedade e Toques Finais

**Files:** Create `src/views/creation/steps/{StoriesStep,SocietyStep,FinalTouchesStep}.tsx`; Test `tests/components/final.test.tsx`.

- [ ] **Step 1: Teste** — aplicar preset `vendeta` preenche Final e cria 1 passo; adicionar/alternar passo funciona; `SocietyStep` não seleciona `novusOrdo`; `FinalTouchesStep` mostra idiomas `x / Argúcia` e ignora reputação só-espaço.
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** os três `Step*` chamando as ações da store (`applyStoryPreset,setStoryField,addStoryStep,toggleStoryStep`; `setSociety`; `addReputacao/addIdioma/remove*/setFortunaInicial`).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapas Historias, Sociedade e Toques Finais"`

---

## Task 13: Revisão (SheetSummary)

**Files:** Create `src/views/SheetSummary.tsx`, `src/views/creation/steps/ReviewStep.tsx`; Test `tests/components/summary.test.tsx`.

**Interfaces:** `SheetSummary` recebe `f: Ficha` e renderiza o resumo completo (blocos v1 + Feitiçaria/Duelo/História/Sociedade/Toques quando houver dado). Reutilizado no modo Jogo/impressão.

- [ ] **Step 1: Teste** — montar personagem completo (nação, feitiçaria+poder, estilo, preset vendeta, sociedade, reputação) e afirmar que o texto renderizado inclui os rótulos reais (ex.: "Glamour"/"Porté", "Valroux", "Vendeta", a sociedade, "Honrado"). Use `render(<SheetSummary f={useFicha.getState().f} />)`.
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `SheetSummary` (blocos condicionais; resolve nomes de poder via `SORCERY[school].maiores/menores`) e `ReviewStep` (checklist de `completeness`; botão "Ver Ficha Completa" que revela `<SheetSummary>`).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): etapa de Revisao (SheetSummary)"`

---

## Task 14: Modo Jogo (ficha viva)

**Files:** Create `src/views/play/{PlayView,Trackers,StoriesTracker}.tsx`; Modify `src/App.tsx` (renderiza `PlayView` quando `mode==="jogo"`); Test `tests/components/play.test.tsx`.

- [ ] **Step 1: Teste** — em `PlayView`: incrementar Espiral 5× fixa em 4 e exibe "Desamparado"; decrementar Pontos Heroicos não passa de 0; avançar um passo de História marca `feito`.
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `PlayView` (header + atributos/perícias somente-leitura reusando pedaços do `SheetSummary` ou componentes próprios; `Trackers` com `adjustWound/adjustHeroPoints/adjustFavor/setFortuna` e o texto da Espiral (`SPIRAL[dram]`); `StoriesTracker` com `toggleStoryStep/addStoryStep`; `Notes` com `setNotas`).
- [ ] **Step 4: Rodar e ver PASSAR.**
- [ ] **Step 5: Commit** — `git commit -m "feat(setimo-mar): modo Jogo (ficha viva)"`

---

## Task 15: Export/Import/Imprimir, build, integração com o hub e remoção da versão vanilla

**Files:** Create `src/lib/persistIO.ts`; Modify `src/views/TopBar.tsx` (liga os botões), `index.html` (card do 7º Mar); Delete `setimo-mar.html`, `styles-setimo-mar.css`, `scripts/setimo-mar/*`, `tests/rules.test.js`, `tests/wiring.js`; Test `tests/store/io.test.ts`.

**Interfaces:** `exportFicha(f)` (baixa `.json`), `importFichaFromFile(file, onLoaded)` (lê e chama `store.importFicha`), `printSheet()` (window.print com CSS de impressão). CSS de impressão em `index.css` (`@media print`) mostrando só a ficha.

- [ ] **Step 1: Teste** — `tests/store/io.test.ts`: `JSON.parse(JSON.stringify(f))` passado por `importFicha` reproduz a ficha (round-trip). (Não testa File; testa a serialização + `mergeDefaults`.)
- [ ] **Step 2: Rodar e ver FALHAR.**
- [ ] **Step 3: Implementar** `persistIO.ts`; ligar os botões da `TopBar`; adicionar `@media print` em `index.css`.
- [ ] **Step 4: Rodar TODA a suíte + build** — `npm run test` (tudo verde) e `npm run build` (gera `../setimo-mar/`).
- [ ] **Step 5: Verificar PARIDADE no navegador** — `npm run preview` (ou servir `setimo-mar/`): percorrer todas as abas, condicionais, modo Jogo, tema claro/escuro, acento por nação, export/import/imprimir, e recarregar (persistência). Screenshot de evidência. NÃO prosseguir sem paridade.
- [ ] **Step 6: Integrar o hub e remover a versão vanilla** — em `index.html` (Império de Jade), trocar o `href` do card do 7º Mar de `setimo-mar.html` para `setimo-mar/index.html`. Remover `setimo-mar.html`, `styles-setimo-mar.css`, `scripts/setimo-mar/`, `tests/rules.test.js`, `tests/wiring.js`.
- [ ] **Step 7: Commit** — 
```bash
git add setimo-mar-app/ setimo-mar/ index.html
git rm setimo-mar.html styles-setimo-mar.css -r scripts/setimo-mar tests/rules.test.js tests/wiring.js
git commit -m "feat(setimo-mar): export/import/print, build, integra hub e remove versao vanilla"
```

---

## Self-Review (preenchido)

**Cobertura da spec:** §4.1 estrutura → Tasks 1,15. §4.2 núcleo → Tasks 2-4. §4.3 store → Task 5. §4.4 componentes/views → Tasks 7-14. §5 temas → Task 6. §6 testes → todas as tasks (Vitest). §7 compat/migração → Tasks 4,5,15. §8 build/rollout/remoção → Task 15. §9 escopo/paridade → Task 15 (gate de paridade antes de remover). Nenhum requisito sem tarefa.

**Placeholders:** os dados (`data/*.ts`) são PORTE de arquivos existentes no repo (fonte apontada por caminho e nome de símbolo) — conteúdo determinado, não "TODO". Os acentos por nação (Task 6) têm 2 exemplos completos + instrução explícita de completar as 10 curando da identidade de cada nação (o placeholder `#2c4considerar` está marcado para substituição). Componentes das Tasks 9-14 dão interfaces + ações da store + testids concretos; a Task 8 traz o padrão completo de Stepper/Field a espelhar.

**Consistência de tipos:** nomes de ação estáveis entre store (Task 5) e componentes (Tasks 7-14); `sorceryBudget → {maiores,menores}` usado consistentemente; `Ficha` (Task 2) é a forma persistida (Tasks 4,5) e consumida (todas). Chave `setimoMar.ficha.v2` idêntica em migrate/store/spec.
