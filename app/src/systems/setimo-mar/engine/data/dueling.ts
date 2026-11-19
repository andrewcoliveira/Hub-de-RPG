// Porte de SM_DUELING_STYLES e SM_MANEUVERS (scripts/setimo-mar/data-dueling.js)
// 7º MAR — Estilos de Duelo e Manobras (dados curados de Sistema-Regras 1.9)
// nota: curado — conteúdo resumido para revisão; expandir com o texto completo do vault quando necessário.
import type { DuelingStyleDef, ManeuverDef } from "../types";

export const DUELING_STYLES: Record<string, DuelingStyleDef> = {
  aldana: {
    label: "Aldana",
    nacao: "Castilha",
    bonus: "Estilo defensivo: ganha Apostas extras ao Manter Distância e ao Parar.",
  },
  ambrogia: {
    label: "Ambrogia",
    nacao: "Vodacce",
    bonus: "Usa a mão livre para desarmar; converte uma Parada bem-sucedida em desarme.",
  },
  boucher: {
    label: "Boucher",
    nacao: "Montaigne",
    bonus: "Estilo teatral e brutal: cada Ferimento causado impressiona testemunhas (Reputação).",
  },
  donovan: {
    label: "Donovan",
    nacao: "Avalon (guarda-costas)",
    bonus: "Foco em proteger terceiros: pode sofrer o Ferimento de um aliado próximo no lugar dele.",
  },
  drexel: {
    label: "Drexel",
    nacao: "Eisen",
    bonus: "Estilo cru e eficiente: Apostas gastas em dano nunca são desperdiçadas (arredondam a favor).",
  },
  eisenfaust: {
    label: "Eisenfaust",
    nacao: "Eisen",
    bonus: "Punhos e armas curtas: soma Vigor ao dano de Manobras de combate corpo a corpo.",
  },
  leegstra: {
    label: "Leegstra",
    nacao: "Vesten",
    bonus: "Estilo agressivo: ao atacar primeiro na cena, ganha uma Aposta extra na primeira Manobra.",
  },
  mantovani: {
    label: "Mantovani",
    nacao: "Vodacce (chicote)",
    bonus: "Luta a distância com chicote: pode Aparar e Ripostar sem trocar de arma.",
  },
  mireli: {
    label: "Mireli",
    nacao: "Ussura",
    bonus: "Estilo selvagem e imprevisível: uma vez por duelo, ignora o resultado de uma Parada do oponente.",
  },
  sabat: {
    label: "Sabat",
    nacao: "Sabre (comunidade sármata)",
    bonus: "Golpes de sabre em movimento: ganha Apostas extras ao se mover e atacar na mesma Manobra.",
  },
  torres: {
    label: "Torres",
    nacao: "Castilha (rapieira e capa)",
    bonus: "Rapieira e capa: a capa pode ser usada para cegar o oponente ou anular uma Aposta dele.",
  },
  valroux: {
    label: "Valroux",
    nacao: "Montaigne",
    bonus: "Humilha o oponente e trava suas Manobras.",
  },
};

export const MANEUVERS: ManeuverDef[] = [
  { nome: "Cutilada", efeito: "Gasta 1 Aposta; dano básico de arma, a Manobra mais simples de um duelo." },
  { nome: "Parada", efeito: "Gasta 1 Aposta para anular uma Manobra de ataque do oponente." },
  { nome: "Finta", efeito: "Gasta 1 Aposta; força o oponente a gastar 2 Apostas para Parar." },
  { nome: "Estocada", efeito: "Gasta todas as Apostas restantes; dano não anulável." },
  { nome: "Batida", efeito: "Gasta 1 Aposta; desarma ou desequilibra, retirando uma Aposta do oponente." },
  { nome: "Resposta", efeito: "Só pode ser usada logo após uma Parada bem-sucedida; converte a defesa em ataque imediato." },
];
