// ══════════════════════════════════════════════════════════════════
//  SACRAMENTO RPG — O Grande Catálogo de Equipamento (1880)
//  Preços em réis ($). Na primeira compra usa-se o preço MÁXIMO.
//  Espaço em linhas da mochila (10 linhas). `stack`: unidades por linha.
//  Dano: { vida, dor } em Círculos.
// ══════════════════════════════════════════════════════════════════

export type ItemCat = "armas" | "estrangeiro" | "acessorios" | "protecao" | "animais" | "mercearia" | "armazem" | "farmacia" | "roupas";

export const ITEM_CATS: { key: ItemCat; label: string; note?: string }[] = [
  { key: "armas", label: "Armas", note: "Até 4 armas vão em coldres, bandoleiras e bainhas sem ocupar a mochila, mais UMA faca. Armas extras ocupam a mochila." },
  { key: "estrangeiro", label: "Direto do Estrangeiro", note: "Armas raras: o desconto de Sorrisão, Chapéu na Mão não vale para elas." },
  { key: "acessorios", label: "Acessórios & munição", note: "Coldre: um revólver e até 36 balas. Bandoleira: um fuzil ou espingarda e até 24 balas. Bainha: uma faca ou espada. Sem eles, apanhar munição custa 2 Ações e recarregar, +1." },
  { key: "protecao", label: "Proteções", note: "Não aumentam a Defesa: reduzem o dano de tiros e golpes (não de explosões) até o limite, e então quebram." },
  { key: "animais", label: "Criações & transporte" },
  { key: "mercearia", label: "Mercearia" },
  { key: "armazem", label: "Armazém" },
  { key: "farmacia", label: "Farmácia", note: "Cada frasco ocupa ½ linha." },
  { key: "roupas", label: "Roupas", note: "Roupas vestidas não ocupam espaço; cada peça não vestida ocupa ½ linha." },
];

export interface Damage { vida?: number; dor?: number; note?: string }

export interface ItemDef {
  key: string;
  name: string;
  cat: ItemCat;
  min: number;
  max: number;
  /** Linhas ocupadas na mochila (0 = não ocupa). */
  space: number;
  /** Unidades que cabem numa linha (Café máx. 3, Pregos máx. 20…). */
  stack?: number;
  /** Arma carregada no coldre/bainha (não conta como item de mochila). */
  holster?: "coldre" | "bainha" | "nenhum";
  damage?: Damage;
  /** Variante de dano (Espingarda: perto). */
  damage2?: Damage;
  bullets?: string;
  reload?: string;
  /** Proteções. */
  armor?: { reduction: number; limit: number; penalty: string };
  /** Animais/transporte: espaço extra para carregar itens. */
  carries?: number;
  forSale?: boolean;
  desc?: string;
}

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const item = (cat: ItemCat, name: string, min: number, max: number, space: number, extra: Partial<ItemDef> = {}): ItemDef =>
  ({ key: `${cat}-${slug(name)}`, name, cat, min, max, space, ...extra });

