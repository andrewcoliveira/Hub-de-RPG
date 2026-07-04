// ══════════════════════════════════════════════════════════════════
//  7º MAR — Play: ficha viva (Modo Jogo)
//  Depende de scripts/setimo-mar/data-core.js, state.js, create.js
// ══════════════════════════════════════════════════════════════════

function _clamp(v, min, max) { return Math.max(min, max == null ? v : Math.min(v, max)); }

function smAdjustWound(field, delta) {
  const max = field === "ferimentosDramaticos" ? 4 : null;
  SM.play[field] = _clamp((SM.play[field] || 0) + delta, 0, max);
  renderPlay(); smSave();
}
function smAdjustHeroPoints(d) {
  SM.play.pontosHeroicos = _clamp(SM.play.pontosHeroicos + d, 0, null);
  renderPlay(); smSave();
}
function smAdjustFavor(d) {
  SM.play.favor = _clamp(SM.play.favor + d, 0, null);
  renderPlay(); smSave();
}
function smSetFortuna(n) { SM.play.fortuna = +n || 0; smSave(); }
function smSetNotas(t) { SM.play.notas = t; smSave(); }

const SM_SPIRAL = [
  "Saudável",
  "1+ Ferimento Dramático (dado extra em Riscos próprios)",
  "2+ (Vilões ganham 2 dados extras contra você)",
  "3+ (seus 10s explodem)",
  "Desamparado",
];

function renderPlay() {
  const el = document.getElementById("sm-play");
  if (!el) return;

  const traits = SM_TRAITS.map(t => `<div class="sm-sum-stat"><span>${t.label}</span><b>${smTraitFinal(t.key)}</b></div>`).join("");
  const skills = SM_SKILLS.filter(s => smSkillFinal(s.key) > 0)
    .map(s => `<div class="sm-sum-skill"><span>${s.label}</span><b>${smSkillFinal(s.key)}</b></div>`).join("") || "<em>—</em>";
  const dram = SM.play.ferimentosDramaticos;
  const stepBox = (field, val, max) => `<div class="sm-track"><button class="sm-step-btn" onclick="smAdjustWound('${field}',-1)">−</button><span class="sm-step-val">${val}${max ? "/" + max : ""}</span><button class="sm-step-btn" onclick="smAdjustWound('${field}',1)">+</button></div>`;
  const soc = SM.society.key && typeof SM_SOCIETIES !== "undefined" && SM_SOCIETIES[SM.society.key] ? SM_SOCIETIES[SM.society.key].label : "—";

  el.innerHTML = `<div class="sm-sheet"><div class="sm-sheet-head"><h3>${SM.concept.name || "Herói"}</h3><p>${SM.concept.concept || ""} · ${SM.nation ? SM_NATIONS[SM.nation].label : ""}</p></div>
   <div class="sm-sheet-block"><h4>Atributos</h4><div class="sm-sum-stats">${traits}</div></div>
   <div class="sm-play-tracks">
     <div class="sm-play-card"><h4>Pontos Heroicos</h4><div class="sm-track"><button class="sm-step-btn" onclick="smAdjustHeroPoints(-1)">−</button><span class="sm-step-val">${SM.play.pontosHeroicos}</span><button class="sm-step-btn" onclick="smAdjustHeroPoints(1)">+</button></div></div>
     <div class="sm-play-card"><h4>Ferimentos</h4>${stepBox("ferimentos", SM.play.ferimentos, null)}</div>
     <div class="sm-play-card"><h4>Espiral da Morte</h4>${stepBox("ferimentosDramaticos", dram, 4)}<p class="sm-hint">${SM_SPIRAL[dram]}</p></div>
     <div class="sm-play-card"><h4>Favor (${soc})</h4><div class="sm-track"><button class="sm-step-btn" onclick="smAdjustFavor(-1)">−</button><span class="sm-step-val">${SM.play.favor}</span><button class="sm-step-btn" onclick="smAdjustFavor(1)">+</button></div></div>
     <div class="sm-play-card"><h4>Fortuna</h4><input type="number" value="${SM.play.fortuna}" oninput="smSetFortuna(this.value)"></div>
   </div>
   <div class="sm-sheet-cols">
     <div class="sm-sheet-block"><h4>Perícias</h4><div class="sm-sum-skills">${skills}</div></div>
     <div class="sm-sheet-block"><h4>Notas</h4><textarea rows="6" style="width:100%" oninput="smSetNotas(this.value)">${SM.play.notas || ""}</textarea></div>
   </div>
   <div class="sm-summary-actions no-print"><button class="sm-btn" onclick="smPrint()">🖨️ Imprimir ficha</button><button class="sm-btn" onclick="smExport()">⬇️ Exportar</button></div></div>`;
}

Object.assign(window, {
  _clamp, smAdjustWound, smAdjustHeroPoints, smAdjustFavor, smSetFortuna, smSetNotas, SM_SPIRAL, renderPlay,
});
