# Ficha de 7º Mar — v2 (design)

**Data:** 2026-07-03
**Branch:** `setimo-mar`
**Autor:** Arthur Pinto de Andrade (com Claude)
**Status:** aprovado no brainstorming; pronto para o plano de implementação.

## 1. Objetivo

Completar o Criador de Fichas de 7º Mar (7th Sea) iniciado na v1, cobrindo os
blocos restantes da criação de personagem e transformando a ferramenta de
"criar → resumo estático" em uma **ficha viva** utilizável na mesa.

## 2. Ponto de partida (v1, já implementado)

- `setimo-mar.html` + `styles-setimo-mar.css` + `scripts/setimo-mar/data.js` + `scripts/setimo-mar/builder.js`.
- Criação em passos, data-driven, JS puro (sem build), Bootstrap-less (CSS próprio).
- Cobre: Conceito+Nação, Atributos (orçamento de pontos + bônus de Nação),
  Formações (2), Perícias (16, orçamento 10, empilhamento das Formações),
  Vantagens (orçamento 5, grátis das Formações), Arcanos (Virtude/Húbris).
- Persistência em `localStorage` (`setimoMar.ficha.v1`), exportar/importar JSON, imprimir.
- Testado: 29/29 asserções do motor de regras + smoke test no navegador.

## 3. Escopo da v2 (decidido)

Todos os 5 blocos restantes, **ficha viva**, **criação em abas**, **uma página com
toggle Criação|Jogo**, **dados curados** das regras do vault + sistema (marcados
para revisão). Feitiçaria com **seletor de poderes curado**.

### Fora de escopo (v3+)
- Listas exaustivas oficiais de poderes/manobras/vantagens (dependem do livro).
- Rolador de dados integrado / simulação de Riscos.
- Multi-personagem / nuvem / contas.

## 4. Arquitetura

### 4.1 Uma página, dois modos
`setimo-mar.html` ganha um **toggle de modo** no topo: **Criação** e **Jogo**.
Mesmo estado e mesmo `localStorage`. O "resumo" da v1 evolui para a base da
ficha de Jogo.

### 4.2 Criação como assistente em abas
- Barra de abas, **uma etapa visível por vez**, navegação **Anterior/Próximo**.
- Cada aba exibe estado de completude (✓ / pendente). Abas são clicáveis para pular.
- **Abas condicionais**: `Feitiçaria` só habilita se a Vantagem *Feitiçaria* foi
  comprada; `Duelo` só habilita se *Academia Duelista* foi comprada.
- Ordem: `1 Conceito·Nação · 2 Atributos · 3 Formações · 4 Perícias · 5 Vantagens ·
  6 Arcanos · 7 Feitiçaria* · 8 Duelo* · 9 Histórias · 10 Sociedade · 11 Toques Finais · 12 Revisão`.

### 4.3 Modularização (quebra do `builder.js`)
```
scripts/setimo-mar/
  data-core.js       atributos, perícias, nações, formações, vantagens, arcanos, constantes de criação
  data-sorcery.js    6 escolas + poderes curados (Maiores/Menores) + fonte/custo
  data-dueling.js    estilos duelistas + manobras (referência)
  data-societies.js  as 10 sociedades + economia de Favor
  data-stories.js    Pontos de Partida prontos (Vendeta, Amnésia, …)
  state.js           estado SM, defaults, load/save/migração, cálculos derivados compartilhados
  create.js          renderizadores/ações da CRIAÇÃO (extraído do builder.js)
  play.js            renderizadores/ações da FICHA VIVA
  app.js             toggle de modo, roteamento de abas, boot, fiação
```
`data-core.js` = renomeação/evolução do `data.js` atual. `builder.js` é dividido
em `state.js` + `create.js` + `app.js` (unidades pequenas e focadas).

Regra de bom-senso: cada módulo com uma responsabilidade clara, comunicando por
funções bem definidas. `state.js` é a única fonte de verdade do estado.

## 5. Estado & persistência

### 5.1 Chave e versão
- Nova chave `setimoMar.ficha.v2`, com campo `schemaVersion: 2`.
- **Migração automática**: na primeira carga, se existir `v1` e não existir `v2`,
  copia os campos da v1 e preenche os novos com padrões. Nada é perdido. A chave
  v1 permanece legível (não é apagada).

### 5.2 Forma do estado (v2)
```js
{
  schemaVersion: 2,
  // — criação (v1) —
  concept, nation, nationTrait, traits, backgrounds, skills, advantages, arcana,
  // — criação (v2) —
  sorcery: { school: null, powers: [] },          // powers: chaves de data-sorcery
  dueling: { style: null },
  society: { key: null },
  stories: [ { nome, final, recompensa, passos:[{texto, feito}] } ],
  finalTouches: { reputacoes:[], idiomas:[], fortunaInicial:0 },
  // — estado de jogo (modo Jogo) —
  play: {
    ferimentos: 0,
    ferimentosDramaticos: 0,   // 0..4 (Espiral da Morte; 4 = Desamparado)
    pontosHeroicos: 1,
    fortuna: 0,
    favor: 2,                  // se society != null
    notas: ""
  }
}
```

### 5.3 Derivados (em `state.js`)
- Já existentes: trait final, budgets de trait/perícia/vantagem, skills das Formações.
- Novos: nº de Idiomas = Grau final de Argúcia; `temFeiticaria` / `temAcademiaDuelista`
  (a partir de `advantages`); orçamento de poderes de Feitiçaria = nº de compras da
  Vantagem *Feitiçaria* × (1 Maior + 2 Menores); Fortuna persiste se possui *Rico*
  ou *Benfeitor*.

## 6. Design por bloco

