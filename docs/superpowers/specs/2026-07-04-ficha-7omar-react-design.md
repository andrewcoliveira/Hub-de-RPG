# Ficha de 7º Mar — Migração para React + Tailwind (design)

**Data:** 2026-07-04
**Branch:** `setimo-mar`
**Autor:** Arthur Pinto de Andrade (com Claude)
**Status:** aprovado no brainstorming; pronto para o plano de implementação.

## 1. Objetivo

Reescrever a interface do Criador de Fichas de 7º Mar em **React + TypeScript + Tailwind**, com um **redesign visual completo e temável** (claro/escuro + acento por nação), **reaproveitando o núcleo de regras** já implementado e testado na v2 vanilla. Meta = **paridade funcional** com a v2 + o novo sistema de temas.

## 2. Decisões (do brainstorming)

- **Stack:** Vite + React + TypeScript + Tailwind CSS.
- **Núcleo puro reusado:** dados e regras viram TS puro (sem React), testável isoladamente.
- **Estado:** Zustand (store fina) sobre o núcleo puro; persistência em `localStorage`.
- **Visual:** temável — modo claro/escuro + acento por nação; base na identidade náutico/barroca.
- **Sub-app isolado:** as páginas do Império de Jade (`index.html`, `ficha.html`, `gerador.html`) permanecem vanilla e intocadas.

## 3. Ponto de partida (v2 vanilla, já entregue)

- HTML/CSS/JS puro em `setimo-mar.html`, `styles-setimo-mar.css`, `scripts/setimo-mar/*` (data-core, data-sorcery, data-dueling, data-stories, data-societies, state, create, play, app).
- 65 testes de regras (`tests/rules.test.js`) + check de fiação (`tests/wiring.js`), verde; smoke de navegador ok.
- Persistência `localStorage` chave `setimoMar.ficha.v2` com migração do v1; export/import JSON; impressão.

## 4. Arquitetura

### 4.1 Estrutura do repositório
```
Hub-de-RPG/
  index.html, ficha.html, gerador.html, styles.css, ...   (Império de Jade — vanilla, INTOCADO)
  setimo-mar/                     (DIST buildado do app React — commitado; o hub linka aqui)
  setimo-mar-app/                 (projeto Vite/React/TS — código-fonte)
    package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, postcss.config.js, index.html
    src/
      main.tsx, App.tsx
      engine/                     (NÚCLEO PURO, sem React)
        types.ts
        data/{traits,skills,nations,backgrounds,advantages,arcana,sorcery,dueling,stories,societies}.ts
        derive.ts                 (orçamentos + derivados)
        migrate.ts                (smMergeDefaults + migração v1→v2)
        index.ts
      store/ficha.ts              (Zustand + persist)
      theme/{tokens.css, ThemeProvider.tsx, themes.ts}
      components/                 (UI: Card, Stepper, PillToggle, Budget, TagChip, Field, ...)
      views/creation/Step*.tsx, TabBar.tsx, TabNav.tsx, CreationView.tsx
      views/play/PlayView.tsx, Trackers.tsx, StoriesTracker.tsx, ...
      views/ReviewStep.tsx / SheetSummary.tsx
    tests/ (Vitest: engine.*.test.ts, store.test.ts, components/*.test.tsx)
```

### 4.2 Núcleo puro (`src/engine/`)
- `types.ts`: tipos do domínio — `Ficha` (schemaVersion 2, com `concept, nation, nationTrait, traits, backgrounds, skills, advantages, arcana, sorcery, dueling, society, stories, finalTouches, play`), `TraitKey`, `SkillKey`, `SchoolKey`, etc.
- `data/*.ts`: porta dos `data-*.js` atuais, tipados e marcados como `curado` onde aplicável. Inclui a escola **Laerdom** (Vesten).
- `derive.ts`: funções puras portadas — `traitFinal, traitFreeLeft, skillFinal, skillPointsLeft, freeAdvantages, advantagePointsLeft, sorceryBudget, powerRank, numIdiomas, fortunaPersiste, tabComplete, completeness, summaryData`.
- `migrate.ts`: `defaultFicha()`, `mergeDefaults(data)` (merge profundo robusto a payload parcial — corrige o bug já encontrado na v2), `loadFrom(storage)` (v2, senão migra v1).
- Sem dependência de React/DOM; 100% testável em Vitest.

### 4.3 Store (`src/store/ficha.ts`)
- Zustand com middleware `persist` (chave `setimoMar.ficha.v2`, `version: 2`, `migrate` usando `engine/migrate`).
- Estado = `Ficha` + `_mode` ("criar"|"jogo") + `_activeTab` (id) + `_theme` ("light"|"dark").
- Ações (chamam o núcleo puro, atualizam imutavelmente): `setConcept, selectNation, setNationTrait, adjustTrait, toggleBackground, adjustSkill, toggleAdvantage, setArcana, setSchool, toggleSorceryPower, setStyle, applyStoryPreset, setStoryField, addStoryStep, toggleStoryStep, setSociety, addReputacao/removeReputacao, addIdioma/removeIdioma, setFortunaInicial, adjustWound, adjustHeroPoints, adjustFavor, setFortuna, setNotas, importFicha(json), reset, setMode, goTab/next/prev, setTheme`.
- Seletores/haks: `useFicha(selector)`, mais hooks derivados memoizados (`useBudgets`, `useVisibleTabs`, `useSummaryData`).

