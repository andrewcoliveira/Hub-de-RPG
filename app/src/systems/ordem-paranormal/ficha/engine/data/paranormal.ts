// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Poderes paranormais (Capítulo 5)
//  Recebidos ao Transcender (poder de classe) e pela origem Cultista
//  Arrependido. "Conhecimento 1" = já possuir outro poder de Conhecimento.
// ══════════════════════════════════════════════════════════════════

import type { AffinityElement } from "./elements";

export interface ParanormalDef {
  id: string;
  name: string;
  /** null: o elemento depende da escolha (Aprender Ritual, Resistir a Elemento). */
  element: AffinityElement | null;
  desc: string;
  affinity?: string;
  /** Pré-requisito: quantidade de outros poderes do mesmo elemento. */
  needs?: number;
  /** Pede uma escolha: um ritual (Aprender Ritual), um elemento (Resistir) ou um poder de outra classe (Expansão). */
  choice?: "ritual" | "element" | "class-power";
  repeatable?: boolean;
}

export const PARANORMAL_POWERS: ParanormalDef[] = [
  { id: "aprender-ritual", name: "Aprender Ritual", element: null, choice: "ritual", repeatable: true,
    desc: "Você aprende e pode conjurar um ritual de 1º círculo à sua escolha (até 2º círculo a partir de NEX 45% e até 3º a partir de 75%). Está sujeito ao limite de rituais conhecidos (igual ao Intelecto). Conta como um poder do elemento do ritual." },
  { id: "resistir-a-elemento", name: "Resistir a Elemento", element: null, choice: "element",
    desc: "Escolha entre Conhecimento, Energia, Morte ou Sangue. Você recebe resistência 10 contra esse elemento. Conta como um poder do elemento escolhido.",
    affinity: "Aumenta a resistência para 20." },

  // Conhecimento
  { id: "expansao-de-conhecimento", name: "Expansão de Conhecimento", element: "conhecimento", needs: 1, choice: "class-power",
    desc: "Você aprende um poder de classe que não pertença à sua classe (cumprindo seus pré-requisitos).",
    affinity: "Você aprende um segundo poder de classe que não pertença à sua classe." },
  { id: "percepcao-paranormal", name: "Percepção Paranormal", element: "conhecimento",
    desc: "Em cenas de investigação, sempre que fizer um teste para procurar pistas, pode rolar novamente um dado com resultado menor que 10 (e deve aceitar a nova rolagem).",
    affinity: "Pode rolar novamente até dois dados com resultado menor que 10." },
  { id: "precognicao", name: "Precognição", element: "conhecimento", needs: 1,
    desc: "Você possui um “sexto sentido” que o avisa do perigo. Recebe +2 em Defesa e em testes de resistência.",
    affinity: "Você fica imune à condição desprevenido." },
  { id: "sensitivo", name: "Sensitivo", element: "conhecimento",
    desc: "Você sente emoções e intenções de outros seres, recebendo +5 em testes de Diplomacia, Intimidação e Intuição.",
    affinity: "Quando faz um teste oposto usando uma dessas perícias, o oponente sofre –1d20." },
  { id: "visao-do-oculto", name: "Visão do Oculto", element: "conhecimento",
    desc: "Você enxerga pela percepção do Conhecimento: recebe +5 em testes de Percepção e enxerga no escuro.",
    affinity: "Você ignora camuflagem." },

  // Energia
  { id: "afortunado", name: "Afortunado", element: "energia",
    desc: "Uma vez por rolagem, você pode rolar novamente um resultado 1 em qualquer dado que não seja d20.",
    affinity: "Além disso, uma vez por teste, pode rolar novamente um resultado 1 em d20." },
  { id: "campo-protetor", name: "Campo Protetor", element: "energia", needs: 1,
    desc: "Quando usa a ação esquiva, pode gastar 1 PE para receber +5 em Defesa.",
    affinity: "Também recebe +5 em Reflexos e, até seu próximo turno, não sofre dano ao passar em um teste de Reflexos que reduziria o dano à metade." },
  { id: "causalidade-fortuita", name: "Causalidade Fortuita", element: "energia",
    desc: "Em cenas de investigação, a DT para procurar pistas diminui em –5 para você até você encontrar uma pista.",
    affinity: "A DT para procurar pistas sempre diminui em –5 para você." },
  { id: "golpe-de-sorte", name: "Golpe de Sorte", element: "energia", needs: 1,
    desc: "Seus ataques recebem +1 na margem de ameaça.",
    affinity: "Seus ataques recebem +1 no multiplicador de crítico." },
  { id: "manipular-entropia", name: "Manipular Entropia", element: "energia", needs: 1,
    desc: "Quando outro ser em alcance curto faz um teste de perícia, você pode gastar 2 PE para fazê-lo rolar novamente um dos dados desse teste.",
    affinity: "O alvo rola novamente todos os dados que você escolher." },

  // Morte
  { id: "encarar-a-morte", name: "Encarar a Morte", element: "morte",
    desc: "Durante cenas de ação, seu limite de gasto de PE aumenta em +1 (não afeta a DT de seus efeitos).",
    affinity: "O limite aumenta em +2 (total de +3)." },
  { id: "escapar-da-morte", name: "Escapar da Morte", element: "morte", needs: 1,
    desc: "Uma vez por cena, quando receber dano que o deixaria com 0 PV, você fica com 1 PV. Não funciona contra dano massivo.",
    affinity: "Em vez disso, evita completamente o dano. Em caso de dano massivo, fica com 1 PV." },
  { id: "potencial-aprimorado", name: "Potencial Aprimorado", element: "morte",
    desc: "Você recebe +1 ponto de esforço por NEX (que aumenta conforme sobe de NEX).",
    affinity: "Você recebe +1 PE adicional por NEX (total de +2 PE por NEX)." },
  { id: "potencial-reaproveitado", name: "Potencial Reaproveitado", element: "morte",
    desc: "Uma vez por rodada, quando passa num teste de resistência, ganha 2 PE temporários cumulativos, que desaparecem no fim da cena.",
    affinity: "Você ganha 3 PE temporários, em vez de 2." },
  { id: "surto-temporal", name: "Surto Temporal", element: "morte", needs: 2,
    desc: "Uma vez por cena, durante seu turno, você pode gastar 3 PE para realizar uma ação padrão adicional.",
    affinity: "Pode usar este poder uma vez por turno, em vez de uma vez por cena." },

  // Sangue
  { id: "anatomia-insana", name: "Anatomia Insana", element: "sangue", needs: 2,
    desc: "Você tem 50% de chance (resultado par em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo.",
    affinity: "Você é imune aos efeitos de acertos críticos e ataques furtivos." },
  { id: "arma-de-sangue", name: "Arma de Sangue", element: "sangue",
    desc: "Ação de movimento e 2 PE para produzir garras, chifres ou uma lâmina de sangue: arma simples, corpo a corpo e leve, que causa 1d6 de dano de Sangue. Uma vez por turno, ao agredir, pode gastar 1 PE para um ataque adicional com ela. Dura até o fim da cena.",
    affinity: "A arma se torna parte permanente de você e causa 1d10 de dano de Sangue." },
  { id: "sangue-de-ferro", name: "Sangue de Ferro", element: "sangue",
    desc: "Você recebe +2 pontos de vida por NEX (que aumentam conforme sobe de NEX).",
    affinity: "Você recebe +5 em Fortitude e se torna imune a venenos e doenças." },
  { id: "sangue-fervente", name: "Sangue Fervente", element: "sangue", needs: 2,
    desc: "Enquanto estiver machucado, você recebe +1 em Agilidade ou Força, à sua escolha (escolha sempre que o efeito for ativado).",
    affinity: "O bônus aumenta para +2." },
  { id: "sangue-vivo", name: "Sangue Vivo", element: "sangue", needs: 1,
    desc: "Na primeira vez que ficar machucado em uma cena, recebe cura acelerada 2 (nunca acima da metade dos PV máximos). Termina no fim da cena ou se deixar de estar machucado.",
    affinity: "A cura acelerada aumenta para 5." },
];

export const paranormalIndex = new Map(PARANORMAL_POWERS.map((p) => [p.id, p]));
export const isParanormalId = (k: unknown): k is string => typeof k === "string" && paranormalIndex.has(k);