### 6.1 ⚗️ Feitiçaria (aba condicional)
- Habilita quando `temFeiticaria`. Escola padrão = `SM_NATIONS[nation].feiticaria`;
  se a Nação não tem escola, o jogador escolhe uma (estado marcado como livre).
- `data-sorcery.js`: cada escola = `{ label, fonte, custo, nota, maiores:[{key,nome,desc}],
  menores:[{key,nome,desc}] }`. Conteúdo curado dos exemplos do vault
  (Sistema-Regras 1.11) + representativo.
- UI: mostra a escola; lista Maiores e Menores como cartões selecionáveis; respeita
  o orçamento (ex.: 1 Maior + 2 Menores por compra da Vantagem). Poderes selecionados
  entram no resumo/ficha.

### 6.2 ⚔️ Estilo de Duelo (aba condicional)
- Habilita quando `temAcademiaDuelista`. Escolhe **1 Estilo** entre ~13
  (Aldana, Ambrogia, Boucher, Donovan, Drexel, Eisenfaust, Leegstra, Mantovani,
  Mireli, Sabat, Torres, Valroux), cada um com Bônus de Estilo (curado).
- Painel de **Manobras** de referência (Cutilada, Parada, Finta, Estocada, Batida,
  Resposta) — somente leitura. `data-dueling.js`.

### 6.3 📖 Histórias Heroicas (aba)
- Estrutura por História: `Nome/mantra`, `Final` (ação que encerra), `Recompensa`
  (tipo), `Passos` (lista; só o próximo precisa estar definido).
- 1 História ativa por padrão (nota: 2 com a Vantagem Diabo Zarolho — futuro).
- **Pontos de Partida** (`data-stories.js`): Amnésia, Amor Perdido, Caçada, Maldição,
  Obrigação, Rivalidade, Romance, Vendeta — escolher preenche Final + 1º Passo; ou começa em branco.
- Modo Jogo: marcar/avançar passos (checkbox + escrever o próximo).

### 6.4 🗝️ Sociedade Secreta (aba, opcional)
- Escolhe 0 ou 1 das 10 sociedades (Irmandade da Costa, Die Kreuzritter, Exploradores,
  Colégio Invisível, Rosa e Cruz, Los Vagabundos, Močiutės Skara, Rilasciare,
  Filhas de Sophia, Novus Ordo Mundi — Heróis não entram nesta última). `data-societies.js`
  reaproveita blurb + economia de Favor do vault.
- Começa com **Favor 2**. Modo Jogo: tracker de Favor (ajuste ±, mínimo 0).

### 6.5 ✒️ Toques Finais (aba)
- **Reputação**: lista de adjetivos (adicionar/remover).
- **Idiomas**: quantidade = Grau final de Argúcia; jogador lista quais (teano antigo +
  língua materna são livres). Validação leve (não exige preencher todos).
- **Fortuna**: valor inicial; nota de que zera por sessão salvo *Rico/Benfeitor*
  (detectado das Vantagens).

### 6.6 🎮 Modo Jogo (ficha viva)
- Atributos/Perícias e escolhas de criação em **somente leitura** (editáveis voltando à Criação).
- Editáveis e persistentes: **Ferimentos / Espiral da Morte** (0→4 = Desamparado, com
  efeitos escalonados exibidos), **Pontos Heroicos** (inicia 1, ± , ≥0), **Favor**,
  **Fortuna**, **Histórias** (avançar passos), **notas**.
- Autosave a cada mudança.

### 6.7 12 · Revisão
- Ficha completa (criação + escolhas v2). Botões finalizar/exportar/imprimir.
- Impressão: opção de imprimir o resumo de criação ou a ficha de Jogo.

## 7. Curadoria de dados
Feitiçaria, Estilos e Manobras são preenchidos a partir dos exemplos de
`Sistema-Regras 1.9/1.11` do vault + conhecimento do sistema, cada item marcado
como `curado` (comentário/nota) para revisão posterior contra o livro. Editar os
`data-*.js` é seguro; a UI lê deles.

## 8. Testes & verificação

1. **`tests/rules.test.js`** (Node puro, sem framework; `node tests/rules.test.js`):
   migração v1→v2; gating de Feitiçaria/Duelo pelas Vantagens; orçamento de poderes;
   preset de História preenche Final+1º Passo e avanço de passos; Favor inicia 2 e
   clampa ≥0; nº de Idiomas = Argúcia; Fortuna persiste com Rico/Benfeitor;
   Espiral 0→4 e Desamparado em 4; Pontos Heroicos ≥0; completude por aba e
   habilitação das abas condicionais.
2. **Check estático de fiação** (Node): todo `getElementById`/`onclick` novo tem
   alvo/handler correspondente.
3. **Smoke test no navegador** (preview): navegação por abas; condicionais
   habilitando/desabilitando; seletor de Feitiçaria; edição no modo Jogo;
   **recarregar e confirmar persistência**; impressão. Screenshot de evidência.

Nenhuma alegação de "pronto" sem mostrar a saída de (1) e evidência de (3).

## 9. Entregáveis
- `setimo-mar.html` reestruturado (toggle + abas).
- `styles-setimo-mar.css` estendido (abas, ficha de jogo, impressão da ficha viva).
- Módulos em `scripts/setimo-mar/` conforme §4.3.
- `tests/rules.test.js`.
- Sem mudanças fora da branch `setimo-mar`. Commits feitos pelo usuário.

## 10. Itens em aberto
Nenhum — todas as decisões de escopo foram resolvidas no brainstorming.
Dependência conhecida: precisão total dos dados de Feitiçaria/Duelo depende de
revisão futura contra o livro (assumido; abordagem "curada" aceita).
