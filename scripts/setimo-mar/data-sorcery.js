// ══════════════════════════════════════════════════════════════════
//  7º MAR — DADOS: Feitiçaria (6 escolas + poderes curados)
//  Curado de Canone/Sistema-Regras 1.11 do vault do usuário.
//  Schema por escola: { label, fonte, custo, nota:"curado",
//                        maiores:[{key,nome,desc}], menores:[{key,nome,desc}] }
// ══════════════════════════════════════════════════════════════════

const SM_SORCERY = {
  glamour: {
    label: "Glamour", fonte: "Herdado do Graal/sidhe (Avalon)",
    custo: "Ponto Heroico; vinculado ao Gesa", nota: "curado",
    maiores: [
      { key: "gl_maisforte", nome: "Mais Forte que Há", desc: "Apostas extras de Vigor num feito de força." },
      { key: "gl_renascido", nome: "Renascido", desc: "Volta à vida uma vez por episódio." },
    ],
    menores: [
      { key: "gl_balas", nome: "Apanhar Balas no Ar", desc: "Intercepta um projétil." },
      { key: "gl_invocar", nome: "Invocar Sidhe", desc: "Chama um espírito das lendas." },
      { key: "gl_passos", nome: "Passos Leves", desc: "Move-se sem deixar rastro nem ruído." },
    ],
  },
  hexenwerk: {
    label: "Hexenwerk", fonte: "Alquimia macabra (Eisen)",
    custo: "Tempo + Ponto Heroico; Corrupção em usos extremos", nota: "curado",
    maiores: [
      { key: "hx_furia", nome: "Fúria Paterna", desc: "Destrói um morto-vivo Desamparado." },
      { key: "hx_mingau", nome: "Mingau Fúnebre", desc: "Ressuscita como morto-vivo controlado (Corrupção)." },
    ],
    menores: [
      { key: "hx_olhos", nome: "Olhos Espectrais", desc: "Vê espíritos." },
      { key: "hx_passeio", nome: "Passeio Espiritual", desc: "Projeção astral." },
      { key: "hx_prisao", nome: "Prisão Espectral", desc: "Barra mortos-vivos." },
    ],
  },
  condao: {
    label: "Condão de Mãe", fonte: "Dádiva de Matushka (Ussura)",
    custo: "Restrições/Penitência por Lição", nota: "curado",
    maiores: [
      { key: "cm_forma", nome: "Mudar de Forma", desc: "Assume forma animal." },
      { key: "cm_regen", nome: "Regenerar", desc: "Cura um Ferimento Dramático." },
    ],
    menores: [
      { key: "cm_comandar", nome: "Comandar", desc: "Invoca/comanda um animal." },
      { key: "cm_iluminar", nome: "Iluminar", desc: "Fere mortos-vivos com luz." },
      { key: "cm_farejar", nome: "Farejar o Norte", desc: "Nunca se perde na natureza." },
    ],
  },
  porte: {
    label: "Porté", fonte: "Sangue nobre (Montaigne)",
    custo: "Ferimento Dramático + Aposta; blessure gera Corrupção", nota: "curado",
    maiores: [
      { key: "pt_caminhar", nome: "Caminhar", desc: "Atravessa até uma Marca Maior." },
      { key: "pt_blessure", nome: "Abrir Blessure", desc: "Rasga o mundo (Corrupção)." },
    ],
    menores: [
      { key: "pt_marcar", nome: "Marcar", desc: "Grava um objeto com sangue." },
      { key: "pt_puxar", nome: "Puxar", desc: "Traz o objeto Marcado." },
      { key: "pt_sentir", nome: "Sentir a Marca", desc: "Sabe onde estão suas Marcas." },
    ],
  },
  sanderis: {
    label: "Sandėris", fonte: "Pacto com um dievas (Curônia)",
    custo: "Ponto Heroico + Aposta; Corrupção em Favores Maiores", nota: "curado",
    maiores: [
      { key: "sd_maior", nome: "Favor Maior", desc: "Efeito poderoso do tema do pacto (Corrupção)." },
      { key: "sd_nome", nome: "Buscar o Nome", desc: "Avança na descoberta do nome do dievas." },
    ],
    menores: [
      { key: "sd_trevas", nome: "Manto de Trevas", desc: "Some nas sombras." },
      { key: "sd_fogo", nome: "Toque de Fogo", desc: "Chama do tema do pacto." },
      { key: "sd_frio", nome: "Sopro Gélido", desc: "Congela o alvo." },
    ],
  },
  sortilegio: {
    label: "Sortilégio", fonte: "Sangue feminino vodacce",
    custo: "Ponto Heroico + Vergastadas do Destino; Leitura obrigatória", nota: "curado",
    maiores: [
      { key: "so_arcanos", nome: "Arcanos", desc: "Força/troca Virtude-Húbris do alvo." },
      { key: "so_puxar", nome: "Puxar", desc: "Arrasta alvos pelos fios do destino." },
    ],
    menores: [
      { key: "so_leitura", nome: "Leitura", desc: "Revela Arcanos/Virtudes/Húbris ao redor (obrigatória)." },
      { key: "so_bencao", nome: "Bênção", desc: "Dá dados a um alvo." },
      { key: "so_maldicao", nome: "Maldição", desc: "Tira dados de um alvo." },
    ],
  },
};

Object.assign(window, { SM_SORCERY });
