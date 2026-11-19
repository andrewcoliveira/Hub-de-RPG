// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Classes, poderes de classe e trilhas (Capítulo 1)
// ══════════════════════════════════════════════════════════════════

import type { Attr } from "./elements";

export type ClassKey = "combatente" | "especialista" | "ocultista";
export const CLASS_KEYS: ClassKey[] = ["combatente", "especialista", "ocultista"];
export const isClassKey = (k: unknown): k is ClassKey => CLASS_KEYS.includes(k as ClassKey);

export interface Prereq {
  attr?: Partial<Record<Attr, number>>;
  /** Todas estas perícias treinadas. */
  trained?: string[];
  /** Pelo menos uma destas perícias treinada. */
  trainedAny?: string[];
  nex?: number;
  /** Outro poder de classe (pelo id). */
  power?: string;
}

export interface PowerDef {
  id: string;
  name: string;
  desc: string;
  prereq?: Prereq;
  repeatable?: boolean;
  /** O poder pede uma escolha: um elemento ou um ritual conhecido. */
  choice?: "element" | "ritual";
  /** Transcender (escolhe um poder paranormal) e Treinamento em Perícia (escolhe duas perícias). */
  special?: "transcender" | "treinamento";
}

export interface TrailAbility { nex: 10 | 40 | 65 | 99; name: string; desc: string }

export interface TrailDef {
  key: string;
  label: string;
  cls: ClassKey;
  desc: string;
  /** Requisito para escolher a trilha (Médico de Campo). */
  requires?: { trained: string; note: string };
  abilities: TrailAbility[];
  /** Ritual concedido pela habilidade de NEX 99% (trilhas de ocultista). */
  ritual99?: string;
}

export interface ClassFeature { nex: number; name: string; desc: string }

export interface ClassDef {
  key: ClassKey;
  label: string;
  tagline: string;
  desc: string;
  famous: string;
  pv: [number, number];
  pe: [number, number];
  san: [number, number];
  skillsText: string;
  /** Perícias livres além das fixas: base + Intelecto. */
  freeSkills: number;
  /** Perícias fixas (ocultista) ou grupos "uma das duas" (combatente). */
  fixedSkills: string[];
  skillGroups: string[][];
  /** Grau de Treinamento (NEX 35% e 70%): base + Intelecto. */
  grauBase: number;
  proficiencies: string[];
  /** Tabela de progressão (Tabelas 1.3 a 1.5). */
  table: Record<number, string>;
  features: ClassFeature[];
  powers: PowerDef[];
}

// ── Poderes comuns às três classes ────────────────────────────────

const TRANSCENDER: PowerDef = {
  id: "transcender", name: "Transcender", repeatable: true, special: "transcender",
  desc: "Escolha um poder paranormal. Você recebe o poder escolhido, mas não ganha Sanidade neste aumento de NEX. Você pode escolher este poder várias vezes.",
};
const TREINAMENTO: PowerDef = {
  id: "treinamento-em-pericia", name: "Treinamento em Perícia", repeatable: true, special: "treinamento",
  desc: "Escolha duas perícias. Você se torna treinado nelas. A partir de NEX 35%, pode escolher perícias em que já é treinado para se tornar veterano; a partir de NEX 70%, perícias em que já é veterano para se tornar expert. Você pode escolher este poder várias vezes.",
};
const ARTISTA_MARCIAL = (verb: string): PowerDef => ({
  id: "artista-marcial", name: "Artista Marcial",
  desc: `Seus ataques desarmados causam 1d6 pontos de dano, podem causar dano letal e ${verb} ágeis. Em NEX 35%, o dano aumenta para 1d8 e, em NEX 70%, para 1d10.`,
});

const PROGRESSION: Record<number, string> = {
  10: "Habilidade de trilha", 15: "Poder", 20: "Aumento de atributo", 30: "Poder", 35: "Grau de treinamento",
  40: "Habilidade de trilha", 45: "Poder", 50: "Aumento de atributo, versatilidade", 60: "Poder", 65: "Habilidade de trilha",
  70: "Grau de treinamento", 75: "Poder", 80: "Aumento de atributo", 90: "Poder", 95: "Aumento de atributo", 99: "Habilidade de trilha",
};

