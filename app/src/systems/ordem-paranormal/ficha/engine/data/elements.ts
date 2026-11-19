// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Atributos, elementos e a tabela de NEX
//  (Capítulo 1: Atributos e Tabela 1.2; Capítulo 5: elementos)
// ══════════════════════════════════════════════════════════════════

export type Attr = "agi" | "for" | "int" | "pre" | "vig";

export const ATTRS: { key: Attr; label: string; abbr: string; desc: string }[] = [
  { key: "agi", label: "Agilidade", abbr: "AGI", desc: "Coordenação motora, velocidade de reação e destreza manual. Base de Acrobacia, Crime, Furtividade, Iniciativa, Pilotagem, Pontaria e Reflexos." },
  { key: "for", label: "Força", abbr: "FOR", desc: "Potência muscular e habilidade atlética. Base de Atletismo e Luta, e somada ao dano corpo a corpo e de arremesso." },
  { key: "int", label: "Intelecto", abbr: "INT", desc: "Raciocínio, memória e educação. Base de várias perícias de conhecimento, concede perícias treinadas adicionais e define quantos rituais você pode aprender." },
  { key: "pre", label: "Presença", abbr: "PRE", desc: "Observação, força de vontade e habilidades sociais. Base de perícias sociais e de Percepção e Vontade; concede PE adicionais por NEX." },
  { key: "vig", label: "Vigor", abbr: "VIG", desc: "Saúde e resistência física. Base de Fortitude e concede PV adicionais por NEX." },
];

export const isAttr = (k: unknown): k is Attr => ATTRS.some((a) => a.key === k);
export const attrInfo = (k: Attr) => ATTRS.find((a) => a.key === k)!;

/** Elementos com os quais se pode ter afinidade (não existe afinidade com Medo). */
export type Element = "conhecimento" | "energia" | "morte" | "sangue" | "medo";
export type AffinityElement = Exclude<Element, "medo">;

export const ELEMENTS: { key: Element; label: string }[] = [
  { key: "conhecimento", label: "Conhecimento" },
  { key: "energia", label: "Energia" },
  { key: "morte", label: "Morte" },
  { key: "sangue", label: "Sangue" },
  { key: "medo", label: "Medo" },
];
export const AFFINITY_ELEMENTS = ELEMENTS.filter((e) => e.key !== "medo") as { key: AffinityElement; label: string }[];
export const isAffinityElement = (k: unknown): k is AffinityElement => AFFINITY_ELEMENTS.some((e) => e.key === k);
export const elementLabel = (k: Element) => ELEMENTS.find((e) => e.key === k)!.label;

/** Níveis de exposição paranormal possíveis (Tabela 1.2). O índice + 1 é o limite de PE. */
export const NEX_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99] as const;
export const nexValue = (index: number): number => NEX_LEVELS[Math.max(0, Math.min(NEX_LEVELS.length - 1, index))];
export const nexIndexOf = (nex: number): number => NEX_LEVELS.findIndex((n) => n === nex);

/** Graus de treinamento das perícias e seus bônus. */
export const GRADES = [
  { label: "Destreinado", short: "—", bonus: 0 },
  { label: "Treinado", short: "T", bonus: 5 },
  { label: "Veterano", short: "V", bonus: 10 },
  { label: "Expert", short: "E", bonus: 15 },
] as const;
