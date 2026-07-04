// Porte de SM_BACKGROUNDS (scripts/setimo-mar/data-core.js) — FORMAÇÕES
// Cada Formação dá: 1 Peculiaridade (quirk), 1 Vantagem grátis, e Perícias
// em Grau 1. Escolha DUAS. Perícias/Vantagens duplicadas: ver regra na UI.
// «curado»: perícias e vantagem grátis atribuídas por tema; confira no livro.
import type { BackgroundDef } from "../types";

export const BACKGROUNDS: Record<string, BackgroundDef> = {
  ator:        { label: "Ator",         quirk: "Ganhe 1 Ponto Heroico quando encenar uma identidade falsa convincente.", skills: ["atuar","convencer","observar"], freeAdvantage: "linguista" },
  aristocrata: { label: "Aristocrata",  quirk: "Ganhe 1 Ponto Heroico quando usar seu status para abrir uma porta que o povo não abriria.", skills: ["convencer","erudicao","cavalgar"], freeAdvantage: "rico" },
  arqueologo:  { label: "Arqueólogo",   quirk: "Ganhe 1 Ponto Heroico quando arriscar tudo por uma relíquia Syrneth.", skills: ["erudicao","atletismo","observar"], freeAdvantage: "sensodirecao" },
  assassino:   { label: "Assassino",    quirk: "Ganhe 1 Ponto Heroico quando eliminar um alvo sem ser visto.", skills: ["armas","esconder","atletismo"], freeAdvantage: "reflexos" },
  cacador:     { label: "Caçador",      quirk: "Ganhe 1 Ponto Heroico quando rastrear uma presa por terreno hostil.", skills: ["mirar","observar","atletismo"], freeAdvantage: "sensodirecao" },
  capitaomar:  { label: "Capitão do Mar",quirk: "Ganhe 1 Ponto Heroico quando arriscar o navio pela tripulação.", skills: ["navegar","arteguerra","intimidar"], freeAdvantage: "lideranca" },
  criminoso:   { label: "Criminoso",    quirk: "Ganhe 1 Ponto Heroico quando quebrar a lei por um código pessoal.", skills: ["furto","esconder","intimidar"], freeAdvantage: "contato" },
  duelista:    { label: "Duelista",     quirk: "Ganhe 1 Ponto Heroico quando aceitar um duelo em desvantagem por honra.", skills: ["armas","atletismo","intimidar"], freeAdvantage: "esgrimista" },
  espiao:      { label: "Espião",       quirk: "Ganhe 1 Ponto Heroico quando obter um segredo sob disfarce.", skills: ["esconder","observar","convencer"], freeAdvantage: "contato" },
  explorador:  { label: "Explorador",   quirk: "Ganhe 1 Ponto Heroico quando for o primeiro a pisar em terra desconhecida.", skills: ["navegar","atletismo","observar"], freeAdvantage: "sensodirecao" },
  marinheiro:  { label: "Marinheiro",   quirk: "Ganhe 1 Ponto Heroico quando salvar o dia com uma manobra náutica.", skills: ["navegar","atletismo","briga"], freeAdvantage: "equilibriomar" },
  medico:      { label: "Médico",       quirk: "Ganhe 1 Ponto Heroico quando salvar uma vida arriscando a própria.", skills: ["erudicao","empatia","observar"], freeAdvantage: "universidade" },
  mercador:    { label: "Mercador",     quirk: "Ganhe 1 Ponto Heroico quando fechar um negócio impossível.", skills: ["convencer","erudicao","empatia"], freeAdvantage: "rico" },
  mercenario:  { label: "Mercenário",   quirk: "Ganhe 1 Ponto Heroico quando cumprir um contrato mesmo custando caro.", skills: ["armas","arteguerra","intimidar"], freeAdvantage: "durodematar" },
  oficial:     { label: "Oficial",      quirk: "Ganhe 1 Ponto Heroico quando liderar pelo exemplo sob fogo.", skills: ["arteguerra","convencer","cavalgar"], freeAdvantage: "lideranca" },
  orfao:       { label: "Órfão",        quirk: "Ganhe 1 Ponto Heroico quando sobreviver pela astúcia de rua.", skills: ["furto","esconder","atletismo"], freeAdvantage: "sortedosdiabos" },
  pirata:      { label: "Pirata",       quirk: "Ganhe 1 Ponto Heroico quando escolher a liberdade acima do ouro.", skills: ["navegar","armas","intimidar"], freeAdvantage: "equilibriomar" },
  sacerdote:   { label: "Sacerdote",    quirk: "Ganhe 1 Ponto Heroico quando confortar alguém pela fé em vez da força.", skills: ["convencer","erudicao","empatia"], freeAdvantage: "linguista" },
  soldado:     { label: "Soldado",      quirk: "Ganhe 1 Ponto Heroico quando manter a formação diante do medo.", skills: ["armas","atletismo","arteguerra"], freeAdvantage: "espiritovaloroso" },
  espadachim:  { label: "Espadachim Errante", quirk: "Ganhe 1 Ponto Heroico quando defender um inocente que não pode pagar.", skills: ["armas","cavalgar","convencer"], freeAdvantage: "esgrimista" },
};
