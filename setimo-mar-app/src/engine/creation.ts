// Porte de SM_CREATION (scripts/setimo-mar/data-core.js)
// Orçamentos de criação (Sistema-Regras 1.8 / Kit-de-Criacao §1)
import type { Creation } from "./types";

export const CREATION: Creation = {
  traitBase: 2,        // todo Atributo começa em Grau 2
  traitFree: 2,        // pontos livres para distribuir
  traitNation: 1,      // +1 do bônus de Nação (num de dois Atributos à escolha)
  traitMax: 5,         // teto por Atributo (3 é o comum na criação; 5 é o teto do jogo)
  traitCreationMax: 4, // teto prático na criação com os pontos disponíveis
  skillPoints: 10,     // Pontos de Perícia (1 ponto = 1 Grau)
  skillCreationMax: 3, // nenhuma Perícia acima de Grau 3 na criação
  advantagePoints: 5,  // pontos de Vantagem (além das grátis das Formações)
  backgroundsToPick: 2,
};
