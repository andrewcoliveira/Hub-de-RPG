// ══════════════════════════════════════════════════════════════════
//  IMPÉRIO DE JADE — Habilidades básicas e raças (Capítulo 1)
// ══════════════════════════════════════════════════════════════════

export type AbilityKey = "for" | "des" | "con" | "int" | "sab" | "car" | "hon";
export type BasicAbilityKey = Exclude<AbilityKey, "hon">;

export interface AbilityDef { key: AbilityKey; label: string; abbr: string }

export const ABILITIES: AbilityDef[] = [
  { key: "for", label: "Força", abbr: "For" },
  { key: "des", label: "Destreza", abbr: "Des" },
  { key: "con", label: "Constituição", abbr: "Con" },
  { key: "int", label: "Inteligência", abbr: "Int" },
  { key: "sab", label: "Sabedoria", abbr: "Sab" },
  { key: "car", label: "Carisma", abbr: "Car" },
  { key: "hon", label: "Honra", abbr: "Hon" },
];

// Habilidades básicas (a Honra é a "sétima habilidade especial" e fica de fora
// dos bônus raciais à escolha e dos aumentos de habilidade por nível)
export const BASIC_ABILITIES = ABILITIES.filter((a) => a.key !== "hon") as (AbilityDef & { key: BasicAbilityKey })[];
export const isAbilityKey = (k: unknown): k is AbilityKey => ABILITIES.some((a) => a.key === k);
export const isBasicAbilityKey = (k: unknown): k is BasicAbilityKey => BASIC_ABILITIES.some((a) => a.key === k);

// Compra de pontos (24 pontos)
export const POINT_COST: Record<number, number> = { 8: -2, 9: -1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 4, 15: 6, 16: 8, 17: 11, 18: 14 };
export const POINT_BUDGET = 24;
export const POINT_LEVELS = Object.keys(POINT_COST).map(Number).sort((a, b) => a - b);

export const abilityMod = (v: number) => Math.floor((v - 10) / 2);
export const fmtMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

export interface RaceDef {
  label: string;
  /** Caminho da imagem (resolvido por raceImage em ../assets). */
  img: string;
  desc: string;
  bonuses: Partial<Record<AbilityKey, number>>;
  /** Humano/mashin: +amount em `count` habilidades básicas à escolha. */
  choiceBonus?: { count: number; amount: number };
  abilities: string[];
}