const COMMON_FEATURES = (cls: string, grau: string): ClassFeature[] => [
  { nex: 10, name: "Habilidade de Trilha", desc: `Em NEX 10% você escolhe uma das trilhas de ${cls} e recebe o primeiro poder dela. Recebe um novo poder da trilha em NEX 40%, 65% e 99%.` },
  { nex: 15, name: `Poder de ${cls[0].toUpperCase()}${cls.slice(1)}`, desc: `Em NEX 15% você recebe um poder de ${cls} à sua escolha, e outro em NEX 30% e a cada 15% de NEX subsequentes.` },
  { nex: 20, name: "Aumento de Atributo", desc: "Em NEX 20%, e novamente em NEX 50%, 80% e 95%, aumente um atributo a sua escolha em +1. Você não pode aumentar um atributo além de 5 desta forma." },
  { nex: 35, name: "Grau de Treinamento", desc: `Em NEX 35%, e novamente em NEX 70%, escolha um número de perícias treinadas igual a ${grau} + Int. Seu grau de treinamento nessas perícias aumenta em um (de treinado para veterano ou de veterano para expert).` },
  { nex: 50, name: "Versatilidade", desc: `Em NEX 50%, escolha entre receber um poder de ${cls} ou o primeiro poder de uma trilha de ${cls} que não a sua.` },
];