### 4.4 Componentes / Views (§ árvore da Seção 2 do brainstorm)
- `CreationView`: `TabBar` (etapas + ✓ + condicionais), um `Step*` por aba, `TabNav`.
- Etapas: `ConceptNationStep, TraitsStep, BackgroundsStep, SkillsStep, AdvantagesStep, ArcanaStep, SorceryStep*, DuelingStep*, StoriesStep, SocietyStep, FinalTouchesStep, ReviewStep`. (* condicionais por Vantagem.)
- `PlayView`: header + atributos/perícias somente-leitura + `Trackers` (Pontos Heroicos, Ferimentos/Espiral, Favor, Fortuna) + `StoriesTracker` + `Notes`.
- UI reutilizável: `Card, Stepper, PillToggle, Budget, TagChip, Field, PrintSheet`.
- `TopBar`: toggle Criação|Jogo, toggle tema, exportar/importar/imprimir, recomeçar, indicador "salvo".

## 5. Sistema de temas

- **Tokens = CSS variables** em `theme/tokens.css`, dirigidos por atributos no `<html>`:
  - `data-theme="light|dark"` → paleta neutra (pergaminho/marinho no claro; marinho profundo/tinta no escuro): `--surface, --surface-2, --ink, --ink-soft, --line`.
  - `data-nation="avalon|castilha|…|vodacce"` → `--accent, --accent-ink` (um acento por nação; default sem nação = dourado base).
- **Tailwind** (`tailwind.config.ts`) mapeia os tokens para cores semânticas: `colors: { surface, 'surface-2', ink, 'ink-soft', line, accent, 'accent-ink' }` (todas `var(--…)`). Componentes usam utilitários (`bg-surface text-ink border-line text-accent`), e o tema "só funciona".
- `ThemeProvider`: aplica `data-theme`/`data-nation` no `<html>`; tema inicial respeita `prefers-color-scheme`; toggle persiste no `localStorage`.
- **Tipografia:** serifada display nos títulos + sans no corpo; fontes auto-hospedadas (offline-friendly) ou stack de sistema.
- **Acessibilidade/responsivo:** utilitários responsivos (tab bar rola no mobile); `focus-visible`; `<button>` reais; contraste conferido em ambos os temas.

## 6. Testes (Vitest)

- **Núcleo (`engine.*.test.ts`)**: porta das 65 asserções da v2 (orçamentos de Atributo/Perícia/Vantagem; bônus de Nação; empilhamento de Formações; gating + orçamento de Feitiçaria; Duelo; presets/passos de História; Sociedade favor 2 + guard `heroisNao`; idiomas = Argúcia; fortuna persiste com Rico/Benfeitor; Espiral 0-4 e Desamparado; clamps ≥0; `mergeDefaults` robusto a payload parcial).
- **Store (`store.test.ts`)**: ações mutam o estado corretamente; `persist` grava/lê `setimoMar.ficha.v2`; `importFicha` usa `mergeDefaults`.
- **Componentes (`components/*.test.tsx`, RTL)**: navegação e abas condicionais (comprar Feitiçaria mostra a aba); stepper respeita orçamento; teto de poderes de Feitiçaria; clamps dos trackers do modo Jogo; `ThemeProvider` aplica `data-theme`/`data-nation`.
- Sem Playwright/e2e nesta fase.

## 7. Compatibilidade de dados

- Mesma chave `setimoMar.ficha.v2` e mesmo schema (`schemaVersion: 2`). `migrate.ts` importa v1 e preenche defaults v2. **Fichas salvas na v2 vanilla abrem no app React**; export/import JSON idêntico.
- O tipo `Ficha` espelha exatamente a forma do estado atual.

## 8. Rollout / build

- Dev: `npm run dev` (Vite). Testes: `npm run test` (Vitest). Build: `npm run build` → `../setimo-mar/` (dist), `base: './'` para caminhos relativos.
- O hub `index.html` tem seu card do 7º Mar apontando para `setimo-mar/` (dist buildado). Dist **commitado** (mantém o hub estático, sem CI).
- **Remoção da versão vanilla** (só APÓS paridade verificada): `setimo-mar.html`, `styles-setimo-mar.css`, `scripts/setimo-mar/*`, `tests/rules.test.js`, `tests/wiring.js`.
- **Follow-up (fora de escopo):** GitHub Action para buildar em CI (evitaria commitar o dist).

## 9. Escopo / não-objetivos

- **Paridade** com a v2 (Conceito·Nação, Atributos, Formações, Perícias, Vantagens, Arcanos, Feitiçaria, Duelo, Histórias, Sociedades, Toques Finais, Revisão, modo Jogo, export/import/imprimir) **+ temas**.
- **Não** mexer no Império de Jade. Sem router, sem backend, sem contas, sem multi-personagem.
- Itens curados (dados de Feitiçaria/Duelo/Estilos) permanecem curados; Feitiçaria `repeatable` continua como orçamento fixo de 1 compra (como na v2).

## 10. Riscos / mitigações

- **Build num repo antes buildless** → sub-app isolado + dist commitado mantêm o hub estático e o Império de Jade intocado.
- **Descarte da UI vanilla funcionando** → mitigado reusando o núcleo testado (portado a TS) e portando a suíte; **paridade verificada antes de remover** os arquivos vanilla.
- **Escaping de texto** → resolvido de graça (React escapa por padrão).

## 11. Itens em aberto

Nenhum bloqueante — decisões de stack, estado, visual e testes resolvidas. Detalhe de acentos por nação (paleta exata de cada uma das 10) será definido na implementação do `theme/themes.ts`, curado a partir da identidade de cada nação.
