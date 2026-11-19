// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Origens (Capítulo 1, Tabela 1.1)
//  Cada origem concede duas perícias treinadas e um poder.
// ══════════════════════════════════════════════════════════════════

export interface OriginDef {
  key: string;
  label: string;
  desc: string;
  /** Perícias treinadas. Vazio = "duas à escolha do mestre" (Amnésico). */
  skills: string[];
  /** Especialização de Profissão sugerida pela origem (Chef). */
  profession?: string;
  power: { name: string; desc: string };
  /** Faixa na rolagem de 2d20 (Tabela 1.1). */
  roll: [number, number];
}

export const ORIGINS: OriginDef[] = [
  { key: "academico", label: "Acadêmico", roll: [2, 8], skills: ["Ciências", "Investigação"],
    desc: "Pesquisador ou professor universitário cujos estudos tocaram em assuntos misteriosos.",
    power: { name: "Saber é Poder", desc: "Quando faz um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste." } },
  { key: "agente-de-saude", label: "Agente de Saúde", roll: [9, 10], skills: ["Intuição", "Medicina"],
    desc: "Enfermeiro, farmacêutico, médico, psicólogo ou socorrista treinado no cuidado de pessoas.",
    power: { name: "Técnica Medicinal", desc: "Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados." } },
  { key: "amnesico", label: "Amnésico", roll: [11, 11], skills: [],
    desc: "Você perdeu a maior parte da memória; hoje a Ordem é a única família que conhece.",
    power: { name: "Vislumbres do Passado", desc: "Uma vez por sessão, pode fazer um teste de Intelecto (DT 10) para reconhecer pessoas ou lugares de antes da amnésia. Se passar, recebe 1d4 PE temporários e, a critério do mestre, uma informação útil." } },
  { key: "artista", label: "Artista", roll: [12, 13], skills: ["Artes", "Enganação"],
    desc: "Ator, músico, escritor, dançarino, influenciador… talvez inspirado por uma experiência paranormal.",
    power: { name: "Magnum Opus", desc: "Uma vez por missão, pode determinar que uma pessoa em uma cena de interação o reconheça. Você recebe +5 em testes de Presença e de perícias baseadas em Presença contra ela." } },
  { key: "atleta", label: "Atleta", roll: [14, 15], skills: ["Acrobacia", "Atletismo"],
    desc: "Você competia em um esporte individual ou coletivo.",
    power: { name: "110%", desc: "Quando faz um teste de perícia usando Força ou Agilidade (exceto Luta e Pontaria), pode gastar 2 PE para receber +5 nesse teste." } },
  { key: "chef", label: "Chef", roll: [16, 16], skills: ["Fortitude", "Profissão"], profession: "cozinheiro",
    desc: "Cozinheiro amador ou profissional. Os outros agentes adoram quando você vai para a missão!",
    power: { name: "Ingrediente Secreto", desc: "Em cenas de interlúdio, pode fazer a ação alimentar-se para cozinhar um prato especial. Você e os membros do grupo que se alimentaram recebem o benefício de dois pratos (se o mesmo for escolhido duas vezes, os efeitos se acumulam)." } },
  { key: "criminoso", label: "Criminoso", roll: [17, 17], skills: ["Crime", "Furtividade"],
    desc: "Você vivia fora da lei, de batedor de carteiras a membro de uma facção criminosa.",
    power: { name: "O Crime Compensa", desc: "No final de uma missão, escolha um item encontrado nela. Na próxima missão, pode incluí-lo no inventário sem que conte no limite de itens por patente." } },
  { key: "cultista-arrependido", label: "Cultista Arrependido", roll: [18, 18], skills: ["Ocultismo", "Religião"],
    desc: "Você fez parte de um culto paranormal, mas algo abriu seus olhos e agora luta pelo lado certo.",
    power: { name: "Traços do Outro Lado", desc: "Você possui um poder paranormal à sua escolha. Porém, começa o jogo com metade da Sanidade normal para sua classe." } },
  { key: "desgarrado", label: "Desgarrado", roll: [19, 19], skills: ["Fortitude", "Sobrevivência"],
    desc: "Eremita, pessoa em situação de rua ou alguém que abandonou a rotina após descobrir o paranormal.",
    power: { name: "Calejado", desc: "Você recebe +1 PV para cada 5% de NEX." } },
  { key: "engenheiro", label: "Engenheiro", roll: [20, 20], skills: ["Profissão", "Tecnologia"],
    desc: "Engenheiro profissional ou inventor de garagem que talvez tenha criado um dispositivo paranormal.",
    power: { name: "Ferramenta Favorita", desc: "Um item a sua escolha (exceto armas) conta como uma categoria abaixo." } },
  { key: "executivo", label: "Executivo", roll: [21, 21], skills: ["Diplomacia", "Profissão"],
    desc: "Administrador, advogado, contador… até descobrir algo que não devia sobre a empresa.",
    power: { name: "Processo Otimizado", desc: "Sempre que faz um teste de perícia durante um teste estendido, ou uma ação para revisar documentos, pode pagar 2 PE para receber +5 nesse teste." } },
  { key: "investigador", label: "Investigador", roll: [22, 23], skills: ["Investigação", "Percepção"],
    desc: "Perito forense, policial federal ou detetive particular.",
    power: { name: "Faro para Pistas", desc: "Uma vez por cena, quando fizer um teste para procurar pistas, você pode gastar 1 PE para receber +5 nesse teste." } },
  { key: "lutador", label: "Lutador", roll: [24, 24], skills: ["Luta", "Reflexos"],
    desc: "Praticante de arte marcial, esporte de luta ou briga de rua.",
    power: { name: "Mão Pesada", desc: "Você recebe +2 em rolagens de dano com ataques corpo a corpo." } },
  { key: "magnata", label: "Magnata", roll: [25, 25], skills: ["Diplomacia", "Pilotagem"],
    desc: "Você possui muito dinheiro ou patrimônio.",
    power: { name: "Patrocinador da Ordem", desc: "Seu limite de crédito é sempre considerado um acima do atual." } },
  { key: "mercenario", label: "Mercenário", roll: [26, 26], skills: ["Iniciativa", "Intimidação"],
    desc: "Soldado de aluguel, sozinho ou como parte de uma organização militar privada.",
    power: { name: "Posição de Combate", desc: "No primeiro turno de cada cena de ação, você pode gastar 2 PE para receber uma ação de movimento adicional." } },
  { key: "militar", label: "Militar", roll: [27, 27], skills: ["Pontaria", "Tática"],
    desc: "Você serviu em uma força militar e treinou muito com armas de fogo.",
    power: { name: "Para Bellum", desc: "Você recebe +2 em rolagens de dano com armas de fogo." } },
  { key: "operario", label: "Operário", roll: [28, 28], skills: ["Fortitude", "Profissão"],
    desc: "Pedreiro, industriário, operador de máquinas… um emprego braçal e uma visão pragmática.",
    power: { name: "Ferramenta de Trabalho", desc: "Escolha uma arma simples ou tática que poderia ser usada como ferramenta em sua profissão. Você sabe usá-la e recebe +1 em testes de ataque, rolagens de dano e margem de ameaça com ela." } },
  { key: "policial", label: "Policial", roll: [29, 30], skills: ["Percepção", "Pontaria"],
    desc: "Membro de uma força de segurança pública, civil ou militar.",
    power: { name: "Patrulha", desc: "Você recebe +2 em Defesa." } },
  { key: "religioso", label: "Religioso", roll: [31, 31], skills: ["Religião", "Vontade"],
    desc: "Devoto ou sacerdote de uma fé, dedicado a auxiliar pessoas com problemas espirituais.",
    power: { name: "Acalentar", desc: "Você recebe +5 em testes de Religião para acalmar. Quando acalma uma pessoa, ela recebe 1d6 + sua Presença pontos de Sanidade." } },
  { key: "servidor-publico", label: "Servidor Público", roll: [32, 32], skills: ["Intuição", "Vontade"],
    desc: "Carreira em um órgão do governo, até ver o que os representantes do povo faziam à noite.",
    power: { name: "Espírito Cívico", desc: "Sempre que faz um teste para ajudar, você pode gastar 1 PE para aumentar o bônus concedido em +2." } },
  { key: "teorico-da-conspiracao", label: "Teórico da Conspiração", roll: [33, 33], skills: ["Investigação", "Ocultismo"],
    desc: "Você sempre soube que tudo isso existia — e investigou a fundo.",
    power: { name: "Eu Já Sabia", desc: "Você recebe resistência a dano mental igual ao seu Intelecto." } },
  { key: "ti", label: "T.I.", roll: [34, 34], skills: ["Investigação", "Tecnologia"],
    desc: "Programador, engenheiro de software ou simplesmente “o cara da T.I.”.",
    power: { name: "Motor de Busca", desc: "A critério do mestre, sempre que tiver acesso à internet, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Tecnologia." } },
  { key: "trabalhador-rural", label: "Trabalhador Rural", roll: [35, 35], skills: ["Adestramento", "Sobrevivência"],
    desc: "Fazendeiro, pescador, biólogo, veterinário… acostumado à natureza e às histórias ao redor da fogueira.",
    power: { name: "Desbravador", desc: "Quando faz um teste de Adestramento ou Sobrevivência, pode gastar 2 PE para receber +5. Além disso, não sofre penalidade em deslocamento por terreno difícil." } },
  { key: "trambiqueiro", label: "Trambiqueiro", roll: [36, 36], skills: ["Crime", "Enganação"],
    desc: "Pequenos golpes, jogatina ilegal e falcatruas — até enganar a pessoa errada.",
    power: { name: "Impostor", desc: "Uma vez por cena, você pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Enganação." } },
  { key: "universitario", label: "Universitário", roll: [37, 38], skills: ["Atualidades", "Investigação"],
    desc: "Aluno de faculdade que descobriu algo — talvez um livro amaldiçoado na biblioteca do campus.",
    power: { name: "Dedicação", desc: "Você recebe +1 PE, e mais 1 PE a cada NEX ímpar (15%, 25%…). Além disso, seu limite de PE por turno aumenta em 1 (isso não afeta a DT de seus efeitos)." } },
  { key: "vitima", label: "Vítima", roll: [39, 40], skills: ["Reflexos", "Vontade"],
    desc: "Você encontrou o paranormal e a experiência foi traumática — mas decidiu lutar.",
    power: { name: "Cicatrizes Psicológicas", desc: "Você recebe +1 de Sanidade para cada 5% de NEX." } },
];

export const originIndex = new Map(ORIGINS.map((o) => [o.key, o]));
export const isOriginKey = (k: unknown): k is string => typeof k === "string" && originIndex.has(k);

/** Origem sorteada com 2d20 (Tabela 1.1). */
export function originForRoll(total: number): OriginDef {
  return ORIGINS.find((o) => total >= o.roll[0] && total <= o.roll[1]) ?? ORIGINS[0];
}