export const CLASSES: Record<ClassKey, ClassDef> = {
  combatente: {
    key: "combatente", label: "Combatente",
    tagline: "Perigoso e durão",
    desc: "Treinado para lutar com todo tipo de armas, e com a força e a coragem para encarar os perigos de frente. Prefere abordagens diretas e costuma atirar primeiro e perguntar depois.",
    famous: "Senhor Veríssimo, Joui Jouki, Gal, Antônio “Balu” Pontevedra, Tristan Monteiro e Ryder Staten.",
    pv: [20, 4], pe: [2, 2], san: [12, 3],
    skillsText: "Luta ou Pontaria e Fortitude ou Reflexos, mais 1 + Intelecto à sua escolha.",
    freeSkills: 1, fixedSkills: [], skillGroups: [["Luta", "Pontaria"], ["Fortitude", "Reflexos"]],
    grauBase: 2,
    proficiencies: ["Armas simples", "Armas táticas", "Proteções leves"],
    table: { 5: "Ataque especial (2 PE, +5)", ...PROGRESSION, 25: "Ataque especial (3 PE, +10)", 55: "Ataque especial (4 PE, +15)", 85: "Ataque especial (5 PE, +20)" },
    features: [
      { nex: 5, name: "Ataque Especial", desc: "Quando faz um ataque, você pode gastar 2 PE para receber +5 no teste de ataque ou na rolagem de dano. Em NEX 25%, 55% e 85% pode gastar +1 PE para receber mais um bônus de +5 (até 5 PE, +20). Cada +5 pode ir para o ataque ou para o dano." },
      ...COMMON_FEATURES("combatente", "2"),
    ],
    powers: [
      { id: "armamento-pesado", name: "Armamento Pesado", prereq: { attr: { for: 2 } }, desc: "Você recebe proficiência com armas pesadas." },
      ARTISTA_MARCIAL("se tornam"),
      { id: "ataque-de-oportunidade", name: "Ataque de Oportunidade", desc: "Sempre que um ser sair voluntariamente de um espaço adjacente ao seu, você pode gastar uma reação e 1 PE para fazer um ataque corpo a corpo contra ele." },
      { id: "combater-com-duas-armas", name: "Combater com Duas Armas", prereq: { attr: { agi: 3 }, trainedAny: ["Luta", "Pontaria"] }, desc: "Se estiver empunhando duas armas (pelo menos uma leve) e fizer a ação agredir, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –1d20 em todos os testes de ataque até o seu próximo turno." },
      { id: "combate-defensivo", name: "Combate Defensivo", prereq: { attr: { int: 2 } }, desc: "Quando usa a ação agredir, pode combater defensivamente: até seu próximo turno, sofre –1d20 nos testes de ataque, mas recebe +5 na Defesa." },
      { id: "golpe-demolidor", name: "Golpe Demolidor", prereq: { attr: { for: 2 }, trained: ["Luta"] }, desc: "Quando usa a manobra quebrar ou ataca um objeto, pode gastar 1 PE para causar dois dados de dano extra do mesmo tipo de sua arma." },
      { id: "golpe-pesado", name: "Golpe Pesado", desc: "Enquanto estiver empunhando uma arma corpo a corpo, o dano dela aumenta em mais um dado do mesmo tipo." },
      { id: "incansavel", name: "Incansável", desc: "Uma vez por cena, você pode gastar 2 PE para fazer uma ação de investigação adicional, mas deve usar Força ou Agilidade como atributo-base do teste." },
      { id: "presteza-atletica", name: "Presteza Atlética", desc: "Quando faz um teste de facilitar a investigação, pode gastar 1 PE para usar Força ou Agilidade no lugar do atributo-base da perícia. Se passar, o próximo aliado que usar seu bônus também recebe +1d20 no teste." },
      { id: "protecao-pesada", name: "Proteção Pesada", prereq: { nex: 30 }, desc: "Você recebe proficiência com proteções pesadas." },
      { id: "reflexos-defensivos", name: "Reflexos Defensivos", prereq: { attr: { agi: 2 } }, desc: "Você recebe +2 em Defesa e em testes de resistência." },
      { id: "saque-rapido", name: "Saque Rápido", prereq: { trained: ["Iniciativa"] }, desc: "Você pode sacar ou guardar itens como uma ação livre. Com a regra opcional de munição, uma vez por rodada pode recarregar uma arma de disparo como ação livre." },
      { id: "segurar-o-gatilho", name: "Segurar o Gatilho", prereq: { nex: 60 }, desc: "Sempre que acerta um ataque com uma arma de fogo, pode fazer outro ataque com a mesma arma contra o mesmo alvo, pagando 2 PE por ataque já realizado no turno, até errar ou atingir seu limite de PE." },
      { id: "sentido-tatico", name: "Sentido Tático", prereq: { attr: { int: 2 }, trained: ["Percepção", "Tática"] }, desc: "Você pode gastar uma ação de movimento e 2 PE para analisar o ambiente. Recebe um bônus em Defesa e em testes de resistência igual ao seu Intelecto até o final da cena." },
      { id: "tanque-de-guerra", name: "Tanque de Guerra", prereq: { power: "protecao-pesada" }, desc: "Se estiver usando uma proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2." },
      { id: "tiro-certeiro", name: "Tiro Certeiro", prereq: { trained: ["Pontaria"] }, desc: "Se estiver usando uma arma de disparo, você soma sua Agilidade nas rolagens de dano e ignora a penalidade contra alvos em combate corpo a corpo." },
      { id: "tiro-de-cobertura", name: "Tiro de Cobertura", desc: "Gaste uma ação padrão e 1 PE para disparar uma arma de fogo na direção de um ser no alcance. Faça um teste de Pontaria contra a Vontade do alvo; se vencer, até o início do seu próximo turno ele não pode sair do lugar e sofre –5 em testes de ataque. Efeito de medo." },
      TRANSCENDER,
      TREINAMENTO,
    ],
  },

  especialista: {
    key: "especialista", label: "Especialista",
    tagline: "Versátil e habilidoso",
    desc: "Um agente que confia mais em esperteza do que em força bruta. Usa conhecimento técnico, raciocínio rápido ou mesmo lábia para resolver mistérios e enfrentar o paranormal.",
    famous: "Aaron, Arthur Cervero, Rubens Naluti, Elizabeth Webber, Samuel Norte, Chizue Akechi.",
    pv: [16, 3], pe: [3, 3], san: [16, 4],
    skillsText: "7 + Intelecto perícias à sua escolha.",
    freeSkills: 7, fixedSkills: [], skillGroups: [],
    grauBase: 5,
    proficiencies: ["Armas simples", "Proteções leves"],
    table: { 5: "Eclético, perito (2 PE, +1d6)", ...PROGRESSION, 25: "Perito (3 PE, +1d8)", 40: "Engenhosidade (veterano), habilidade de trilha", 55: "Perito (4 PE, +1d10)", 75: "Engenhosidade (expert), poder", 85: "Perito (5 PE, +1d12)" },
    features: [
      { nex: 5, name: "Eclético", desc: "Quando faz um teste de uma perícia, você pode gastar 2 PE para receber os benefícios de ser treinado nela." },
      { nex: 5, name: "Perito", desc: "Escolha duas perícias em que é treinado (exceto Luta e Pontaria). Quando faz um teste delas, pode gastar 2 PE para somar +1d6. Em NEX 25%, 55% e 85% pode gastar +1 PE para aumentar o dado (3 PE +1d8, 4 PE +1d10, 5 PE +1d12)." },
      ...COMMON_FEATURES("especialista", "5"),
      { nex: 40, name: "Engenhosidade", desc: "Em NEX 40%, quando usa Eclético, pode gastar 2 PE adicionais para receber os benefícios de ser veterano na perícia. Em NEX 75%, pode gastar 4 PE adicionais para os benefícios de expert." },
    ],
    powers: [
      ARTISTA_MARCIAL("contam como armas"),
      { id: "balistica-avancada", name: "Balística Avançada", desc: "Você recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com armas de fogo." },
      { id: "conhecimento-aplicado", name: "Conhecimento Aplicado", prereq: { attr: { int: 2 } }, desc: "Quando faz um teste de perícia (exceto Luta e Pontaria), pode gastar 2 PE para mudar o atributo-base da perícia para Int." },
      { id: "hacker", name: "Hacker", prereq: { trained: ["Tecnologia"] }, desc: "Você recebe +5 em testes de Tecnologia para invadir sistemas e diminui o tempo para hackear qualquer sistema para uma ação completa." },
      { id: "maos-rapidas", name: "Mãos Rápidas", prereq: { attr: { agi: 3 }, trained: ["Crime"] }, desc: "Ao fazer um teste de Crime, pode pagar 1 PE para fazê-lo como uma ação livre." },
      { id: "mochila-de-utilidades", name: "Mochila de Utilidades", desc: "Um item a sua escolha (exceto armas) conta como uma categoria abaixo e ocupa 1 espaço a menos." },
      { id: "movimento-tatico", name: "Movimento Tático", prereq: { trained: ["Atletismo"] }, desc: "Você pode gastar 1 PE para ignorar a penalidade em deslocamento por terreno difícil e por escalar até o final do turno." },
      { id: "na-trilha-certa", name: "Na Trilha Certa", desc: "Sempre que tiver sucesso em um teste para procurar pistas, pode gastar 1 PE para receber +1d20 no próximo teste. Custos e bônus são cumulativos." },
      { id: "nerd", name: "Nerd", desc: "Uma vez por cena, pode gastar 2 PE para fazer um teste de Atualidades (DT 20). Se passar, recebe uma informação útil para essa cena." },
      { id: "ninja-urbano", name: "Ninja Urbano", desc: "Você recebe proficiência com armas táticas de ataque corpo a corpo e de disparo (exceto de fogo) e +2 em rolagens de dano com armas de corpo a corpo e de disparo." },
      { id: "pensamento-agil", name: "Pensamento Ágil", desc: "Uma vez por rodada, durante uma cena de investigação, pode gastar 2 PE para fazer uma ação de procurar pistas adicional." },
      { id: "perito-em-explosivos", name: "Perito em Explosivos", desc: "Você soma seu Intelecto na DT para resistir aos seus explosivos e pode excluir dos efeitos da explosão um número de alvos igual ao seu Intelecto." },
      { id: "primeira-impressao", name: "Primeira Impressão", desc: "Você recebe +2d20 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena." },
      TRANSCENDER,
      TREINAMENTO,
    ],
  },

  ocultista: {
    key: "ocultista", label: "Ocultista",
    tagline: "Rituais e poderes do Outro Lado",
    desc: "Um estudioso do paranormal que busca entender os mistérios dos elementos e usá-los a seu favor — mas todo poder tem um preço.",
    famous: "Agatha Volkomenn, Dante, Arnaldo Fritz, Marc Menet, Kian.",
    pv: [12, 2], pe: [4, 4], san: [20, 5],
    skillsText: "Ocultismo e Vontade, mais 3 + Intelecto à sua escolha.",
    freeSkills: 3, fixedSkills: ["Ocultismo", "Vontade"], skillGroups: [],
    grauBase: 3,
    proficiencies: ["Armas simples"],
    table: { 5: "Escolhido pelo Outro Lado (1º círculo)", ...PROGRESSION, 25: "Escolhido pelo Outro Lado (2º círculo)", 55: "Escolhido pelo Outro Lado (3º círculo)", 85: "Escolhido pelo Outro Lado (4º círculo)" },
    features: [
      { nex: 5, name: "Escolhido pelo Outro Lado", desc: "Você pode lançar rituais de 1º círculo (2º em NEX 25%, 3º em 55% e 4º em 85%). Começa com três rituais de 1º círculo e, sempre que avança de NEX, aprende um ritual de qualquer círculo que possa lançar. Esses rituais não contam no limite de rituais conhecidos." },
      ...COMMON_FEATURES("ocultista", "3"),
    ],
    powers: [
      { id: "camuflar-ocultismo", name: "Camuflar Ocultismo", desc: "Ação livre para esconder símbolos e sigilos desenhados em objetos ou na pele. Ao lançar um ritual, pode gastar +2 PE para lançá-lo sem componentes e sem gesticular; outros só percebem com Ocultismo (DT 25)." },
      { id: "criar-selo", name: "Criar Selo", desc: "Você sabe fabricar selos paranormais de rituais que conheça, gastando uma ação de interlúdio e PE iguais ao custo do ritual. Pode ter selos ao mesmo tempo até sua Presença." },
      { id: "envolto-em-misterio", name: "Envolto em Mistério", desc: "Sua aparência e postura assombrosas lhe dão +5 em Enganação e Intimidação contra pessoas não treinadas em Ocultismo." },
      { id: "especialista-em-elemento", name: "Especialista em Elemento", choice: "element", desc: "Escolha um elemento. A DT para resistir aos seus rituais desse elemento aumenta em +2." },
      { id: "ferramentas-paranormais", name: "Ferramentas Paranormais", desc: "Você reduz a categoria de um item paranormal em I e pode ativar itens paranormais sem pagar seu custo em PE." },
      { id: "fluxo-de-poder", name: "Fluxo de Poder", prereq: { nex: 60 }, desc: "Você pode manter dois efeitos sustentados de rituais ativos ao mesmo tempo com uma só ação livre, pagando o custo de cada um." },
      { id: "guiado-pelo-paranormal", name: "Guiado pelo Paranormal", desc: "Uma vez por cena, pode gastar 2 PE para fazer uma ação de investigação adicional." },
      { id: "identificacao-paranormal", name: "Identificação Paranormal", desc: "Você recebe +10 em testes de Ocultismo para identificar criaturas, objetos ou rituais." },
      { id: "improvisar-componentes", name: "Improvisar Componentes", desc: "Uma vez por cena, gaste uma ação completa e faça Investigação (DT 15). Se passar, encontra componentes ritualísticos de um elemento à sua escolha." },
      { id: "intuicao-paranormal", name: "Intuição Paranormal", desc: "Sempre que usa a ação facilitar investigação, você soma seu Intelecto ou Presença no teste (à sua escolha)." },
      { id: "mestre-em-elemento", name: "Mestre em Elemento", choice: "element", prereq: { power: "especialista-em-elemento", nex: 45 }, desc: "Escolha um elemento em que é Especialista. O custo para lançar rituais desse elemento diminui em –1 PE." },
      { id: "ritual-potente", name: "Ritual Potente", prereq: { attr: { int: 2 } }, desc: "Você soma seu Intelecto nas rolagens de dano ou nos efeitos de cura de seus rituais." },
      { id: "ritual-predileto", name: "Ritual Predileto", choice: "ritual", desc: "Escolha um ritual que você conhece. Você reduz em –1 PE o custo dele (acumula com outras reduções)." },
      { id: "tatuagem-ritualistica", name: "Tatuagem Ritualística", desc: "Símbolos em sua pele reduzem em –1 PE o custo de rituais de alcance pessoal que têm você como alvo." },
      TRANSCENDER,
      TREINAMENTO,
    ],
  },
};

