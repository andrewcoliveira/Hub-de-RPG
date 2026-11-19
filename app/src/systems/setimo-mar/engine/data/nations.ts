// Porte de SM_NATIONS (scripts/setimo-mar/data-core.js) — NAÇÕES (10)
// `traits`: os DOIS Atributos entre os quais o jogador escolhe o +1 de Nação.
// «curado»: os pares foram atribuídos por tema; confira contra o livro.
import type { NationDef, NationKey } from "../types";

export const NATIONS: Record<NationKey, NationDef> = {
  avalon:     { label: "Avalon",              blurb: "Ilha mística da rainha Elaine e do Graal; berço do Glamour.", traits: ["finesse","panache"],      feiticaria: "Glamour",        nota: "curado" },
  castilha:   { label: "Castilha",            blurb: "Coração da Igreja dos Vaticínios, culta e devastada pela guerra.", traits: ["finesse","argucia"],  feiticaria: null,             nota: "curado" },
  sarmacia:   { label: "Comunidade Sarmática",blurb: "A Liberdade Dourada, os hussardos alados e os pactos da Curônia.", traits: ["vigor","determinacao"], feiticaria: "Sandėris",      nota: "curado" },
  eisen:      { label: "Eisen",               blurb: "Nação de guerra e Horrores; mercenários e dracheneisen.", traits: ["vigor","determinacao"],       feiticaria: "Hexenwerk",      nota: "curado" },
  inismore:   { label: "Inismore",            blurb: "A Ilha Esmeralda do rei louco, dos bardos e dos sidhe.", traits: ["panache","determinacao"],       feiticaria: null,             nota: "curado" },
  montaigne:  { label: "Montaigne",           blurb: "O Rei-Sol, a moda, os Mosqueteiros e a magia Porté.", traits: ["panache","finesse"],             feiticaria: "Porté",          nota: "curado" },
  terrasaltas:{ label: "Terras Altas",        blurb: "Clãs das montanhas em guerra de sucessão.", traits: ["vigor","panache"],                          feiticaria: null,             nota: "curado" },
  ussura:     { label: "Ussura",              blurb: "Terra gelada de Matushka e da sucessão do czar.", traits: ["vigor","determinacao"],               feiticaria: "Condão de Mãe",  nota: "curado" },
  vesten:     { label: "Vestenmennavenjar",   blurb: "Ex-piratas, a Liga de Vendel, o guilder e as runas.", traits: ["determinacao","argucia"],         feiticaria: "Laerdom",        nota: "curado" },
  vodacce:    { label: "Vodacce",             blurb: "Sete príncipes mercantes, intriga e o Sortilégio.", traits: ["argucia","panache"],                feiticaria: "Sortilégio",     nota: "curado" },
};
