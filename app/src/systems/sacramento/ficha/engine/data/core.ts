// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Atributos, Antecedentes, Condições e Níveis
//  (Capítulo 1: Personagens)
// ══════════════════════════════════════════════════════════════════

export type Attr = "fisico" | "velocidade" | "intelecto" | "coragem";

export const ATTRS: { key: Attr; label: string; effect: string; desc: string }[] = [
  { key: "fisico", label: "Físico", effect: "+1 Círculo de Vida por ponto", desc: "Quantos Círculos de Vida você tem e sua resistência a doenças, venenos e ferimentos." },
  { key: "velocidade", label: "Velocidade", effect: "+1 Movimento por ponto", desc: "Rapidez com as pernas, reflexos e a capacidade de se esquivar de armadilhas ou explosões." },
  { key: "intelecto", label: "Intelecto", effect: "+1 ponto de Antecedente por ponto", desc: "Inteligência e a capacidade de descobrir, notar, perceber enganações e memorizar fatos." },
  { key: "coragem", label: "Coragem", effect: "+1 Ação de Combate por ponto", desc: "Prontidão no combate, velocidade para agir, controle dos medos, paciência e força de vontade." },
];
export const isAttr = (k: unknown): k is Attr => ATTRS.some((a) => a.key === k);

export type Antecedent = "atencao" | "medicina" | "montaria" | "negocios" | "roubo" | "suor" | "tradicao" | "violencia";

export const ANTECEDENTS: { key: Antecedent; label: string; desc: string }[] = [
  { key: "atencao", label: "Atenção", desc: "Ficar de olho aberto: detectar coisas fora do lugar, passagens secretas, emboscadas e arapucas." },
  { key: "medicina", label: "Medicina", desc: "Curar pessoas e animais, avaliar doenças e venenos, cirurgias improvisadas. Com 1 ponto, não precisa testar para recuperar Vida nos descansos." },
  { key: "montaria", label: "Montaria", desc: "Cavalgar, cuidar de gado, adestrar equinos e lidar com animais de pastoreio." },
  { key: "negocios", label: "Negócios", desc: "Mentir, convencer, seduzir, vender, manipular e, obviamente, negociar." },
  { key: "roubo", label: "Roubo", desc: "Malandragem, furtividade e subterfúgio para se esconder, roubar ou trapacear nas cartas." },
  { key: "suor", label: "Suor", desc: "Trabalho pesado: nadar, correr, saltar, escalar, empurrar, puxar e ofícios manuais." },
  { key: "tradicao", label: "Tradição", desc: "Conhecimentos sobre culturas, regiões, plantas, animais e tudo o que aprendeu com os livros ou com a vida." },
  { key: "violencia", label: "Violência", desc: "Atirar, lutar, machucar, criar estratégias de batalha e avaliar ferimentos." },
];
export const isAntecedent = (k: unknown): k is Antecedent => ANTECEDENTS.some((a) => a.key === k);

/** Condições iniciais, iguais para todos os PJs. */
export const START = { vida: 6, dor: 6, acoes: 1, movimentos: 1, antecedentes: 4, atributos: 4, defesa: 5 } as const;

/** Máximo de pontos num Antecedente no nível 1 (a ficha tem 5 círculos por Antecedente). */
export const ANTECEDENT_MAX_L1 = 2;
export const ANTECEDENT_MAX = 5;

/** Tabela de Experiência: XP mínimo e bônus de cada nível. */
export interface LevelDef {
  level: number;
  xp: number;
  /** Ganha +1 Vida por ponto de Físico (mínimo 1). */
  vidaPorFisico?: boolean;
  vidaFixa?: number;
  antecedente?: number;
  atributo?: number;
  habilidade?: number;
  text: string;
}

export const LEVELS: LevelDef[] = [
  { level: 1, xp: 0, text: "—" },
  { level: 2, xp: 10, vidaPorFisico: true, antecedente: 1, habilidade: 1, text: "+1 Vida por ponto em Físico (mín. 1), +1 Ponto de Antecedente, +1 Habilidade" },
  { level: 3, xp: 20, atributo: 1, habilidade: 1, text: "+1 Ponto de Atributo, +1 Habilidade" },
  { level: 4, xp: 30, vidaPorFisico: true, atributo: 1, habilidade: 1, text: "+1 Vida por ponto em Físico (mín. 1), +1 Ponto de Atributo, +1 Habilidade" },
  { level: 5, xp: 45, vidaPorFisico: true, atributo: 1, text: "+1 Vida por ponto em Físico (mín. 1), +1 Ponto de Atributo" },
  { level: 6, xp: 65, vidaFixa: 3, atributo: 1, habilidade: 1, text: "+3 Vida, +1 Ponto de Atributo, +1 Habilidade" },
];
export const MAX_LEVEL = 6;

/** Penalidades ao riscar o sexto Círculo de Dor (role 1d6). */
export const PAIN_TABLE = [
  { roll: 1, name: "Atordoamento", effect: "–1 Ação de Combate na próxima rodada." },
  { roll: 2, name: "Queda", effect: "Gaste um Movimento para se levantar." },
  { roll: 3, name: "Distração", effect: "Não pode atacar esse mesmo alvo no próximo ataque." },
  { roll: 4, name: "Sangramento", effect: "1 Círculo de Vida adicional por turno até o fim do combate." },
  { roll: 5, name: "Intimidação", effect: "É preciso se afastar do atacante na próxima rodada." },
  { roll: 6, name: "Desorientação", effect: "–1 em Testes de Violência no próximo turno." },
];

/** As 5 perguntas de XP do fim da sessão. */
export const XP_QUESTIONS = [
  "Seu PJ chegou vivo ao final da sessão?",
  "Seu PJ tem mais dinheiro do que no começo da sessão?",
  "Seu PJ fez algo que ajudou seu bando de alguma forma?",
  "Seu PJ resolveu o problema de alguém?",
  "Seu PJ terminou a sessão com alguma Carta de Sina?",
];

export const CONCEPT_EXAMPLES = [
  "Pistoleiro caçador de recompensas.",
  "Vigarista trapaceiro de pôquer que vive de bar em bar.",
  "Espião infiltrado na gangue dos Fivela-de-Cobra.",
  "Ex-operário das ferrovias que sabe lutar Kung Fu.",
  "Mensageira que precisa atravessar o Oeste Selvagem.",
  "Idoso cachaceiro que já foi um grande pistoleiro.",
  "Indígena que precisa ser o guerreiro mais valente de seu povo.",
  "Viúva defendendo as terras que são suas por direito.",
  "Aristocrata almofadinha que está viajando pela primeira vez.",
  "Universitário da cidade grande que veio estudar no Oeste Selvagem.",
  "Ex-padre que ficou louco e vive no meio do mato.",
  "Sindicalista que quer fazer uma greve contra os barões das ferrovias.",
  "Idosa procurada pela lei há mais de 50 anos.",
  "Imigrante do Oriente que está procurando seu mestre em Bom Fim.",
];
