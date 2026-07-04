// ══════════════════════════════════════════════════════════════════
//  7º MAR — DADOS DE CRIAÇÃO DE PERSONAGEM
//  Sistema: 7º Mar (7th Sea, tradução PTBR). Fonte: regras parafraseadas
//  do vault (Canone/Sistema-Regras). Valores marcados com «curado» foram
//  preenchidos a partir das regras + conhecimento do sistema e devem ser
//  conferidos contra o livro. Editar aqui é seguro — a UI lê deste arquivo.
// ══════════════════════════════════════════════════════════════════

// ── Orçamentos de criação (Sistema-Regras 1.8 / Kit-de-Criacao §1) ──
const SM_CREATION = {
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

// ── ATRIBUTOS (5) ───────────────────────────────────────────────────
const SM_TRAITS = [
  { key: "vigor",       label: "Vigor",       abbr: "VIG", desc: "Força física e resistência." },
  { key: "finesse",     label: "Finesse",     abbr: "FIN", desc: "Agilidade e coordenação." },
  { key: "determinacao",label: "Determinação",abbr: "DET", desc: "Força de vontade e perseverança." },
  { key: "argucia",     label: "Argúcia",     abbr: "ARG", desc: "Rapidez de raciocínio e percepção." },
  { key: "panache",     label: "Panache",     abbr: "PAN", desc: "Carisma e magnetismo pessoal." },
];

// ── PERÍCIAS (16) ───────────────────────────────────────────────────
// Em 7º Mar o pool = Atributo + Perícia, com o Atributo escolhido na hora
// conforme a abordagem. `trait` abaixo é só uma SUGESTÃO de par comum.
const SM_SKILLS = [
  { key: "armas",       label: "Armas",        trait: "finesse",     desc: "Combate com armas brancas." },
  { key: "arteguerra",  label: "Arte da Guerra",trait: "argucia",    desc: "Tática, estratégia, comando." },
  { key: "atletismo",   label: "Atletismo",    trait: "vigor",       desc: "Correr, escalar, saltar, nadar." },
  { key: "atuar",       label: "Atuar",        trait: "panache",     desc: "Representar, cantar, encantar plateias." },
  { key: "briga",       label: "Briga",        trait: "vigor",       desc: "Combate desarmado e sujo." },
  { key: "cavalgar",    label: "Cavalgar",     trait: "finesse",     desc: "Montaria e condução de veículos." },
  { key: "convencer",   label: "Convencer",    trait: "panache",     desc: "Persuasão honesta e negociação." },
  { key: "empatia",     label: "Empatia",      trait: "argucia",     desc: "Ler pessoas e intenções." },
  { key: "erudicao",    label: "Erudição",     trait: "argucia",     desc: "Saber acadêmico, línguas, história." },
  { key: "esconder",    label: "Esconder-se",  trait: "finesse",     desc: "Furtividade e ocultação." },
  { key: "furto",       label: "Furto",        trait: "finesse",     desc: "Batedor de carteiras, fechaduras." },
  { key: "intimidar",   label: "Intimidar",    trait: "determinacao",desc: "Coagir pela força ou pela ameaça." },
  { key: "mirar",       label: "Mirar",        trait: "finesse",     desc: "Armas de fogo e de arremesso." },
  { key: "navegar",     label: "Navegar",      trait: "argucia",     desc: "Pilotar e orientar embarcações." },
  { key: "observar",    label: "Observar",     trait: "argucia",     desc: "Notar detalhes e perigos." },
  { key: "seduzir",     label: "Seduzir",      trait: "panache",     desc: "Charme romântico e sensual." },
];

// ── NAÇÕES (10) ─────────────────────────────────────────────────────
// `traits`: os DOIS Atributos entre os quais o jogador escolhe o +1 de Nação.
// «curado»: os pares foram atribuídos por tema; confira contra o livro.
const SM_NATIONS = {
  avalon:     { label: "Avalon",              blurb: "Ilha mística da rainha Elaine e do Graal; berço do Glamour.", traits: ["finesse","panache"],      feiticaria: "Glamour",        nota: "curado" },
  castilha:   { label: "Castilha",            blurb: "Coração da Igreja dos Vaticínios, culta e devastada pela guerra.", traits: ["finesse","argucia"],  feiticaria: null,             nota: "curado" },
  sarmacia:   { label: "Comunidade Sarmática",blurb: "A Liberdade Dourada, os hussardos alados e os pactos da Curônia.", traits: ["vigor","determinacao"], feiticaria: "Sandėris",      nota: "curado" },
  eisen:      { label: "Eisen",               blurb: "Nação de guerra e Horrores; mercenários e dracheneisen.", traits: ["vigor","determinacao"],       feiticaria: "Hexenwerk",      nota: "curado" },
  inismore:   { label: "Inismore",            blurb: "A Ilha Esmeralda do rei louco, dos bardos e dos sidhe.", traits: ["panache","determinacao"],       feiticaria: null,             nota: "curado" },
  montaigne:  { label: "Montaigne",           blurb: "O Rei-Sol, a moda, os Mosqueteiros e a magia Porté.", traits: ["panache","finesse"],             feiticaria: "Porté",          nota: "curado" },
  terrasaltas:{ label: "Terras Altas",        blurb: "Clãs das montanhas em guerra de sucessão.", traits: ["vigor","panache"],                          feiticaria: null,             nota: "curado" },
  ussura:     { label: "Ussura",              blurb: "Terra gelada de Matushka e da sucessão do czar.", traits: ["vigor","determinacao"],               feiticaria: "Condão de Mãe",  nota: "curado" },
  vesten:     { label: "Vestenmennavenjar",   blurb: "Ex-piratas, a Liga de Vendel, o guilder e as runas.", traits: ["determinacao","argucia"],         feiticaria: "Laerdom",        nota: "curado" },
  vodacce:    { label: "Vodacce",             blurb: "Sete príncipes mercantes, intriga e o Sortilégio.", traits: ["argucia","panache"],                feiticaria: "Sortilégio",     nota: "curado" },
};

// ── FORMAÇÕES (Backgrounds) ─────────────────────────────────────────
// Cada Formação dá: 1 Peculiaridade (quirk), 1 Vantagem grátis, e Perícias
// em Grau 1. Escolha DUAS. Perícias/Vantagens duplicadas: ver regra na UI.
// «curado»: perícias e vantagem grátis atribuídas por tema; confira no livro.
const SM_BACKGROUNDS = {
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

// ── VANTAGENS ───────────────────────────────────────────────────────
// Custo em pontos (1-5). Amostra de Sistema-Regras 1.8 Passo 5. «curado».
const SM_ADVANTAGES = {
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

// ── ARCANOS (Virtude & Húbris) ──────────────────────────────────────
// Escolha 1 Virtude e 1 Húbris de CARTAS DIFERENTES. Amostra dos 20
// arquétipos do baralho vodacce. «curado»: efeitos resumidos.
const SM_ARCANA = {
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

// exposto para debug no console
window.SM_DATA = { SM_CREATION, SM_TRAITS, SM_SKILLS, SM_NATIONS, SM_BACKGROUNDS, SM_ADVANTAGES, SM_ARCANA };