// ── Trilhas ───────────────────────────────────────────────────────

export const TRAILS: TrailDef[] = [
  // Combatente
  { key: "aniquilador", label: "Aniquilador", cls: "combatente",
    desc: "Treinado para abater alvos com eficiência e velocidade. Suas armas são suas melhores amigas.",
    abilities: [
      { nex: 10, name: "A Favorita", desc: "Escolha uma arma para ser sua favorita, como katana ou fuzil de assalto. A categoria da arma escolhida é reduzida em I." },
      { nex: 40, name: "Técnica Secreta", desc: "A categoria da arma favorita passa a ser reduzida em II. Quando ataca com ela, pode gastar 2 PE para aplicar um efeito (+2 PE por efeito adicional): Amplo (atinge um alvo adicional adjacente) ou Destruidor (+1 no multiplicador de crítico)." },
      { nex: 65, name: "Técnica Sublime", desc: "Adiciona à Técnica Secreta: Letal (+2 na margem de ameaça; escolhido duas vezes, +5) e Perfurante (ignora até 5 de resistência a dano)." },
      { nex: 99, name: "Máquina de Matar", desc: "A categoria da arma favorita passa a ser reduzida em III, ela recebe +2 na margem de ameaça e seu dano aumenta em um dado do mesmo tipo." },
    ] },
  { key: "comandante-de-campo", label: "Comandante de Campo", cls: "combatente",
    desc: "Treinado para coordenar e auxiliar seus companheiros em combate, tomando decisões rápidas.",
    abilities: [
      { nex: 10, name: "Inspirar Confiança", desc: "Gaste uma reação e 2 PE para fazer um aliado em alcance curto rolar novamente um teste recém realizado." },
      { nex: 40, name: "Estrategista", desc: "Gaste uma ação padrão e 1 PE por aliado em alcance curto (limitado pelo seu Intelecto). No próximo turno deles, ganham uma ação de movimento adicional." },
      { nex: 65, name: "Brecha na Guarda", desc: "Uma vez por rodada, quando um aliado causar dano em um inimigo em seu alcance curto, gaste uma reação e 2 PE para que você ou outro aliado faça um ataque adicional contra ele. Inspirar confiança e estrategista passam a ter alcance médio." },
      { nex: 99, name: "Oficial Comandante", desc: "Gaste uma ação padrão e 5 PE para que cada aliado que você possa ver em alcance médio receba uma ação padrão adicional no próximo turno dele." },
    ] },
  { key: "guerreiro", label: "Guerreiro", cls: "combatente",
    desc: "Você transformou seu corpo em uma verdadeira arma, com golpes corpo a corpo tão poderosos quanto uma bala.",
    abilities: [
      { nex: 10, name: "Técnica Letal", desc: "Você recebe +2 na margem de ameaça com todos os seus ataques corpo a corpo." },
      { nex: 40, name: "Revidar", desc: "Sempre que bloquear um ataque, pode gastar uma reação e 2 PE para fazer um ataque corpo a corpo no inimigo que o atacou." },
      { nex: 65, name: "Força Opressora", desc: "Quando acerta um ataque corpo a corpo, pode gastar 1 PE para fazer a manobra derrubar ou empurrar como ação livre (+5 para empurrar a cada 10 de dano). Se derrubar, pode gastar 1 PE para um ataque adicional contra o alvo caído." },
      { nex: 99, name: "Potência Máxima", desc: "Quando usa seu Ataque Especial com armas corpo a corpo, todos os bônus numéricos são dobrados." },
    ] },
  { key: "operacoes-especiais", label: "Operações Especiais", cls: "combatente",
    desc: "Um combatente eficaz, de ações calculadas, sempre antevendo os movimentos inimigos.",
    abilities: [
      { nex: 10, name: "Iniciativa Aprimorada", desc: "Você recebe +5 em Iniciativa e uma ação de movimento adicional na primeira rodada." },
      { nex: 40, name: "Ataque Extra", desc: "Uma vez por rodada, quando faz um ataque, pode gastar 2 PE para fazer um ataque adicional." },
      { nex: 65, name: "Surto de Adrenalina", desc: "Uma vez por rodada, pode gastar 5 PE para realizar uma ação padrão ou de movimento adicional." },
      { nex: 99, name: "Sempre Alerta", desc: "Você recebe uma ação padrão adicional no início de cada cena de combate." },
    ] },
  { key: "tropa-de-choque", label: "Tropa de Choque", cls: "combatente",
    desc: "Duro na queda: treinou o corpo para resistir a traumas físicos e se coloca entre os aliados e o perigo.",
    abilities: [
      { nex: 10, name: "Casca Grossa", desc: "Você recebe +1 PV para cada 5% de NEX e, quando faz um bloqueio, soma seu Vigor na resistência a dano recebida." },
      { nex: 40, name: "Cai Dentro", desc: "Quando um oponente em alcance curto ataca um aliado, gaste uma reação e 1 PE: ele faz um teste de Vontade (DT Vig); se falhar, deve atacar você em vez do aliado." },
      { nex: 65, name: "Duro de Matar", desc: "Ao sofrer dano não paranormal, gaste uma reação e 2 PE para reduzi-lo à metade. Em NEX 85%, também funciona contra dano paranormal." },
      { nex: 99, name: "Inquebrável", desc: "Enquanto estiver machucado, recebe +5 na Defesa e resistência a dano 5. Enquanto estiver morrendo, não fica indefeso e ainda pode agir (mas segue as regras de morte)." },
    ] },

  // Especialista
  { key: "atirador-de-elite", label: "Atirador de Elite", cls: "especialista",
    desc: "Um tiro, uma morte. Perito em neutralizar ameaças de longe, tratando a arma como ferramenta de precisão.",
    abilities: [
      { nex: 10, name: "Mira de Elite", desc: "Você recebe proficiência com armas de fogo que usam balas longas e soma seu Intelecto em rolagens de dano com essas armas." },
      { nex: 40, name: "Disparo Letal", desc: "Quando faz a ação mirar, pode gastar 1 PE para aumentar em +2 a margem de ameaça do próximo ataque até o final de seu próximo turno." },
      { nex: 65, name: "Disparo Impactante", desc: "Quando ataca com uma arma de fogo, pode gastar 2 PE e, em vez de causar dano, fazer uma manobra entre derrubar, desarmar, empurrar ou quebrar." },
      { nex: 99, name: "Atirar para Matar", desc: "Quando faz um acerto crítico com uma arma de fogo, você causa dano máximo, sem precisar rolar dados." },
    ] },
  { key: "infiltrador", label: "Infiltrador", cls: "especialista",
    desc: "Perito em infiltração, capaz de neutralizar alvos desprevenidos sem causar alarde.",
    abilities: [
      { nex: 10, name: "Ataque Furtivo", desc: "Uma vez por rodada, ao atingir um alvo desprevenido (corpo a corpo ou alcance curto) ou que esteja flanqueando, pode gastar 1 PE para causar +1d6 de dano. Aumenta para +2d6 em NEX 40%, +3d6 em 65% e +4d6 em 99%." },
      { nex: 40, name: "Gatuno", desc: "Você recebe +5 em Atletismo e Crime e pode percorrer seu deslocamento normal quando se esconder sem penalidade." },
      { nex: 65, name: "Assassinar", desc: "Gaste uma ação de movimento e 3 PE para analisar um alvo em alcance curto. Seu primeiro Ataque Furtivo contra ele até o fim do próximo turno tem os dados extras dobrados e, se causar dano, deixa o alvo inconsciente ou morrendo (Fortitude DT Agi evita)." },
      { nex: 99, name: "Sombra Fugaz", desc: "Quando faz um teste de Furtividade após atacar ou outra ação chamativa, pode gastar 3 PE para não sofrer a penalidade de –3d20 no teste." },
    ] },
  { key: "medico-de-campo", label: "Médico de Campo", cls: "especialista",
    desc: "Treinado em primeiros socorros e tratamento de emergência no meio do caos.",
    requires: { trained: "Medicina", note: "Exige treinamento em Medicina; para usar as habilidades, precisa de um kit de medicina." },
    abilities: [
      { nex: 10, name: "Paramédico", desc: "Ação padrão e 2 PE para curar 2d10 PV de si mesmo ou de um aliado adjacente. Pode curar +1d10 PV em NEX 40%, 65% e 99%, gastando +1 PE por dado adicional." },
      { nex: 40, name: "Equipe de Trauma", desc: "Ação padrão e 2 PE para remover uma condição negativa (exceto morrendo) de um aliado adjacente." },
      { nex: 65, name: "Resgate", desc: "Uma vez por rodada, se estiver em alcance curto de um aliado machucado ou morrendo, pode se aproximar dele com ação livre. Ao curar PV ou remover condições do aliado, ambos recebem +5 na Defesa até seu próximo turno. Carregar um personagem ocupa metade dos espaços." },
      { nex: 99, name: "Reanimação", desc: "Uma vez por cena, gaste uma ação completa e 10 PE para trazer de volta à vida um personagem que morreu na mesma cena (exceto por dano massivo)." },
    ] },
  { key: "negociador", label: "Negociador", cls: "especialista",
    desc: "Um diplomata habilidoso que influencia pessoas por lábia ou intimidação.",
    abilities: [
      { nex: 10, name: "Eloquência", desc: "Ação completa e 1 PE por alvo em alcance curto: teste de Diplomacia, Enganação ou Intimidação contra a Vontade deles. Se vencer, ficam fascinados enquanto você se concentrar." },
      { nex: 40, name: "Discurso Motivador", desc: "Ação padrão e 4 PE: você e seus aliados em alcance curto ganham +1d20 em testes de perícia até o fim da cena. A partir de NEX 65%, pode gastar 8 PE para +2d20." },
      { nex: 65, name: "Eu Conheço um Cara", desc: "Uma vez por missão, ative sua rede de contatos para pedir um favor (trocar o equipamento do grupo, um local de descanso, um resgate…), a critério do mestre." },
      { nex: 99, name: "Truque de Mestre", desc: "Gaste 5 PE para simular o efeito de qualquer habilidade que tenha visto um aliado usar na cena, ignorando pré-requisitos mas pagando todos os custos." },
    ] },
  { key: "tecnico", label: "Técnico", cls: "especialista",
    desc: "Mantém e repara o equipamento do time, improvisa ferramentas e sabota os itens dos inimigos.",
    abilities: [
      { nex: 10, name: "Inventário Otimizado", desc: "Você soma seu Intelecto à sua Força para calcular sua capacidade de carga." },
      { nex: 40, name: "Remendão", desc: "Ação completa e 1 PE para remover a condição quebrado de um equipamento adjacente até o fim da cena. Equipamento geral tem a categoria reduzida em I para você." },
      { nex: 65, name: "Improvisar", desc: "Escolha um equipamento geral e gaste uma ação completa e 2 PE + 2 PE por categoria: você cria uma versão funcional dele, que se torna inútil no fim da cena." },
      { nex: 99, name: "Preparado para Tudo", desc: "Sempre que precisar de um item (exceto armas), gaste uma ação de movimento e 3 PE por categoria para lembrar que o colocou no fundo da bolsa." },
    ] },

  // Ocultista
  { key: "conduite", label: "Conduíte", cls: "ocultista", ritual99: "Canalizar o Medo",
    desc: "Domina os fundamentos da conjuração, ampliando alcance e velocidade dos rituais e interferindo nos de outros ocultistas.",
    abilities: [
      { nex: 10, name: "Ampliar Ritual", desc: "Ao lançar um ritual, pode gastar +2 PE para aumentar seu alcance em um passo ou dobrar sua área de efeito." },
      { nex: 40, name: "Acelerar Ritual", desc: "Uma vez por rodada, pode aumentar o custo de um ritual em 4 PE para conjurá-lo como ação livre." },
      { nex: 65, name: "Anular Ritual", desc: "Quando for alvo de um ritual, pode gastar PE iguais ao custo pago e fazer um teste oposto de Ocultismo contra o conjurador. Se vencer, anula o ritual." },
      { nex: 99, name: "Canalizar o Medo", desc: "Você aprende o ritual Canalizar o Medo." },
    ] },
  { key: "flagelador", label: "Flagelador", cls: "ocultista", ritual99: "Medo Tangível",
    desc: "Transforma a dor — a sua e a dos inimigos — em poder para seus rituais.",
    abilities: [
      { nex: 10, name: "Poder do Flagelo", desc: "Ao conjurar um ritual, pode gastar seus próprios PV para pagar o custo em PE, à taxa de 2 PV por PE. Esses PV só são recuperados com descanso." },
      { nex: 40, name: "Abraçar a Dor", desc: "Sempre que sofrer dano não paranormal, pode gastar uma reação e 2 PE para reduzi-lo à metade." },
      { nex: 65, name: "Absorver Agonia", desc: "Sempre que reduz um ou mais inimigos a 0 PV com um ritual, recebe PE temporários iguais ao círculo do ritual." },
      { nex: 99, name: "Medo Tangível", desc: "Você aprende o ritual Medo Tangível." },
    ] },
  { key: "graduado", label: "Graduado", cls: "ocultista", ritual99: "Conhecendo o Medo",
    desc: "Foca os estudos em se tornar um conjurador versátil, conhecendo mais rituais e tornando-os mais difíceis de resistir.",
    abilities: [
      { nex: 10, name: "Saber Ampliado", desc: "Você aprende um ritual de 1º círculo. Toda vez que ganha acesso a um novo círculo, aprende um ritual adicional daquele círculo. Esses rituais não contam no seu limite." },
      { nex: 40, name: "Grimório Ritualístico", desc: "Você cria um grimório com rituais de 1º ou 2º círculos em quantidade igual ao seu Intelecto, mais um ritual de cada novo círculo que acessar. Para conjurá-los, empunhe o grimório e gaste uma ação completa folheando-o. Ocupa 1 espaço." },
      { nex: 65, name: "Rituais Eficientes", desc: "A DT para resistir a todos os seus rituais aumenta em +5." },
      { nex: 99, name: "Conhecendo o Medo", desc: "Você aprende o ritual Conhecendo o Medo." },
    ] },
  { key: "intuitivo", label: "Intuitivo", cls: "ocultista", ritual99: "Presença do Medo",
    desc: "Preparou a mente para resistir aos efeitos do Outro Lado, expandindo os limites das capacidades paranormais.",
    abilities: [
      { nex: 10, name: "Mente Sã", desc: "Você recebe resistência paranormal +5 (+5 em testes de resistência contra efeitos paranormais)." },
      { nex: 40, name: "Presença Poderosa", desc: "Você adiciona sua Presença ao seu limite de PE por turno, mas apenas para conjurar rituais (não para DT)." },
      { nex: 65, name: "Inabalável", desc: "Você recebe resistência a dano mental e paranormal 10. Quando um efeito paranormal permite Vontade para reduzir o dano à metade, você não sofre dano se passar." },
      { nex: 99, name: "Presença do Medo", desc: "Você aprende o ritual Presença do Medo." },
    ] },
  { key: "lamina-paranormal", label: "Lâmina Paranormal", cls: "ocultista", ritual99: "Lâmina do Medo",
    desc: "Usa o paranormal como arma, mesclando conjuração com técnicas de luta.",
    abilities: [
      { nex: 10, name: "Lâmina Maldita", desc: "Você aprende o ritual Amaldiçoar Arma. Se já o conhece, pode gastar +1 PE ao lançá-lo para reduzir seu tempo de conjuração para movimento. Ao conjurá-lo, pode usar Ocultismo em vez de Luta ou Pontaria para atacar com a arma amaldiçoada." },
      { nex: 40, name: "Gladiador Paranormal", desc: "Sempre que acerta um ataque corpo a corpo em um inimigo, recebe 2 PE temporários (máximo por cena igual ao seu limite de PE)." },
      { nex: 65, name: "Conjuração Marcial", desc: "Uma vez por rodada, quando lança um ritual com execução padrão, pode gastar 2 PE para fazer um ataque corpo a corpo como ação livre." },
      { nex: 99, name: "Lâmina do Medo", desc: "Você aprende o ritual Lâmina do Medo." },
    ] },
];

export const trailIndex = new Map(TRAILS.map((t) => [t.key, t]));
export const isTrailKey = (k: unknown): k is string => typeof k === "string" && trailIndex.has(k);
export const trailsOf = (cls: ClassKey) => TRAILS.filter((t) => t.cls === cls);

/** Poder de classe pelo id, procurando primeiro na classe indicada. */
export function findPower(id: string, cls?: ClassKey | null): PowerDef | undefined {
  if (cls) {
    const own = CLASSES[cls].powers.find((p) => p.id === id);
    if (own) return own;
  }
  for (const k of CLASS_KEYS) {
    const p = CLASSES[k].powers.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}

/** Níveis de NEX que concedem poder de classe e aumento de atributo. */
export const POWER_NEX = [15, 30, 45, 60, 75, 90];
export const ATTR_INCREASE_NEX = [20, 50, 80, 95];
export const GRAU_NEX = [35, 70];
