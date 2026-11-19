// Porte de SM_ADVANTAGES (scripts/setimo-mar/data-core.js) — VANTAGENS
// Custo em pontos (1-5). Amostra de Sistema-Regras 1.8 Passo 5. «curado».
import type { AdvantageDef } from "../types";

export const ADVANTAGES: Record<string, AdvantageDef> = {
  acostumadobeber:  { label: "Acostumado a Beber",   cost: 1, desc: "Resiste a bebida e venenos leves." },
  equilibriomar:    { label: "Equilíbrio de Marinheiro", cost: 1, desc: "Nunca perde o equilíbrio num convés." },
  grandemiudo:      { label: "Grande / Miúdo",       cost: 1, desc: "Tamanho notável — imponente ou furtivo." },
  linguista:        { label: "Linguista",            cost: 1, desc: "Fala vários idiomas além do materno." },
  sensodirecao:     { label: "Senso de Direção",     cost: 1, desc: "Nunca se perde; sabe o norte." },
  contato:          { label: "Contato",              cost: 2, desc: "Um aliado útil numa organização." },
  devotadomar:      { label: "Devotado ao Mar",      cost: 2, desc: "O mar o favorece; bônus náuticos." },
  espiritovaloroso: { label: "Espírito Valoroso",    cost: 2, desc: "Resiste ao medo e à intimidação." },
  feiticaria:       { label: "Feitiçaria",           cost: 2, desc: "Acesso a uma escola de magia (repetível). Ver Nação.", repeatable: true },
  lideranca:        { label: "Liderança",            cost: 2, desc: "Comanda e inspira Pelotões e aliados." },
  reputacao:        { label: "Reputação",            cost: 2, desc: "Um adjetivo famoso que soma dados sociais.", repeatable: true },
  vontadeindomita:  { label: "Vontade Indômita",     cost: 2, desc: "Resiste à Pressão e à manipulação." },
  atiradoreximio:   { label: "Atirador Exímio",      cost: 3, desc: "Mestre de armas de fogo/arremesso." },
  benfeitor:        { label: "Benfeitor",            cost: 3, desc: "Renda fixa de um patrono." },
  esgrimista:       { label: "Esgrimista",           cost: 3, desc: "Treino formal de esgrima (base p/ Manobras)." },
  rico:             { label: "Rico",                 cost: 3, desc: "Fortuna que não zera a cada sessão." },
  reflexos:         { label: "Reflexos Rápidos",     cost: 3, desc: "Age cedo; bônus de iniciativa." },
  academia:         { label: "Academia",             cost: 4, desc: "Formação militar de elite." },
  alquimista:       { label: "Alquimista",           cost: 4, desc: "Prepara compostos e reagentes." },
  atributolendario: { label: "Atributo Lendário",    cost: 4, desc: "Um Atributo pode chegar a Grau 6." },
  durodematar:      { label: "Duro de Matar",        cost: 4, desc: "Aguenta mais Ferimentos." },
  especialista:     { label: "Especialista",         cost: 4, desc: "Perícia predileta relança dados." },
  universidade:     { label: "Universidade",         cost: 4, desc: "Educação superior; muitas Perícias de saber." },
  academiaduelista: { label: "Academia Duelista",    cost: 5, desc: "Membro da Guilda; um Estilo Duelista." },
  genialidade:      { label: "Traço de Genialidade", cost: 5, desc: "Um lampejo de gênio por sessão." },
  sortedosdiabos:   { label: "Uma Sorte dos Diabos", cost: 5, desc: "Reroll de emergência; sobrevive ao impossível." },
};
