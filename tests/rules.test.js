const { loadSM, eq, ok, report } = require("./_harness");
const FILES = ["scripts/setimo-mar/data-core.js", "scripts/setimo-mar/builder.js"];

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

report();
