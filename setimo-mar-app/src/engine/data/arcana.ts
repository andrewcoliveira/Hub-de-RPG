// Porte de SM_ARCANA (scripts/setimo-mar/data-core.js) — ARCANOS (Virtude & Húbris)
// Escolha 1 Virtude e 1 Húbris de CARTAS DIFERENTES. Amostra dos 20
// arquétipos do baralho vodacce. «curado»: efeitos resumidos.
import type { ArcanaDef } from "../types";

export const ARCANA: Record<string, ArcanaDef> = {
  olouco:    { label: "O Louco",   virtude: "Otimista: recupere 1 Ponto Heroico ao rir do perigo.", hubris: "Imprudente: age sem pensar nas consequências." },
  amorte:    { label: "A Morte",   virtude: "Firme: ignore uma Consequência de medo uma vez por sessão.", hubris: "Sombrio: obcecado por perdas e finais." },
  atorre:    { label: "A Torre",   virtude: "Inabalável: resista a uma tentativa de te derrubar/mover.", hubris: "Orgulhoso: nunca admite estar errado." },
  odiabo:    { label: "O Diabo",   virtude: "Tentador: ganhe vantagem ao oferecer o que alguém deseja.", hubris: "Ganancioso: cede à tentação fácil." },
  aguerra:   { label: "A Guerra",  virtude: "Corajoso: aja primeiro numa cena de combate uma vez por sessão.", hubris: "Belicoso: resolve tudo pela força." },
  osol:      { label: "O Sol",     virtude: "Glorioso: inspire aliados, dando-lhes 1 dado extra.", hubris: "Vaidoso: precisa dos holofotes." },
  alua:      { label: "A Lua",     virtude: "Intuitivo: uma vez por sessão, saiba se alguém mente.", hubris: "Misterioso: esconde a verdade dos aliados." },
  aestrela:  { label: "A Estrela", virtude: "Esperançoso: dê 1 Ponto Heroico a um aliado em desespero.", hubris: "Sonhador: distrai-se com ideais." },
  ojulgamento:{ label: "O Julgamento", virtude: "Justo: ganhe vantagem ao defender o inocente.", hubris: "Implacável: incapaz de perdoar." },
  aimperatriz:{ label: "A Imperatriz", virtude: "Protetora: proteja um aliado sofrendo o dano no lugar dele.", hubris: "Controladora: sufoca quem ama." },
  oenforcado:{ label: "O Enforcado", virtude: "Sacrifício: ganhe 1 Ponto Heroico ao abrir mão de algo caro.", hubris: "Mártir: busca o próprio sofrimento." },
  aroda:     { label: "A Roda da Fortuna", virtude: "Sortudo: relance um dado uma vez por sessão.", hubris: "Fatalista: aceita o destino sem lutar." },
};
