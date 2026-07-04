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

report();
