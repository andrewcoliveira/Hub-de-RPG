// ══════════════════════════════════════════════════════════════════
//  7º MAR — ESTADO (única fonte de verdade)
//  Depende de scripts/setimo-mar/data-core.js
// ══════════════════════════════════════════════════════════════════

const SM_STORAGE_KEY = "setimoMar.ficha.v2";
const SM_STORAGE_KEY_V1 = "setimoMar.ficha.v1";

// ── Estado ──────────────────────────────────────────────────────────
function smDefaultState() {
  const skills = {};
  SM_SKILLS.forEach(s => (skills[s.key] = 0));
  return {
    schemaVersion: 2,
    concept: { name: "", player: "", concept: "", religion: "" },
    nation: null,
    nationTrait: null,                 // Atributo que recebe o +1 da Nação
    traits: { vigor: 2, finesse: 2, determinacao: 2, argucia: 2, panache: 2 },
    backgrounds: [],                   // até 2 chaves
    skills,                            // chave -> pontos alocados (0..3)
    advantages: [],                    // chaves de Vantagens compradas
    arcana: { virtude: null, hubris: null },
    sorcery: { school: null, powers: [] },
    dueling: { style: null },
    society: { key: null },
    stories: [ { nome: "", final: "", recompensa: "", passos: [] } ],
    finalTouches: { reputacoes: [], idiomas: [], fortunaInicial: 0 },
    play: { ferimentos: 0, ferimentosDramaticos: 0, pontosHeroicos: 1, fortuna: 0, favor: 2, notas: "" },
  };
}
let SM = smDefaultState();

// ── Persistência ────────────────────────────────────────────────────
function smSave() {
  try { localStorage.setItem(SM_STORAGE_KEY, JSON.stringify(SM)); } catch (e) {}
  smFlashSaved();
}
function smMergeDefaults(data) {
  const base = smDefaultState();
  const out = Object.assign(base, data);
  // garante sub-objetos e perícias
  out.play = Object.assign(base.play, data.play || {});
  out.sorcery = Object.assign(base.sorcery, data.sorcery || {});
  out.dueling = Object.assign(base.dueling, data.dueling || {});
  out.society = Object.assign(base.society, data.society || {});
  out.finalTouches = Object.assign(base.finalTouches, data.finalTouches || {});
  if (!Array.isArray(out.stories) || !out.stories.length) out.stories = base.stories;
  SM_SKILLS.forEach(s => { if (out.skills[s.key] == null) out.skills[s.key] = 0; });
  out.schemaVersion = 2;
  return out;
}
function smLoad() {
  try {
    const rawV2 = localStorage.getItem(SM_STORAGE_KEY);
    if (rawV2) { SM = smMergeDefaults(JSON.parse(rawV2)); return true; }
    const rawV1 = localStorage.getItem(SM_STORAGE_KEY_V1);
    if (rawV1) { SM = smMergeDefaults(JSON.parse(rawV1)); smSave(); return true; } // migra e persiste em v2
    return false;
  } catch (e) { return false; }
}
let _smFlashTimer = null;
function smFlashSaved() {
  const el = document.getElementById("sm-save-indicator");
  if (!el) return;
  el.classList.add("show");
  clearTimeout(_smFlashTimer);
  _smFlashTimer = setTimeout(() => el.classList.remove("show"), 1200);
}

// ── Derivações / cálculos ───────────────────────────────────────────
function smTraitFinal(key) {
  return SM.traits[key] + (SM.nationTrait === key ? SM_CREATION.traitNation : 0);
}
function smTraitFreeSpent() {
  return SM_TRAITS.reduce((sum, t) => sum + (SM.traits[t.key] - SM_CREATION.traitBase), 0);
}
function smTraitFreeLeft() { return SM_CREATION.traitFree - smTraitFreeSpent(); }

function smBackgroundSkillBonus(skillKey) {
  let n = 0;
  SM.backgrounds.forEach(bg => {
    const b = SM_BACKGROUNDS[bg];
    if (b && b.skills.includes(skillKey)) n += 1;   // cada Formação dá Grau 1
  });
  return n;
}
function smSkillFinal(skillKey) {
  return SM.skills[skillKey] + smBackgroundSkillBonus(skillKey);
}
function smSkillPointsSpent() {
  return SM_SKILLS.reduce((sum, s) => sum + SM.skills[s.key], 0);
}
function smSkillPointsLeft() { return SM_CREATION.skillPoints - smSkillPointsSpent(); }

function smFreeAdvantages() {
  // Vantagens grátis concedidas pelas Formações escolhidas
  const set = new Set();
  SM.backgrounds.forEach(bg => {
    const b = SM_BACKGROUNDS[bg];
    if (b && b.freeAdvantage) set.add(b.freeAdvantage);
  });
  return set;
}
function smAdvantagePointsSpent() {
  const free = smFreeAdvantages();
  return SM.advantages.reduce((sum, key) => {
    if (free.has(key)) return sum;                  // grátis não custa
    const a = SM_ADVANTAGES[key];
    return sum + (a ? a.cost : 0);
  }, 0);
}
function smAdvantagePointsLeft() { return SM_CREATION.advantagePoints - smAdvantagePointsSpent(); }

// ── novos derivados v2 ──────────────────────────────────────────────
function smTemVantagem(key) { return SM.advantages.includes(key) || smFreeAdvantages().has(key); }
function smTemFeiticaria() { return smTemVantagem("feiticaria"); }
function smTemAcademiaDuelista() { return smTemVantagem("academiaduelista"); }
function smNumIdiomas() { return smTraitFinal("argucia"); }
function smFortunaPersiste() { return smTemVantagem("rico") || smTemVantagem("benfeitor"); }

// expõe para o navegador (e para o harness de testes em Node)
Object.assign(window, {
  SM_STORAGE_KEY, SM_STORAGE_KEY_V1, smDefaultState, smSave, smMergeDefaults, smLoad, smFlashSaved,
  smTraitFinal, smTraitFreeSpent, smTraitFreeLeft, smBackgroundSkillBonus,
  smSkillFinal, smSkillPointsSpent, smSkillPointsLeft,
  smFreeAdvantages, smAdvantagePointsSpent, smAdvantagePointsLeft,
  smTemVantagem, smTemFeiticaria, smTemAcademiaDuelista, smNumIdiomas, smFortunaPersiste,
});
