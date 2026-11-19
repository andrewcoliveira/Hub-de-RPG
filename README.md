# Hub de RPG

Ferramentas para mestres e jogadores de RPG, reunidas em um só lugar.

## Sistemas e ferramentas

| Sistema | Ferramenta | Endereço |
|---|---|---|
| Império de Jade | Criador de Fichas | `imperio-de-jade/ficha.html` |
| Império de Jade | Gerador de Recompensas | `imperio-de-jade/gerador.html` |
| 7º Mar | Criador de Fichas | `setimo-mar/index.html` |
| Ordem Paranormal | Criador de Fichas | `ordem-paranormal/ficha.html` |
| Sacramento | Criador de Fichas | `sacramento/ficha.html` |

A página inicial (`index.html`) é neutra: lista os sistemas e tem um rolador rápido de dados (d4 a d100).

## Como o projeto é organizado

Todo o site é **um único app** Vite + React + TypeScript, com várias páginas. O código-fonte fica em `app/`; o build vai para a **raiz do repositório**, que é publicada como está pelo GitHub Pages (por isso `index.html`, `assets/`, `imperio-de-jade/`, `setimo-mar/`, `ordem-paranormal/` e `sacramento/` na raiz são arquivos gerados — não edite à mão).

```
app/                              código-fonte (Vite + React + TypeScript)
  index.html                      página do hub
  imperio-de-jade/ficha.html      páginas de cada sistema (mesmos endereços do site)
  imperio-de-jade/gerador.html
  setimo-mar/index.html
  ordem-paranormal/ficha.html
  sacramento/ficha.html
  site.config.mjs                 lista de páginas e do que o build gera na raiz
  public/                         copiado tal qual (favicon, .nojekyll)
  src/
    shared/                       comum a todo o hub: tema claro/escuro, utilidades
                                  de navegador, componentes (ThemeToggle, Toaster) e
                                  o registro de sistemas (systems.ts)
    hub/                          página inicial
    systems/
      imperio-de-jade/
        ficha/engine/             regras da ficha (puras, sem React) + dados
        ficha/views/, FichaApp    telas
        gerador/engine/           tabelas do Capítulo 8 e gerador (puro)
        gerador/data/             tabelas de recompensa em JSON
        styles/, assets/          CSS, imagens e fonte Shanghai
      setimo-mar/                 engine/, store/, views/, theme/…
      ordem-paranormal/
        ficha/engine/             regras do Capítulo 1 (puras) + dados: origens, classes,
                                  trilhas, poderes, perícias e os 82 rituais
        ficha/views/, FichaApp    telas
        styles/, components/      CSS (visual de dossiê) e moldura das páginas
      sacramento/
        ficha/engine/             regras do Capítulo 1 (puras) + dados: habilidades,
                                  trilhas de Redenção e o Grande Catálogo de Equipamento
        ficha/views/, FichaApp    telas
        styles/, components/      CSS (cartaz de faroeste) e moldura das páginas
  tests/                          testes (Vitest) por sistema + hub
index.html, assets/, …            build publicado (gerado)
docs/                             especificações e planos
```

Cada sistema segue o mesmo padrão: **regras puras e testadas** em `engine/`, **estado** numa store Zustand e **telas** em React. O tema claro/escuro é o mesmo em todas as páginas (`localStorage["hub-theme"]`).

## Desenvolvendo