const RACES_DATA = {
  humano: {
    label: "Humano", img: "assets/images/races/Humano.png",
    desc: "Versáteis e adaptáveis, os humanos recebem bônus em duas habilidades à escolha e talentos extras.",
    bonuses: {},
    choiceBonus: { count: 2, amount: 2 },
    abilities: [
      "2 perícias treinadas extras (podem ser fora da classe, mas é violação de honra leve).",
      "2 talentos extras (pré-requisitos ainda se aplicam).",
    ],
  },
  hanyo: {
    label: "Hanyô", img: "assets/images/races/Hanyo.png",
    desc: "Meio-youkai cheios de entusiasmo e esperteza, mas sem bom senso.",
    bonuses: { car: 4, int: 2, sab: -2 },
    abilities: [
      "Arcano: +4 em testes de Identificar Magia.",
      "Brincar com os sentimentos: chacra das emoções aberto (grau básico); soma bônus de Car a PM e limite; aprende e executa jutsus básicos de Car; aprende 1 jutsu básico de Car à escolha.",
      "Espírito livre: +4 em testes contra efeitos que restringem movimento (agarrar, redes, paralisia, etc.).",
      "Poder salvador: quando em perigo (metade ou menos de PV, ou CA reduzida em combate), executa jutsus/poderes com custo em PM por –1 PM (mínimo 0 PM).",
    ],
  },
  henge: {
    label: "Henge", img: "assets/images/races/Henge.png",
    desc: "Metamorfos ágeis e perceptivos com forma animal, mas físico frágil.",
    bonuses: { des: 4, sab: 2, for: -2 },
    abilities: [
      "Animal: imune a jutsus/efeitos que afetam apenas humanoides.",
      "Forma animal: transforma-se em 1 animal (Pequeno ou Mínimo) como ação completa, quantas vezes quiser.",
      "Movimento especial: deslocamento variado na forma animal (voo, natação, escalada, etc.) conforme a espécie.",
      "Arma natural: mordida ou garras na forma animal, conforme a espécie.",
      "Agilidade animal: Atletismo é baseado em Destreza, não Força.",
      "Faro: +4 em Percepção; detecta criaturas automaticamente a até 9m.",
      "Visão na penumbra: ignora camuflagem por escuridão; enxerga 2× mais longe com pouca luz.",
    ],
  },
  kaijin: {
    label: "Kaijin", img: "assets/images/races/Kaijin.png",
    desc: "Criaturas da Tormenta, fortes e resilientes, mas grotescas e desonradas.",
    bonuses: { for: 4, con: 2, car: -2, hon: -1 },
    abilities: [
      "Monstro: imune a jutsus/efeitos que afetam apenas humanoides.",
      "Afinidade com a Tormenta: jamais recebe níveis negativos por efeitos da Tormenta.",
      "Ameaçador: Intimidação é baseada em Força, não Carisma.",
      "Disforme: não pode usar itens mundanos normais; pode usar obra-prima (sob medida), mágicos ou de talentos/habilidades de classe.",
      "Talentos: recebe Anatomia Insana, Carapaça e mais 2 talentos da Tormenta à escolha (sem dano de Honra por eles).",
      "Visão no escuro: ignora camuflagem total por escuridão; enxerga normalmente no escuro (preto e branco).",
    ],
  },
  mashin: {
    label: "Mashin", img: "assets/images/races/Mashin.png",
    desc: "Construtos elementais adaptados à sociedade humana, criados para as mais variadas tarefas.",
    bonuses: { hon: 1 },
    choiceBonus: { count: 2, amount: 2 },
    abilities: [
      "Construto: imune a jutsus/efeitos que afetam apenas humanoides.",
      "Imunidades: atordoamento, doenças, enjoo, fadiga, luz, paralisia, trevas, sono e venenos; não precisa respirar, comer, beber ou dormir.",
      "Quase vivo: possui Constituição; recupera PV com descanso; não é destruído a 0 PV; pode ser ressuscitado.",
      "Sem cura: não recupera PV com curas mágicas; usa Ofício (metalurgia) no lugar de Cura.",
      "Cura elemental: escolha 1 descritor elemental — é imune ao dano desse tipo e cura metade do dano mágico recebido.",
      "Visão no escuro: ignora camuflagem total por escuridão; enxerga normalmente no escuro (preto e branco).",
    ],
  },
  nezumi: {
    label: "Nezumi", img: "assets/images/races/Nezumi.png",
    desc: "Ratovens rápidos e resistentes, mas rudes e primitivos.",
    bonuses: { con: 4, des: 2, int: -2, hon: -2 },
    abilities: [
      "Tamanho Pequeno: +1 CA, +1 ataque, +4 Furtividade, –4 manobras; usa armas como criaturas Médias.",
      "Deslocamento 9m (mesmo de criaturas Médias).",
      "Amedrontador: +4 em testes de Intimidação.",
      "Faro: +4 em Percepção; detecta criaturas automaticamente a até 9m.",
      "Visão na penumbra: ignora camuflagem por escuridão; enxerga 2× mais longe com pouca luz.",
    ],
  },
  ryuujin: {
    label: "Ryuujin", img: "assets/images/races/Ryuujin.png",
    desc: "Meio-dragões iluminados por Lin-Wu, honrados e resilientes, mas lentos a reagir.",
    bonuses: { sab: 4, for: 2, hon: 2, des: -2 },
    abilities: [
      "Digno: +4 em testes de Diplomacia.",
      "Honra superior: +1 CA e +1 ataque/dano contra adversários com Honra menor que a sua.",
      "Resistência celestial: escolha 3 descritores elementais — resistência 5 contra cada um.",
      "Sorte ancestral: +2 em todos os testes de resistência.",
      "Visão no escuro: ignora camuflagem total por escuridão; enxerga normalmente no escuro (preto e branco).",
    ],
  },
  vanara: {
    label: "Vanara", img: "assets/images/races/Vanara.png",
    desc: "Primatas eruditos, brilhantes e sábios, mas com compleição física fraca.",
    bonuses: { int: 4, sab: 2, hon: 1, con: -2 },
    abilities: [
      "Cauda preênsil: usa a cauda como mão inábil (segurar objetos, armas leves, escudos, selos de jutsus).",
      "Conheça o inimigo: margem de ameaça aumentada em +1 nos ataques.",
      "Culto: faz testes de Conhecimento sem treinamento; sempre pode escolher 10 nesses testes.",
      "Mente sobre a matéria: nos testes de Fortitude, rola também Vontade e fica com o melhor resultado.",
      "Visão na penumbra: ignora camuflagem por escuridão; enxerga 2× mais longe com pouca luz.",
    ],
  },
} satisfies Record<string, RaceDef>;

export type RaceKey = keyof typeof RACES_DATA;
export const RACES: Record<RaceKey, RaceDef> = RACES_DATA;
export const isRaceKey = (k: unknown): k is RaceKey => typeof k === "string" && k in RACES;
