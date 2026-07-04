// ══ 7º MAR — App: modos e abas ══
const SM_TABS = [
  { id:"conceito",  label:"1 · Conceito & Nação" },
  { id:"atributos", label:"2 · Atributos" },
  { id:"formacoes", label:"3 · Formações" },
  { id:"pericias",  label:"4 · Perícias" },
  { id:"vantagens", label:"5 · Vantagens" },
  { id:"arcanos",   label:"6 · Arcanos" },
  { id:"feiticaria",label:"7 · Feitiçaria", cond:() => smTemFeiticaria() },
  { id:"duelo",     label:"8 · Duelo",      cond:() => smTemAcademiaDuelista() },
  { id:"historias", label:"9 · Histórias" },
  { id:"sociedade", label:"10 · Sociedade" },
  { id:"toques",    label:"11 · Toques Finais" },
  { id:"revisao",   label:"12 · Revisão" },
];
let SM_ACTIVE_TAB = "conceito";

function smVisibleTabs() { return SM_TABS.filter(t => !t.cond || t.cond()); }

function smTabComplete(id) {
  switch (id) {
    case "conceito":  return !!SM.concept.name && !!SM.nation && !!SM.nationTrait;
    case "atributos": return smTraitFreeLeft() === 0;
    case "formacoes": return SM.backgrounds.length === SM_CREATION.backgroundsToPick;
    case "pericias":  return smSkillPointsLeft() === 0;
    case "vantagens": return smAdvantagePointsLeft() >= 0; // sempre ok (opcional gastar tudo)
    case "arcanos":   return !!SM.arcana.virtude && !!SM.arcana.hubris;
    case "feiticaria":return !smTemFeiticaria() || !!SM.sorcery.school;
    case "duelo":     return !smTemAcademiaDuelista() || !!SM.dueling.style;
    case "historias": return true;   // opcional na criação
    case "sociedade": return true;   // opcional
    case "toques":    return true;   // opcional
    case "revisao":   return true;
    default: return true;
  }
}

function smSetMode(mode) {           // "criar" | "jogo"
  SM._mode = mode;
  document.getElementById("sm-mode-criar").classList.toggle("sm-active", mode==="criar");
  document.getElementById("sm-mode-jogo").classList.toggle("sm-active", mode==="jogo");
  document.getElementById("sm-create-panel").style.display = mode==="criar" ? "block" : "none";
  document.getElementById("sm-play").style.display = mode==="jogo" ? "block" : "none";
  if (mode==="jogo") renderPlay();
}
function smGoTab(index) {
  const tabs = smVisibleTabs();
  const i = Math.max(0, Math.min(index, tabs.length-1));
  SM_ACTIVE_TAB = tabs[i].id;
  document.querySelectorAll(".sm-tab-panel").forEach(p =>
    p.style.display = (p.dataset.tab === SM_ACTIVE_TAB) ? "block" : "none");
  renderTabBar();
  if (typeof window !== "undefined" && window.scrollTo) window.scrollTo({ top: 0, behavior: "smooth" });
}
function smGoTabById(id) {
  const tabs = smVisibleTabs();
  const i = tabs.findIndex(t => t.id === id);
  smGoTab(i >= 0 ? i : 0);
}
function _smActiveIndex() {
  const tabs = smVisibleTabs();
  const i = tabs.findIndex(t => t.id === SM_ACTIVE_TAB);
  return i >= 0 ? i : 0;
}
function smRefreshTabs() {
  const tabs = smVisibleTabs();
  if (!tabs.some(t => t.id === SM_ACTIVE_TAB)) {
    SM_ACTIVE_TAB = tabs[0].id;
  }
  document.querySelectorAll(".sm-tab-panel").forEach(p =>
    p.style.display = (p.dataset.tab === SM_ACTIVE_TAB) ? "block" : "none");
  renderTabBar();
}
function smNextTab() { smGoTab(_smActiveIndex() + 1); }
function smPrevTab() { smGoTab(_smActiveIndex() - 1); }
function smActiveTab() { return SM_ACTIVE_TAB; }

function renderTabBar() {
  const bar = document.getElementById("sm-tab-bar");
  if (!bar) return;
  const tabs = smVisibleTabs();
  bar.innerHTML = tabs.map((t, i) => {
    const done = smTabComplete(t.id) ? "✓" : "";
    const on = t.id === SM_ACTIVE_TAB ? " sm-tab-active" : "";
    return `<button class="sm-tab${on}" onclick="smGoTab(${i})">${t.label} <span class="sm-tab-check">${done}</span></button>`;
  }).join("");
}

function smInit() {
  smLoad();
  renderAll();          // create.js
  smSetMode(SM._mode || "criar");
  smGoTab(0);
}
document.addEventListener("DOMContentLoaded", smInit);

Object.assign(window, { smSetMode, smGoTab, smGoTabById, smNextTab, smPrevTab, smRefreshTabs, smActiveTab, smTabComplete, SM_TABS });