export const ITEMS: ItemDef[] = [
  // ── Catálogo de Armas ──
  item("armas", "Revólver", 15, 25, 1, { bullets: "6 balas", reload: "2 ações", damage: { vida: 1 } }),
  item("armas", "Fuzil", 25, 40, 3, { bullets: "5 balas", reload: "2 ações", damage: { vida: 3 } }),
  item("armas", "Espingarda", 25, 40, 2, { bullets: "2 balas", reload: "1 ação", damage: { vida: 1, note: "longe" }, damage2: { vida: 2, note: "perto" } }),
  item("armas", "Garrucha", 10, 20, 1, { bullets: "1 bala", reload: "2 ações", damage: { vida: 2, note: "apenas perto" } }),
  item("armas", "Zarabatana", 3, 10, 1, { damage: { dor: 1, note: "+ veneno" } }),
  item("armas", "Estilingue", 1, 5, 1, { damage: { dor: 2 } }),
  item("armas", "Boleadeira", 1, 1, 1, { damage: { dor: 3 } }),
  item("armas", "Arco e flecha", 25, 25, 1, { damage: { vida: 1 } }),
  item("armas", "Faca", 1, 5, 0, { holster: "coldre", damage: { dor: 3 } }),
  item("armas", "Sabre (Espada)", 5, 25, 0, { holster: "bainha", damage: { vida: 1 } }),
  item("armas", "Lança", 15, 25, 0, { holster: "nenhum", damage: { vida: 1 } }),
  item("armas", "Machadinha", 5, 10, 1, { damage: { vida: 1 } }),
  item("armas", "Machado de lenha", 1, 2, 2, { damage: { vida: 2 } }),
  item("armas", "Martelo de mão", 5, 10, 1, { damage: { vida: 1 } }),

  // ── Direto do Estrangeiro ──
  item("estrangeiro", "Pistola automática", 1000, 2000, 1, { bullets: "11 balas", reload: "2 ações", damage: { vida: 1 }, desc: "Um tiro adicional por Ação de Combate." }),
  item("estrangeiro", "Magnum de cano alongado", 2000, 4000, 1, { bullets: "6 balas", reload: "2 ações", damage: { vida: 2 } }),
  item("estrangeiro", "Mauser C69", 2000, 4000, 1, { bullets: "15 balas", reload: "1 ação", damage: { vida: 1 } }),
  item("estrangeiro", "Carabina de repetição", 1000, 2000, 2, { bullets: "7 balas", reload: "2 ações", damage: { vida: 2 }, desc: "Um tiro adicional na primeira Ação de Combate do turno, com –1 nos Testes de Violência." }),
  item("estrangeiro", "Derringer", 300, 300, 1, { bullets: "2 balas", reload: "1 ação", damage: { vida: 1 }, desc: "Revólver escondido na manga; aproveita Ataque Sacana." }),
  item("estrangeiro", "Espingarda de cano serrado", 50, 150, 2, { bullets: "2 balas", reload: "2 ações", damage: { vida: 3 }, desc: "Alcance menor; cabe no coldre da cintura." }),
  item("estrangeiro", "Canhão de cavalaria", 0, 0, 0, { bullets: "1 bala", reload: "2 turnos", damage: { vida: 6 }, forSale: false }),
  item("estrangeiro", "Metralhadora montada", 0, 0, 0, { reload: "2 turnos", damage: { vida: 3, note: "por Ação e Movimento" }, forSale: false }),
  item("estrangeiro", "Explosivos (TNT/Dinamite)", 30, 40, 0.5, { reload: "3 ações", damage: { vida: 5, note: "área de 1,5m" } }),

  // ── Acessórios e munição ──
  item("acessorios", "Bainha", 3, 10, 0),
  item("acessorios", "Bandoleira", 5, 20, 0),
  item("acessorios", "Coldre", 4, 15, 0),
  item("acessorios", "Munição de revólver (caixa com 12)", 3, 8, 1),
  item("acessorios", "Munição de espingarda (caixa com 6)", 7, 10, 1),
  item("acessorios", "Munição de fuzil (caixa com 6)", 6, 12, 1),

  // ── Proteções ──
  item("protecao", "Sobretudo", 50, 70, 0, { armor: { reduction: 1, limit: 2, penalty: "–1 Ação de Combate (mín. 1)" } }),
  item("protecao", "Colete de couro reforçado", 100, 200, 0, { armor: { reduction: 1, limit: 3, penalty: "–1 Movimento (mín. 1)" } }),
  item("protecao", "Colete de couro com madeira", 150, 250, 0, { armor: { reduction: 2, limit: 4, penalty: "–1 Ação de Combate e –1 Movimento (mín. 1)" } }),
  item("protecao", "Ombreiras de ferro", 400, 500, 0, { armor: { reduction: 2, limit: 4, penalty: "–2 Movimentos (mín. 1)" } }),
  item("protecao", "Placas de metal", 100, 400, 0, { armor: { reduction: 3, limit: 5, penalty: "–2 Movimentos e –1 Ação de Combate (mín. 1)" } }),
  item("protecao", "Panelas chumbadas", 200, 400, 0, { armor: { reduction: 3, limit: 4, penalty: "–1 Movimento e –2 Ações de Combate (mín. 1)" } }),

  // ── Criações e animais ──
  item("animais", "Apicultura", 5, 10, 0),
  item("animais", "Bodes/cabras (unidade)", 10, 100, 0),
  item("animais", "Bolsa de montaria", 2, 10, 0, { carries: 10, desc: "Necessária para levar objetos e armas no cavalo: +10 espaços." }),
  item("animais", "Bovino", 10, 300, 0),
  item("animais", "Canoa", 20, 50, 0),
  item("animais", "Carroça", 15, 30, 0, { carries: 30, desc: "Grandes travessias e abrigo: +30 espaços." }),
  item("animais", "Carro", 1, 25, 0, { carries: 20, desc: "Prancha com rodas puxada por bois ou cavalos: +20 espaços." }),
  item("animais", "Cavalo", 1, 250, 0),
  item("animais", "Curral (dia/semana)", 1, 2, 0),
  item("animais", "Galinhas", 1, 3, 0),
  item("animais", "Mulas/Burricos", 1, 100, 0),
  item("animais", "Ovelhas/Cordeiros", 5, 5, 0),
  item("animais", "Sela", 3, 10, 0),
  item("animais", "Suínos", 10, 30, 0),

  // ── Mercearia ──
  item("mercearia", "Açúcar (½ kg)", 1, 2, 0.5),
  item("mercearia", "Alcaçuz (doces)", 0.5, 1, 0),
  item("mercearia", "Atum (lata)", 0.1, 0.5, 0.5),
  item("mercearia", "Azeite (garrafa)", 2, 2, 1),
  item("mercearia", "Biscoitos", 0.5, 1, 0),
  item("mercearia", "Carne seca (1 kg)", 1, 2, 1),
  item("mercearia", "Café (lata)", 0.5, 1, 1, { stack: 3 }),
  item("mercearia", "Cenouras (5)", 0.05, 0.25, 1),
  item("mercearia", "Cerveja (garrafa)", 0.25, 1, 1),
  item("mercearia", "Chocolate (barra)", 1, 4, 0),
  item("mercearia", "Conhaque fino (garrafa)", 40, 60, 0.5),
  item("mercearia", "Ervilhas (lata)", 3, 15, 0.5),
  item("mercearia", "Erva medicinal (½ kg)", 5, 50, 0.5),
  item("mercearia", "Farinha (½ kg)", 1, 2, 0.5),
  item("mercearia", "Feijão (lata)", 0.5, 2, 1),
  item("mercearia", "Folhas de chá (½ kg)", 1, 2, 1),
  item("mercearia", "Fósforos (10)", 0.05, 0.1, 0),
  item("mercearia", "Jornal", 0.25, 0.25, 0),
  item("mercearia", "Leite (½ litro)", 3, 5, 1),
  item("mercearia", "Maçã (3)", 0.1, 0.1, 0),
  item("mercearia", "Martelo", 0.5, 1, 1),
  item("mercearia", "Milho (lata)", 0.1, 0.5, 0.5),
  item("mercearia", "Mochila", 1, 1, 0),
  item("mercearia", "Óleo (lanterna)", 0.25, 0.5, 0.5),
  item("mercearia", "Ovos (6)", 1, 2.5, 0.5),
  item("mercearia", "Paieirinho (5)", 0.5, 1, 0),
  item("mercearia", "Pinga (garrafa)", 0.25, 1, 1),
  item("mercearia", "Pão de queijo (10)", 1, 2, 0.5),
  item("mercearia", "Sardinha (lata)", 0.1, 0.25, 0.5),
  item("mercearia", "Sabão (barra)", 0.1, 0.25, 0.5),
  item("mercearia", "Sopa", 0.5, 2, 0.5),
  item("mercearia", "Queijo (½ kg)", 3, 6, 0.5),
  item("mercearia", "Tabaco (½ kg)", 2, 5, 0.5),
  item("mercearia", "Tábua de lavar", 1, 3, 1),
  item("mercearia", "Tônico capilar (frasco)", 10, 15, 0.5),
  item("mercearia", "Vinho (garrafa)", 10, 5, 1),
  item("mercearia", "Unguento (frasco)", 5, 10, 1),
  item("mercearia", "Uísque (garrafa)", 5, 10, 1),

  // ── Armazém ──
  item("armazem", "Acordeão (sanfona)", 30, 50, 1),
  item("armazem", "Alicate de arame", 20, 50, 1),
  item("armazem", "Algemas", 2, 4, 0.5),
  item("armazem", "Arame (10m)", 3, 5, 2),
  item("armazem", "Banjo", 50, 100, 1),
  item("armazem", "Baralho", 0.5, 2, 0),
  item("armazem", "Barraca", 7, 12, 1),
  item("armazem", "Berimbau", 1, 2, 1),
  item("armazem", "Binóculo", 25, 40, 0.5),
  item("armazem", "Brinquedo", 10, 20, 0.5),
  item("armazem", "Bússola", 1, 5, 0),
  item("armazem", "Cadeado", 0.5, 1, 0.5),
  item("armazem", "Cantil", 3, 5, 0),
  item("armazem", "Corrente (2m)", 10, 25, 1),
  item("armazem", "Corda (5m)", 1, 5, 1),
  item("armazem", "Dados (3)", 0.5, 1, 0),
  item("armazem", "Detonador", 3, 5, 1),
  item("armazem", "Foice", 10, 25, 1),
  item("armazem", "Forcado", 10, 25, 1),
  item("armazem", "Fósforos", 0.05, 0.1, 0),
  item("armazem", "Flauta", 2, 100, 1),
  item("armazem", "Gaita (harmônica)", 15, 25, 1),
  item("armazem", "Ganzá (chocalho)", 5, 10, 1),
  item("armazem", "Gazuas (20)", 0.5, 1, 1),
  item("armazem", "Graxa (pote)", 1, 2, 0.5),
  item("armazem", "Isqueiro", 5, 30, 0),
  item("armazem", "Lanterna", 5, 10, 1),
  item("armazem", "Linha e agulha", 0.5, 1, 0),
  item("armazem", "Lona (2m)", 20, 30, 2),
  item("armazem", "Machado", 10, 25, 1),
  item("armazem", "Marreta", 10, 25, 1),
  item("armazem", "Óculos", 20, 50, 0.5),
  item("armazem", "Óleo (lata)", 1, 2, 1),
  item("armazem", "Pá", 1, 2, 1),
  item("armazem", "Pandeiro", 60, 80, 1),
  item("armazem", "Panela", 3, 10, 1),
  item("armazem", "Pavio (10m)", 10, 15, 2),
  item("armazem", "Pé de cabra", 5, 10, 1),
  item("armazem", "Pregos (20)", 0.5, 1, 1, { stack: 20 }),
  item("armazem", "Pederneira", 0.5, 1, 0.5),
  item("armazem", "Picareta", 10, 25, 2),
  item("armazem", "Relógio de bolso", 25, 50, 0.5),
  item("armazem", "Sabão (barra)", 0.25, 0.5, 1, { stack: 2 }),
  item("armazem", "Saco de dormir", 0.25, 0.5, 1),
  item("armazem", "Tesourão", 25, 50, 2),
  item("armazem", "Tamborim", 10, 20, 1),
  item("armazem", "Vara de pescar", 3, 5, 1),
  item("armazem", "Viola", 30, 60, 1),
  item("armazem", "Violão", 30, 60, 1),
  item("armazem", "Violino", 50, 100, 1),
  item("armazem", "Zabumba", 30, 50, 2),

  // ── Farmácia da Eficácia ──
  item("farmacia", "Adrenalina (seringa)", 400, 500, 0.5, { desc: "1 Ação de Combate: recupera 3 Vida na hora; depois, –1 Ação e –1 Movimento até descansar." }),
  item("farmacia", "Álcool (frasco)", 3, 5, 0.5, { desc: "Desinfeta feridas." }),
  item("farmacia", "Arsênico (frasco)", 2, 4, 0.5, { desc: "Diminui o efeito de peçonhas e venenos." }),
  item("farmacia", "Babosa (erva)", 2, 2, 0.5),
  item("farmacia", "Boldo (erva)", 2, 2, 0.5),
  item("farmacia", "Cavalinha (erva)", 2, 2, 0.5),
  item("farmacia", "Cânfora (pasta)", 10, 30, 0.5, { desc: "Em combate: 1 Ação de Combate para curar 1 Dor." }),
  item("farmacia", "Erva-doce (erva)", 2, 2, 0.5),
  item("farmacia", "Folha de salgueiro (erva)", 3, 3, 0.5),
  item("farmacia", "Gengibre (raiz)", 2, 2, 0.5),
  item("farmacia", "Laxante (frasco)", 5, 10, 0.5),
  item("farmacia", "Mil-folhas (erva)", 2, 2, 0.5),
  item("farmacia", "Morfina (ampola)", 50, 100, 0.5),
  item("farmacia", "Pomada de cavalo (pasta)", 5, 10, 0.5, { desc: "A montaria cura 3 durante um descanso." }),
  item("farmacia", "Tônico milagroso (frasco)", 10, 50, 0.5, { desc: "Teste de Sorte: carta preta cura 3 Vida; vermelha, envenenado." }),
  item("farmacia", "Unguento (pasta)", 5, 10, 0.5, { desc: "Cura 1 Vida ao ser aplicado no descanso." }),
  item("farmacia", "Xarope de tosse (frasco)", 2, 5, 0.5),

  // ── Roda da Moda (vestidas não ocupam espaço) ──
  ...([
    ["Anel (latão - diamante)", 1, 1500], ["Avental de médico", 2, 5], ["Batina", 1, 2], ["Bengala", 1, 2], ["Boina", 0.5, 1],
    ["Bolsa de mão", 10, 20], ["Botas", 5, 10], ["Blusa de inverno", 10, 30], ["Blusa de verão", 1, 5], ["Brincos (latão - diamantes)", 5, 1500],
    ["Broche (latão - prata)", 2, 500], ["Calça", 2, 8], ["Camisa", 2, 5], ["Camisola", 10, 25], ["Cartola", 15, 20], ["Casaco", 2, 15],
    ["Ceroulas", 1, 2], ["Chapéu", 5, 100], ["Cinto", 1, 5], ["Colar (ferro - pérolas)", 2, 2500], ["Colete", 3, 15], ["Echarpe", 1, 2],
    ["Estetoscópio", 10, 50], ["Lenço de pescoço", 0.5, 1], ["Leque", 1, 3], ["Lingerie", 3, 100], ["Luvas", 0.25, 1], ["Gargantilha", 0.5, 1],
    ["Gravata", 1, 5], ["Jaqueta", 10, 300], ["Óculos (moda)", 5, 25], ["Macacão jeans", 0.5, 3], ["Meias", 0.1, 0.25], ["Paletó", 20, 50],
    ["Perneiras", 10, 15], ["Pijamas", 1, 30], ["Poncho", 1, 50], ["Pulseira (lata - diamante)", 2, 2000], ["Saia", 1, 15], ["Sapatos", 2, 100],
    ["Sobretudo (roupa)", 10, 200], ["Sombrero", 5, 20], ["Suspensórios", 1, 5], ["Vestido (trabalho - gala)", 2, 150], ["Tuxedo", 10, 50], ["Xale de lã", 1, 2],
  ] as [string, number, number][]).map(([name, min, max]) => item("roupas", name, min, max, 0)),
];

// O livro lista o vinho como "$10-$5": usa-se o maior valor como máximo.
ITEMS.forEach((i) => { if (i.min > i.max) [i.min, i.max] = [i.max, i.min]; });

export const itemIndex = new Map(ITEMS.map((i) => [i.key, i]));
export const isItemKey = (k: unknown): k is string => typeof k === "string" && itemIndex.has(k);

export const STARTING_MONEY = 200;
export const BACKPACK_LINES = 10;
/** Armas portadas em coldres/bandoleiras/bainhas sem ocupar a mochila (mais uma faca). */
export const CARRIED_WEAPONS = 4;
