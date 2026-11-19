// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — Habilidades (Capítulo 1)
//  30 Habilidades em duas listas: de Combate e de Profissão.
//  Dano: "V" = Círculos de Vida, "D" = Círculos de Dor.
// ══════════════════════════════════════════════════════════════════

export type SkillList = "combate" | "profissao";

export interface SkillDef {
  key: string;
  name: string;
  list: SkillList;
  desc: string;
  /** Efeito que melhora com o nível (as tabelas do livro). */
  scale?: { title: string; rows: { level: number; value: string }[] };
  repeatable?: boolean;
  /** Requisito: Intelecto e Violência máximos (Sorte dos Covardes). */
  limit?: { intelecto: number; violencia: number };
}

const tier = (title: string, a: string, b: string, c: string) => ({
  title, rows: [{ level: 1, value: a }, { level: 3, value: b }, { level: 6, value: c }],
});

export const SKILLS: SkillDef[] = [
  // ── Combate ──
  { key: "armas-da-natureza", name: "Armas da Natureza", list: "combate",
    desc: "Lutando com armas rústicas (facas de pedra, lanças de madeira, machadinhas e armas rudimentares), o dano do ataque aumenta em 1 Vida para cada ponto em Físico." },
  { key: "ataque-sacana", name: "Ataque Sacana", list: "combate",
    desc: "Um ataque surpresa com facas, navalhas ou qualquer lâmina oculta causa dano adicional.",
    scale: tier("Dano adicional", "+1 Vida", "+2 Vida", "+3 Vida") },
  { key: "briga-de-bar", name: "Briga de Bar", list: "combate",
    desc: "Você improvisa armas com o que estiver na frente. Objetos pequenos e médios causam 3 Dor; objetos grandes causam 1 Vida, mas os Testes de Violência têm –1." },
  { key: "coldre-de-sabao", name: "Coldre de Sabão", list: "combate",
    desc: "Na Iniciativa, você puxa duas cartas e escolhe a que quiser, a maior ou a menor." },
  { key: "dedo-quente", name: "Dedo Quente", list: "combate",
    desc: "Atirando com revólver, você recebe +1 nos Testes de Violência. Contra alvos sem cobertura, o dano dos tiros aumenta.",
    scale: tier("Dano adicional", "+1 Vida", "+2 Vida", "+3 Vida") },
  { key: "furia-dos-aflitos", name: "Fúria dos Aflitos", list: "combate",
    desc: "Em combate, sua Defesa cai 1 ponto e o dano dos seus ataques corpo a corpo aumenta em 3 Dor." },
  { key: "gatilho-furioso", name: "Gatilho Furioso", list: "combate",
    desc: "Martelando o cão, você dispara dois tiros na mesma Ação de Combate, gastando também um Movimento. Com mais Ações e Movimentos, pode seguir atirando até o revólver descarregar." },
  { key: "livramento", name: "Livramento", list: "combate",
    desc: "Quando riscar todos os seus Círculos de Vida, caia no chão e recupere 2 Vida. Se cair outra vez no mesmo combate, faça o Teste de Morte normalmente." },
  { key: "marretada", name: "Marretada", list: "combate",
    desc: "Lutando de mãos vazias, o dano dos seus ataques desarmados aumenta em +1 Dor para cada ponto em Físico." },
  { key: "parrudeza", name: "Parrudeza", list: "combate", repeatable: true,
    desc: "Difícil de morrer e duro de matar: some 2 à sua Vida. Pode ser escolhida várias vezes." },
  { key: "punhos-do-oriente", name: "Punhos do Oriente", list: "combate",
    desc: "Você pode usar seus Movimentos para realizar ataques desarmados." },
  { key: "quebra-ossos", name: "Quebra-Ossos", list: "combate",
    desc: "Golpes de luta livre (agarrões, arremessos, suplex) gastando um Movimento e uma Ação de Combate. Escolha imobilizar o oponente ou potencializar o dano.",
    scale: tier("Dano do golpe", "1 Vida + 1 Dor", "1 Vida + 2 Dor", "2 Vida + 3 Dor") },
  { key: "sorte-dos-covardes", name: "Sorte dos Covardes", list: "combate", limit: { intelecto: 1, violencia: 2 },
    desc: "No começo do combate, puxe uma carta; o efeito dura até o fim do combate: ♣ +2 Ações de Combate · ♥ +2 Vida · ♠ +2 Movimentos · ♦ +1 nos Testes de Violência. Deixa de funcionar com mais de 1 em Intelecto ou 2 em Violência, mesmo em níveis altos." },
  { key: "valei-me", name: "Valei-me", list: "combate",
    desc: "Improvise explosivos com o que tiver em mãos (Teste de Tradição NA 7). Em combate, cada explosivo também custa 2 Ações de Combate e um Movimento.",
    scale: tier("Dano do explosivo", "2 Vida", "3 Vida", "4 Vida") },
  { key: "zoi-de-gaviao", name: "Zói de Gavião", list: "combate",
    desc: "Atirando com fuzil ou arco longo, você recebe +1 nos Testes de Violência. Em posição vantajosa, o dano dos disparos aumenta.",
    scale: tier("Dano adicional", "+1 Vida", "+2 Vida", "+3 Vida") },

  // ── Profissão ──
  { key: "as-na-manga", name: "Às na Manga", list: "profissao",
    desc: "Em Testes envolvendo jogos de cartas, role 2d6 e use o melhor dado." },
  { key: "boca-na-botija", name: "Boca na Botija", list: "profissao",
    desc: "Em Testes de Atenção, role 2d6 e use o melhor. Sua Defesa não é reduzida por ficar surpreso antes do combate." },
  { key: "cancao-da-emocao", name: "Canção da Emoção", list: "profissao",
    desc: "Uma vez por sessão, gaste duas Ações de Combate por PJ para conceder um bônus a eles; benefícios adicionais custam mais duas Ações por PJ cada.",
    scale: { title: "Bônus concedidos", rows: [
      { level: 1, value: "+1 Movimento" }, { level: 3, value: "+1 Ação de Combate" },
      { level: 4, value: "+1 em Violência" }, { level: 6, value: "+3 Vida temporários" },
    ] } },
  { key: "chamego", name: "Chamego", list: "profissao",
    desc: "Ao testar para laçar algo ou alguém, role 2d6 e use o melhor. Quem tenta se soltar do seu laço tem –1 nos Testes." },
  { key: "cuspe-e-cola", name: "Cuspe e Cola", list: "profissao",
    desc: "O único jeito de curar no meio do combate: colado no paciente, gaste 2 Ações de Combate para cada Vida curada.",
    scale: tier("Usos por combate", "1", "2", "4") },
  { key: "fogo-no-ceu", name: "Fogo no Céu", list: "profissao",
    desc: "Em Testes envolvendo explosivos, role 2d6 e use o melhor. Você não explode os próprios miolos numa falha crítica." },
  { key: "fumaca-na-agua", name: "Fumaça na Água", list: "profissao",
    desc: "Em Testes de Roubo para afanar, se esconder ou caminhar em silêncio, role 2d6 e use o melhor." },
  { key: "galope-certeiro", name: "Galope Certeiro", list: "profissao",
    desc: "Em Testes de Montaria no lombo do seu próprio cavalo, role 2d6 e use o melhor. Ignora a penalidade em outros animais não familiares." },
  { key: "nao-vai-doer-nadinha", name: "Não Vai Doer Nadinha", list: "profissao",
    desc: "Em Testes de Medicina, role 2d6 e use o melhor. Sua cura adicional aumenta com o nível.",
    scale: tier("Cura adicional", "+1 Vida", "+2 Vida", "+4 Vida") },
  { key: "natural-da-natureza", name: "Natural da Natureza", list: "profissao",
    desc: "Em Testes de Suor, role 2d6 e use o melhor. Não precisa testar para encontrar plantas, ervas e abrigo em territórios selvagens." },
  { key: "sabia-imperatriz", name: "Sabiá Imperatriz", list: "profissao",
    desc: "Em Testes de Negócios, role 2d6 e use o melhor." },
  { key: "sabugos-e-peconhas", name: "Sabugos e Peçonhas", list: "profissao",
    desc: "Seus venenos causam 1 Dor a cada ação feita pelo alvo envenenado, até o veneno ser curado, resistido ou o alvo desmaiar." },
  { key: "salve-se-quem-puder", name: "Salve-se Quem Puder", list: "profissao",
    desc: "Em qualquer Teste para escapar ou fugir, role 2d6 e use o melhor. Em fugas, recebe +1 Movimento que só serve para dar no pé (nunca num duelo)." },
  { key: "sorrisao-chapeu-na-mao", name: "Sorrisão, Chapéu na Mão", list: "profissao",
    desc: "Comprando ou vendendo itens comuns (não especiais ou raros), você compra com 25% de desconto e vende 25% mais caro." },
  { key: "zoi-de-coruja", name: "Zói de Coruja", list: "profissao",
    desc: "Em Testes de Tradição para lembrar de algum conhecimento, role 2d6 e use o melhor." },
];

export const skillIndex = new Map(SKILLS.map((s) => [s.key, s]));
export const isSkillKey = (k: unknown): k is string => typeof k === "string" && skillIndex.has(k);

/** Linha da tabela de nível que vale para o nível atual. */
export function scaleAt(def: SkillDef, level: number): string | null {
  if (!def.scale) return null;
  const rows = def.scale.rows.filter((r) => r.level <= level);
  if (!rows.length) return null;
  // Canção da Emoção acumula bônus; as outras tabelas trocam o valor
  if (def.key === "cancao-da-emocao") return rows.map((r) => r.value).join(", ");
  return rows[rows.length - 1].value;
}
