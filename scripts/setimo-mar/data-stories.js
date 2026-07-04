// ══════════════════════════════════════════════════════════════════
//  7º MAR — DADOS: Pontos de Partida de Histórias Heroicas
//  nota: "curado" — conteúdo condensado a partir do Sistema-Regras (vault),
//  revisar contra o livro-base antes de publicar.
// ══════════════════════════════════════════════════════════════════

const SM_STORY_PRESETS = {
  amnesia: {
    label: "Amnésia",
    final: "Recuperar a memória perdida e reconciliar-se com quem você era.",
    primeiroPasso: "Encontrar alguém que o conhecia antes de tudo começar.",
  },
  amorperdido: {
    label: "Amor Perdido",
    final: "Reencontrar (ou deixar partir de vez) o amor que lhe foi tirado.",
    primeiroPasso: "Descobrir o paradeiro do ser amado.",
  },
  cacada: {
    label: "Caçada",
    final: "Capturar ou abater a presa que se tornou obsessão.",
    primeiroPasso: "Levantar o primeiro rastro da presa.",
  },
  maldicao: {
    label: "Maldição",
    final: "Livrar-se (ou aceitar) a maldição que pesa sobre você.",
    primeiroPasso: "Descobrir a origem exata da maldição.",
  },
  obrigacao: {
    label: "Obrigação",
    final: "Cumprir o dever que jurou honrar, custe o que custar.",
    primeiroPasso: "Identificar o que exatamente a obrigação exige.",
  },
  rivalidade: {
    label: "Rivalidade",
    final: "Superar de vez seu rival, numa prova que ninguém esquecerá.",
    primeiroPasso: "Encontrar o rival e lançar o primeiro desafio.",
  },
  romance: {
    label: "Romance",
    final: "Conquistar (ou perder para sempre) o coração desejado.",
    primeiroPasso: "Criar uma oportunidade de aproximação.",
  },
  vendeta: {
    label: "Vendeta",
    final: "Fazer justiça com as próprias mãos contra quem lhe tirou tudo.",
    primeiroPasso: "Descobrir quem foi o responsável.",
  },
};

Object.assign(window, { SM_STORY_PRESETS });
