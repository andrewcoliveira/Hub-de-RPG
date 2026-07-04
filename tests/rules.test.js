const { loadSM, eq, ok, report } = require("./_harness");
const FILES = ["scripts/setimo-mar/data-core.js", "scripts/setimo-mar/state.js", "scripts/setimo-mar/create.js"];

// ── v1: orçamentos e regras de criação ──
(function () {
  const w = loadSM(FILES);
  eq("v1 trait livre inicial", w.smTraitFreeLeft(), 2);
  eq("v1 pericia inicial", w.smSkillPointsLeft(), 10);
  eq("v1 vantagem inicial", w.smAdvantagePointsLeft(), 5);
  w.smSelectNation("montaigne"); w.smSetNationTrait("panache");
  eq("v1 trait final c/ nacao", w.smTraitFinal("panache"), 3);
  w.smToggleBackground("duelista"); w.smToggleBackground("soldado");
  eq("v1 armas +2 formacoes", w.smSkillFinal("armas"), 2);
  eq("v1 vantagens gratis", [...w.smFreeAdvantages()].sort(), ["esgrimista","espiritovaloroso"]);
  w.smSetArcana("virtude","osol"); w.smSetArcana("hubris","osol");
  eq("v1 mesma carta bloqueada", w.SM.arcana.hubris, null);
})();

// ── v2: migração do v1 ──
(function () {
  const v1payload = JSON.stringify({
    concept:{name:"Velho Heroi",player:"",concept:"",religion:""},
    nation:"avalon", nationTrait:"finesse",
    traits:{vigor:3,finesse:2,determinacao:2,argucia:2,panache:2},
    backgrounds:["pirata"], skills:{}, advantages:["contato"],
    arcana:{virtude:"osol",hubris:"atorre"}
  });
  const w = loadSM(["scripts/setimo-mar/data-core.js","scripts/setimo-mar/state.js"],
                   { "setimoMar.ficha.v1": v1payload });
  w.smLoad();
  eq("migrou nome", w.SM.concept.name, "Velho Heroi");
  eq("migrou nacao", w.SM.nation, "avalon");
  eq("migrou vigor", w.SM.traits.vigor, 3);
  eq("schemaVersion 2", w.SM.schemaVersion, 2);
  eq("play default pontos heroicos", w.SM.play.pontosHeroicos, 1);
  eq("play default ferimentos", w.SM.play.ferimentosDramaticos, 0);
  eq("society default nulo", w.SM.society.key, null);
  ok("gravou v2 no storage", typeof w._store["setimoMar.ficha.v2"] === "string");
})();

// ── v2: completude por aba ──
(function () {
  const w = loadSM(["scripts/setimo-mar/data-core.js","scripts/setimo-mar/state.js","scripts/setimo-mar/create.js","scripts/setimo-mar/app.js"]);
  ok("aba conceito incompleta no inicio", w.smTabComplete("conceito") === false);
  w.smSetConcept("name","Teste"); w.smSelectNation("avalon"); w.smSetNationTrait("finesse");
  ok("aba conceito completa", w.smTabComplete("conceito") === true);
  ok("aba feiticaria oculta sem vantagem", w.SM_TABS.find(t=>t.id==="feiticaria").cond() === false);
  w.smToggleAdvantage("feiticaria");
  ok("aba feiticaria visivel com vantagem", w.SM_TABS.find(t=>t.id==="feiticaria").cond() === true);
})();

// ── v3: navegacao de abas por id estavel a abas condicionais ──
(function(){
  const w = loadSM(["scripts/setimo-mar/data-core.js","scripts/setimo-mar/state.js","scripts/setimo-mar/create.js","scripts/setimo-mar/app.js"]);
  w.smSelectNation("avalon");
  w.smGoTab(5); // arcanos (6a aba visivel, indice 5)
  ok("ativa = arcanos", w.smActiveTab() === "arcanos");
  w.smToggleAdvantage("feiticaria"); // adiciona a aba feiticaria (indice 6) — nao deve mudar a ativa
  ok("aba ativa estavel ao surgir aba condicional", w.smActiveTab() === "arcanos");
  w.smToggleAdvantage("feiticaria"); // remove a aba feiticaria de novo
  ok("aba ativa estavel ao sumir aba condicional", w.smActiveTab() === "arcanos");
})();

// ── v2: feitiçaria ──
(function(){
  const w = loadSM(["scripts/setimo-mar/data-core.js","scripts/setimo-mar/data-sorcery.js","scripts/setimo-mar/state.js","scripts/setimo-mar/create.js"]);
  ok("sem feiticaria, sem escola valida", w.smTemFeiticaria() === false);
  w.smSelectNation("avalon");            // escola: Glamour
  w.smToggleAdvantage("feiticaria");
  ok("com feiticaria", w.smTemFeiticaria() === true);
  w.smSetSchool("glamour");
  eq("escola definida", w.SM.sorcery.school, "glamour");
  const orc = w.smSorceryBudget();
  eq("orcamento 1 compra", orc, {maiores:1, menores:2});
  // seleciona 1 maior + 2 menores (chaves reais de data-sorcery)
  const S = w.SM_SORCERY.glamour;
  w.smToggleSorceryPower(S.maiores[0].key);
  w.smToggleSorceryPower(S.menores[0].key);
  w.smToggleSorceryPower(S.menores[1].key);
  eq("3 poderes selecionados", w.SM.sorcery.powers.length, 3);
  // não deixa passar do orçamento de maiores
  const before = w.SM.sorcery.powers.length;
  w.smToggleSorceryPower(S.maiores[1].key);
  eq("maior extra bloqueado", w.SM.sorcery.powers.length, before);
})();

report();