Requer [Node.js](https://nodejs.org) 20 ou mais recente.

```
cd app
npm install
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm test           # testes
npm run build      # checa os tipos, limpa o build anterior e gera o site na raiz
```

Depois de `npm run build`, faça commit também dos arquivos gerados na raiz — é o que o GitHub Pages publica. Para ver o resultado do build localmente, sirva a raiz (`python -m http.server 8000`) e acesse `http://localhost:8000`.

### Adicionando um sistema novo

1. Crie `app/src/systems/<sistema>/` com `engine/` (regras), a store e as telas.
2. Crie as páginas HTML em `app/<sistema>/…` e registre-as em `app/site.config.mjs`.
3. Adicione o cartão do sistema em `app/src/shared/systems.ts` — o hub mostra sozinho.
4. Escreva os testes em `app/tests/<sistema>/`.

## Gerador de Recompensas (Império de Jade)

Escolha o ND do inimigo derrotado, quantas criaturas foram derrotadas e se o tesouro é padrão, dobro ou triplo. Cada criatura rende um tesouro (dois ou três no dobro/triplo), e cada tesouro é rolado separadamente: as moedas são somadas e os itens, listados. Cada resultado mostra o passo a passo das tabelas, e o tesouro da sessão (ouro, prata e equipamentos) é somado e salvo no navegador. Atalhos: `Espaço` rola, `←` `→` mudam o ND. Também é possível abrir com um ND definido, por exemplo `gerador.html?nd=5`.

## Criador de Fichas (Império de Jade)

Seis etapas (atributos, raça, classe e nível, perícias, talentos e ficha final), com uma ficha ao vivo que se atualiza a cada escolha. A ficha é salva automaticamente no navegador, pode ser impressa/salva em PDF e exportada/importada em JSON. Cada etapa tem link direto, por exemplo `ficha.html#talentos`.

## Criador de Fichas (Ordem Paranormal)

Segue o "Passo a passo para criar seu agente" do livro de regras (v1.3) em oito etapas: conceito (com descrição opcional), atributos (todos em 1, 4 pontos, um atributo pode ir a 0 por +1 ponto, máximo 3), origem (as 26 da Tabela 1.1, com rolagem de 2d20), classe e NEX (5% a 99%, com trilha a partir de 10%), perícias (origem + classe + Intelecto, Perito e Grau de Treinamento), poderes (poderes de classe com pré-requisitos, aumentos de atributo, Versatilidade, afinidade e poderes paranormais via Transcender), rituais (vagas do ocultista por círculo, Saber Ampliado e Grimório do Graduado, Aprender Ritual para as outras classes) e a ficha final. PV, PE, Sanidade, Defesa, limite de PE, carga e DT de rituais são calculados ao vivo, inclusive os bônus de origem, trilha e poderes. A ficha fica salva no navegador, pode ser impressa/salva em PDF, copiada como texto e exportada/importada em JSON. Cada etapa tem link direto, por exemplo `ficha.html#rituais`.

## Criador de Fichas (Sacramento)

Segue o Capítulo 1 do livro básico em oito etapas: conceito e nível (1 a 6, com a tabela de XP), atributos (4 pontos entre Físico, Velocidade, Intelecto e Coragem, que mudam Vida, Movimentos, Antecedentes e Ações de Combate), antecedentes (4 + Intelecto, máximo 2 no nível 1), as 30 habilidades de Combate e de Profissão (com as tabelas que melhoram no nível), a Trilha de Redenção (as 6 do livro ou uma própria, com os passos marcáveis), a montaria (Potência, Resistência e Fidelidade) e a compra do equipamento inicial com $200 pelo preço máximo, controlando as 10 linhas da mochila e as armas no coldre. Círculos de Vida e de Dor, Defesa e Iniciativa são calculados ao vivo. A ficha fica salva no navegador, pode ser impressa/salva em PDF, copiada como texto e exportada/importada em JSON. Cada etapa tem link direto, por exemplo `ficha.html#equipamento`.

---

Ferramentas de fã, sem vínculo oficial. Império de Jade pertence à [Jambô Editora](https://jamboeditora.com.br). Ordem Paranormal RPG pertence a Cellbit e à Jambô Editora. Sacramento RPG é de Calango e Mineiro, publicado pela Jambô Editora. 7º Mar e demais marcas citadas pertencem aos seus respectivos detentores.

**Criado por _Andrew Canto Oliveira_.**
