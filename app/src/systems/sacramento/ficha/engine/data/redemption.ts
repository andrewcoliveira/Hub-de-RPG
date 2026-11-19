// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Trilhas de Redenção (Capítulo 1)
//  Cada trilha tem uma premissa e 6 passos. Cumprir um passo dá uma
//  Carta de Sina. O último passo deve ser o último; os demais, em qualquer ordem.
//  Ao se redimir: +1 Habilidade, +2 Vida e +1 carta na Iniciativa.
// ══════════════════════════════════════════════════════════════════

export interface TrailDef {
  key: string;
  label: string;
  premise: string;
  steps: string[];
}

export const TRAILS: TrailDef[] = [
  { key: "fuga", label: "Fuga",
    premise: "Acabei de escapar (da cadeia/dos sagrados/de outra gangue). Há uma boa recompensa pela minha cabeça.",
    steps: [
      "Usar sua condição de procurado para ajudar a gangue.",
      "Causar problemas para minha gangue ao menos três vezes por ser procurado.",
      "Sacrificar (algo/alguém) importante para mim, em nome da minha liberdade.",
      "Livrar-me do pior caçador de recompensas que estiver atrás da minha cabeça.",
      "Juntar o dinheiro necessário para pagar o preço pela minha cabeça.",
      "Eliminar minha situação de procurado pagando a dívida ou lidando com as autoridades.",
    ] },
  { key: "vinganca", label: "Vingança",
    premise: "Preciso me vingar de (nome) que (assassinou/sequestrou) minha/meu (povo/família/terras).",
    steps: [
      "Causar problemas para minha gangue ao menos três vezes por causa da minha vingança.",
      "Encontrar e ajudar (nome), a última vítima de (nome de quem está se vingando).",
      "Ir até o último local onde (nome de quem está se vingando) foi avistado.",
      "Resolver outro problema que (nome de quem está se vingando) causou pelo caminho.",
      "Encontrar o paradeiro de (nome de quem está se vingando) e fazer o desafio para um duelo.",
      "Vencer o duelo e completar minha vingança.",
    ] },
  { key: "divida", label: "Dívida",
    premise: "Tenho uma dívida com um (mafioso/político) poderoso. Devo quitá-la ou pagarei com a vida.",
    steps: [
      "Esconder dinheiro da minha gangue para pagar minha dívida.",
      "Causar problemas para minha gangue ao menos três vezes por causa da minha dívida.",
      "Encontrar um trabalho que dê muito dinheiro, mas é muito mais arriscado do que o normal.",
      "Juntar o valor de metade da minha dívida, ou conseguir um desconto.",
      "(Roubar/enganar) alguém que eu amo para conseguir ainda mais dinheiro.",
      "Pagar minha dívida.",
    ] },
  { key: "remorso", label: "Remorso",
    premise: "Cometi um crime impensável contra (minha gangue/família/meu povo).",
    steps: [
      "Não (matar/roubar/andar a cavalo) como conduta punitiva para meu remorso.",
      "Causar problemas para minha gangue ao menos três vezes por causa do meu remorso.",
      "Reencontrar aqueles que sofreram por minha causa e fazer um serviço importante para eles.",
      "Encontrar uma forma de compensar (minha gangue/família/meu povo) pelo ato que cometi.",
      "Sacrificar as (minhas posses/vida atual/alguém importante) para conseguir o perdão.",
      "Expiar o remorso dentro de mim e viver com o coração mais leve.",
    ] },
  { key: "ambicao", label: "Ambição",
    premise: "Vou me tornar (maior/melhor/mais rápido) (duelista/jogador/bandido) que já pisou no Oeste Selvagem.",
    steps: [
      "Encontrar três outros (duelistas/jogadores/bandidos) para (duelar/jogar/enfrentar).",
      "Causar problemas para minha gangue ao menos três vezes por causa da minha ambição.",
      "Fazer ao menos três grandes (duelistas/jogadores/bandidos) conhecerem minha reputação.",
      "Perder alguém importante por causa da ambição. (Este passo não pode acontecer primeiro.)",
      "Fazer amizade com um (rival/xerife/bandido) que tem a mesma ambição que eu.",
      "Vencer o (duelo/jogo/combate) e me tornar (maior/melhor/mais rápido) do Oeste Selvagem.",
    ] },
  { key: "recomeco", label: "Recomeço",
    premise: "Já fui um grande (bandido/xerife/caçador) no passado, me aposentei e perdi minha honra.",
    steps: [
      "Realizar uma façanha que prove para minha gangue que eu ainda posso ser útil.",
      "Encontrar alguém do meu passado que ainda se lembre de minha reputação.",
      "Aprender ao menos 2 novas habilidades (isso pode ser conseguido com a evolução do personagem).",
      "Causar problemas para minha gangue ao menos três vezes pela minha busca por recomeço.",
      "Repetir duas façanhas tão épicas (roubos/salvamentos/capturas) quanto as que fiz no passado.",
      "Recuperar minha honra, glória e fama que tinha no passado.",
    ] },
];

export const CUSTOM_TRAIL = "propria";

/** "Siga os passos para criar uma trilha" — para a trilha própria. */
export const CUSTOM_TIPS = [
  "Crie um começo e um fim: qual é o problema e como é possível resolvê-lo de uma vez.",
  "Cause problemas para você e para sua gangue: a jornada precisa ter consequências para todos.",
  "Pense em algum sacrifício: algo ou alguém que você ama é deixado para trás.",
  "Pense em NPCs ou situações que possam ajudar — e no que eles podem querer em troca.",
  "O final não precisa ser feliz: se redimir é resolver um problema, mesmo com tragédia.",
];

export const trailIndex = new Map(TRAILS.map((t) => [t.key, t]));
export const isTrailKey = (k: unknown): k is string => k === CUSTOM_TRAIL || (typeof k === "string" && trailIndex.has(k));
