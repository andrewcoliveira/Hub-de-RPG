// ══════════════════════════════════════════════════════════════════
//  7º MAR — CRIAÇÃO (ações, renderizadores, completude, resumo)
//  Depende de scripts/setimo-mar/data-core.js e scripts/setimo-mar/state.js
// ══════════════════════════════════════════════════════════════════

// ── Ações (chamadas pela UI) ────────────────────────────────────────
function smSetConcept(field, value) {
  SM.concept[field] = value;
  smSave();
}
function smSelectNation(key) {
  SM.nation = key;
  // se o Atributo do bônus não é mais válido para a nova nação, zera
  const valid = SM_NATIONS[key].traits;
  if (!valid.includes(SM.nationTrait)) SM.nationTrait = null;
  renderNation(); renderTraits(); renderBudgets(); renderSummaryButton(); smSave();
}
function smSetNationTrait(traitKey) {
  SM.nationTrait = (SM.nationTrait === traitKey) ? null : traitKey;
  renderNation(); renderTraits(); renderBudgets(); renderSummaryButton(); smSave();
}
function smAdjustTrait(key, delta) {
  const cur = SM.traits[key];
  const next = cur + delta;
  if (next < SM_CREATION.traitBase) return;                 // não abaixo do base
  if (next > SM_CREATION.traitCreationMax) return;          // teto de criação
  if (delta > 0 && smTraitFreeLeft() <= 0) return;          // sem pontos livres
  SM.traits[key] = next;
  renderTraits(); renderBudgets(); renderSummaryButton(); smSave();
}
function smToggleBackground(key) {
  const i = SM.backgrounds.indexOf(key);
  if (i >= 0) {
    SM.backgrounds.splice(i, 1);
  } else {
    if (SM.backgrounds.length >= SM_CREATION.backgroundsToPick) return; // máx 2
    SM.backgrounds.push(key);
  }
  renderBackgrounds(); renderSkills(); renderAdvantages(); renderBudgets(); renderSummaryButton(); smSave();
}
function smAdjustSkill(key, delta) {
  const cur = SM.skills[key];
  const next = cur + delta;
  if (next < 0) return;
  if (next > SM_CREATION.skillCreationMax) return;          // máx Grau 3 (pontos)
  if (delta > 0 && smSkillPointsLeft() <= 0) return;        // sem pontos
  SM.skills[key] = next;
  renderSkills(); renderBudgets(); renderSummaryButton(); smSave();
}
function smToggleAdvantage(key) {
  const free = smFreeAdvantages();
  const i = SM.advantages.indexOf(key);
  if (i >= 0) {
    SM.advantages.splice(i, 1);
  } else {
    const a = SM_ADVANTAGES[key];
    const cost = free.has(key) ? 0 : a.cost;
    if (cost > smAdvantagePointsLeft()) return;             // não cabe no orçamento
    SM.advantages.push(key);
  }
  renderAdvantages(); renderBudgets(); renderSummaryButton(); smSave();
  if (typeof smRefreshTabs === "function") smRefreshTabs();
}
function smSetArcana(type, key) {
  const other = type === "virtude" ? "hubris" : "virtude";
  if (SM.arcana[other] === key) return;                    // cartas diferentes
  SM.arcana[type] = (SM.arcana[type] === key) ? null : key;
  renderArcana(); renderSummaryButton(); smSave();
}
function smReset() {
  if (!confirm("Apagar esta ficha e começar do zero?")) return;
  SM = smDefaultState();
  smSave();
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Renderização ────────────────────────────────────────────────────
function renderConcept() {
  const map = { name: "sm-name", player: "sm-player", concept: "sm-concept", religion: "sm-religion" };
  Object.entries(map).forEach(([f, id]) => {
    const el = document.getElementById(id);
    if (el) el.value = SM.concept[f] || "";
  });
}

function renderNation() {
  const grid = document.getElementById("sm-nation-grid");
  if (grid) {
    grid.innerHTML = Object.entries(SM_NATIONS).map(([key, n]) => {
      const active = SM.nation === key ? " sm-selected" : "";
      const mag = n.feiticaria ? `<span class="sm-tag sm-tag-mag">✦ ${n.feiticaria}</span>` : "";
      const pair = n.traits.map(t => SM_TRAITS.find(x => x.key === t).abbr).join(" / ");
      return `<button class="sm-card sm-nation-card${active}" onclick="smSelectNation('${key}')">
        <span class="sm-card-name">${n.label}</span>
        <span class="sm-card-blurb">${n.blurb}</span>
        <span class="sm-card-tags"><span class="sm-tag">+1 ${pair}</span>${mag}</span>
      </button>`;
    }).join("");
  }
  // escolha do Atributo do bônus de Nação
  const box = document.getElementById("sm-nation-trait");
  if (box) {
    if (!SM.nation) { box.innerHTML = `<p class="sm-hint">Escolha uma Nação para liberar o bônus de Atributo.</p>`; }
    else {
      const opts = SM_NATIONS[SM.nation].traits.map(t => {
        const tr = SM_TRAITS.find(x => x.key === t);
        const on = SM.nationTrait === t ? " sm-selected" : "";
        return `<button class="sm-pill${on}" onclick="smSetNationTrait('${t}')">+1 ${tr.label}</button>`;
      }).join("");
      box.innerHTML = `<p class="sm-hint">Bônus de <strong>${SM_NATIONS[SM.nation].label}</strong> — escolha onde aplicar o +1:</p><div class="sm-pill-row">${opts}</div>`;
    }
  }
}

function renderTraits() {
  const wrap = document.getElementById("sm-traits");
  if (!wrap) return;
  wrap.innerHTML = SM_TRAITS.map(t => {
    const base = SM.traits[t.key];
    const nb = SM.nationTrait === t.key ? SM_CREATION.traitNation : 0;
    const final = base + nb;
    const nbTag = nb ? `<span class="sm-bonus">+${nb} Nação</span>` : "";
    return `<div class="sm-trait-row">
      <div class="sm-trait-info">
        <span class="sm-trait-name">${t.label}</span>
        <span class="sm-trait-desc">${t.desc}</span>
      </div>
      <div class="sm-stepper">
        <button class="sm-step-btn" onclick="smAdjustTrait('${t.key}',-1)" ${base<=SM_CREATION.traitBase?'disabled':''}>−</button>
        <span class="sm-step-val">${base}</span>
        <button class="sm-step-btn" onclick="smAdjustTrait('${t.key}',1)" ${(base>=SM_CREATION.traitCreationMax||smTraitFreeLeft()<=0)?'disabled':''}>+</button>
      </div>
      ${nbTag}
      <span class="sm-trait-final" title="Grau final (dados base deste Atributo)">${final}</span>
    </div>`;
  }).join("");
}

function renderBackgrounds() {
  const grid = document.getElementById("sm-bg-grid");
  if (!grid) return;
  grid.innerHTML = Object.entries(SM_BACKGROUNDS).map(([key, b]) => {
    const on = SM.backgrounds.includes(key);
    const full = !on && SM.backgrounds.length >= SM_CREATION.backgroundsToPick;
    const skillNames = b.skills.map(s => SM_SKILLS.find(x => x.key === s).label).join(", ");
    const adv = SM_ADVANTAGES[b.freeAdvantage];
    return `<button class="sm-card sm-bg-card${on?' sm-selected':''}${full?' sm-disabled':''}" onclick="smToggleBackground('${key}')" ${full?'disabled':''}>
      <span class="sm-card-name">${b.label}</span>
      <span class="sm-card-line"><strong>Perícias:</strong> ${skillNames}</span>
      <span class="sm-card-line"><strong>Vantagem:</strong> ${adv?adv.label:b.freeAdvantage}</span>
      <span class="sm-card-quirk">“${b.quirk}”</span>
    </button>`;
  }).join("");
  const count = document.getElementById("sm-bg-count");
  if (count) count.textContent = `${SM.backgrounds.length} / ${SM_CREATION.backgroundsToPick}`;
}

function renderSkills() {
  const wrap = document.getElementById("sm-skills");
  if (!wrap) return;
  wrap.innerHTML = SM_SKILLS.map(s => {
    const pts = SM.skills[s.key];
    const bg = smBackgroundSkillBonus(s.key);
    const final = pts + bg;
    const trait = SM_TRAITS.find(x => x.key === s.trait);
    const bgTag = bg ? `<span class="sm-bonus" title="Grau 1 por Formação">+${bg} Form.</span>` : "";
    return `<div class="sm-skill-row">
      <div class="sm-skill-info">
        <span class="sm-skill-name">${s.label}</span>
        <span class="sm-skill-desc">${s.desc} <em>(par comum: ${trait.abbr})</em></span>
      </div>
      <div class="sm-stepper">
        <button class="sm-step-btn" onclick="smAdjustSkill('${s.key}',-1)" ${pts<=0?'disabled':''}>−</button>
        <span class="sm-step-val">${pts}</span>
        <button class="sm-step-btn" onclick="smAdjustSkill('${s.key}',1)" ${(pts>=SM_CREATION.skillCreationMax||smSkillPointsLeft()<=0)?'disabled':''}>+</button>
      </div>
      ${bgTag}
      <span class="sm-skill-final" title="Grau final da Perícia">${final}</span>
    </div>`;
  }).join("");
}

function renderAdvantages() {
  const free = smFreeAdvantages();
  const grid = document.getElementById("sm-adv-grid");
  if (grid) {
    grid.innerHTML = Object.entries(SM_ADVANTAGES).map(([key, a]) => {
      const isFree = free.has(key);
      const on = SM.advantages.includes(key) || isFree;
      const cost = isFree ? 0 : a.cost;
      const noRoom = !on && cost > smAdvantagePointsLeft();
      const costTag = isFree ? `<span class="sm-tag sm-tag-free">grátis (Formação)</span>` : `<span class="sm-tag">${a.cost} pt${a.cost>1?'s':''}</span>`;
      return `<button class="sm-card sm-adv-card${on?' sm-selected':''}${(noRoom)?' sm-disabled':''}"
        onclick="smToggleAdvantage('${key}')" ${(isFree||noRoom)?'disabled':''} title="${isFree?'Concedida por uma Formação escolhida':''}">
        <span class="sm-card-name">${a.label} ${costTag}</span>
        <span class="sm-card-blurb">${a.desc}</span>
      </button>`;
    }).join("");
  }
  const freeBox = document.getElementById("sm-adv-free");
  if (freeBox) {
    if (free.size === 0) { freeBox.innerHTML = ""; }
    else {
      const names = [...free].map(k => SM_ADVANTAGES[k] ? SM_ADVANTAGES[k].label : k).join(", ");
      freeBox.innerHTML = `<p class="sm-hint">✦ Grátis das Formações: <strong>${names}</strong> (já incluídas, não gastam pontos).</p>`;
    }
  }
}

function renderArcana() {
  ["virtude", "hubris"].forEach(type => {
    const box = document.getElementById("sm-arcana-" + type);
    if (!box) return;
    box.innerHTML = Object.entries(SM_ARCANA).map(([key, c]) => {
      const on = SM.arcana[type] === key;
      const takenByOther = SM.arcana[type === "virtude" ? "hubris" : "virtude"] === key;
      const text = type === "virtude" ? c.virtude : c.hubris;
      return `<button class="sm-card sm-arcana-card${on?' sm-selected':''}${takenByOther?' sm-disabled':''}"
        onclick="smSetArcana('${type}','${key}')" ${takenByOther?'disabled':''}>
        <span class="sm-card-name">${c.label}</span>
        <span class="sm-card-blurb">${text}</span>
      </button>`;
    }).join("");
  });
}

function renderBudgets() {
  const set = (id, val, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.classList.toggle("sm-over", cls === "over");
    el.classList.toggle("sm-done", cls === "done");
  };
  const tl = smTraitFreeLeft();
  set("sm-trait-budget", tl, tl < 0 ? "over" : (tl === 0 ? "done" : ""));
  const sl = smSkillPointsLeft();
  set("sm-skill-budget", sl, sl < 0 ? "over" : (sl === 0 ? "done" : ""));
  const al = smAdvantagePointsLeft();
  set("sm-adv-budget", al, al < 0 ? "over" : (al === 0 ? "done" : ""));
}

// ── Checklist de completude ─────────────────────────────────────────
function smCompleteness() {
  const issues = [];
  if (!SM.concept.name) issues.push("Dê um nome ao personagem.");
  if (!SM.nation) issues.push("Escolha uma Nação.");
  else if (!SM.nationTrait) issues.push("Escolha onde aplicar o +1 de Nação.");
  if (smTraitFreeLeft() > 0) issues.push(`Distribua os ${smTraitFreeLeft()} ponto(s) de Atributo restantes.`);
  if (SM.backgrounds.length < SM_CREATION.backgroundsToPick) issues.push("Escolha 2 Formações.");
  if (smSkillPointsLeft() > 0) issues.push(`Gaste os ${smSkillPointsLeft()} ponto(s) de Perícia restantes.`);
  if (!SM.arcana.virtude) issues.push("Escolha uma Virtude (Arcano).");
  if (!SM.arcana.hubris) issues.push("Escolha uma Húbris (Arcano).");
  return issues;
}
function renderSummaryButton() {
  const btn = document.getElementById("sm-summary-btn");
  const chk = document.getElementById("sm-checklist");
  if (!btn) return;
  const issues = smCompleteness();
  btn.disabled = issues.length > 0;
  if (chk) {
    chk.innerHTML = issues.length
      ? `<strong>Faltam:</strong><ul>${issues.map(i => `<li>${i}</li>`).join("")}</ul>`
      : `<span class="sm-ok">✓ Ficha completa — pronto para ver o resumo.</span>`;
  }
}

// ── Resumo ──────────────────────────────────────────────────────────
function renderSummary() {
  const el = document.getElementById("sm-summary");
  if (!el) return;
  const nation = SM.nation ? SM_NATIONS[SM.nation] : null;
  const traitsHtml = SM_TRAITS.map(t =>
    `<div class="sm-sum-stat"><span>${t.label}</span><b>${smTraitFinal(t.key)}</b></div>`).join("");
  const skillsHtml = SM_SKILLS.filter(s => smSkillFinal(s.key) > 0)
    .map(s => `<div class="sm-sum-skill"><span>${s.label}</span><b>${smSkillFinal(s.key)}</b></div>`).join("")
    || `<em>Nenhuma Perícia com Grau ainda.</em>`;
  const bgHtml = SM.backgrounds.map(b => SM_BACKGROUNDS[b].label).join(" + ") || "—";
  const free = smFreeAdvantages();
  const advAll = [...new Set([...SM.advantages, ...free])];
  const advHtml = advAll.length
    ? advAll.map(k => { const a = SM_ADVANTAGES[k]; return `<li>${a?a.label:k}${free.has(k)?' <em>(Formação)</em>':''}</li>`; }).join("")
    : "<li>—</li>";
  const virt = SM.arcana.virtude ? SM_ARCANA[SM.arcana.virtude] : null;
  const hub = SM.arcana.hubris ? SM_ARCANA[SM.arcana.hubris] : null;
  const quirks = SM.backgrounds.map(b => `<li>“${SM_BACKGROUNDS[b].quirk}”</li>`).join("") || "<li>—</li>";

  el.innerHTML = `
    <div class="sm-sheet" id="sm-print-area">
      <div class="sm-sheet-head">
        <h3>${SM.concept.name || "Herói sem nome"}</h3>
        <p>${SM.concept.concept || "—"} · ${nation ? nation.label : "Nação —"}${SM.concept.religion ? " · " + SM.concept.religion : ""}</p>
        ${SM.concept.player ? `<p class="sm-sheet-player">Jogador(a): ${SM.concept.player}</p>` : ""}
      </div>

      <div class="sm-sheet-block">
        <h4>Atributos</h4>
        <div class="sm-sum-stats">${traitsHtml}</div>
      </div>

      <div class="sm-sheet-cols">
        <div class="sm-sheet-block">
          <h4>Perícias</h4>
          <div class="sm-sum-skills">${skillsHtml}</div>
          <p class="sm-sheet-note">Pool de um Risco = Atributo + Perícia (o Atributo é escolhido conforme a abordagem).</p>
        </div>
        <div class="sm-sheet-block">
          <h4>Formações</h4>
          <p>${bgHtml}</p>
          <h4>Vantagens</h4>
          <ul class="sm-sheet-list">${advHtml}</ul>
        </div>
      </div>

      <div class="sm-sheet-block">
        <h4>Arcano</h4>
        <p><strong>Virtude — ${virt ? virt.label : "—"}:</strong> ${virt ? virt.virtude : ""}</p>
        <p><strong>Húbris — ${hub ? hub.label : "—"}:</strong> ${hub ? hub.hubris : ""}</p>
      </div>

      <div class="sm-sheet-block">
        <h4>Peculiaridades</h4>
        <ul class="sm-sheet-list">${quirks}</ul>
      </div>

      <div class="sm-sheet-block sm-sheet-tracks">
        <div><h4>Pontos Heroicos</h4><p>Começa cada sessão com 1.</p></div>
        <div><h4>Espiral da Morte</h4><p>4 Ferimentos Dramáticos = Desamparado.</p></div>
        ${nation && nation.feiticaria ? `<div><h4>Feitiçaria disponível</h4><p>${nation.feiticaria} (requer a Vantagem Feitiçaria — módulo na v2).</p></div>` : ""}
      </div>
    </div>

    <div class="sm-summary-actions no-print">
      <button class="sm-btn" onclick="smPrint()">🖨️ Imprimir / PDF</button>
      <button class="sm-btn" onclick="smExport()">⬇️ Exportar JSON</button>
    </div>`;
  el.style.display = "block";
}

// ── Feitiçaria (aba 7) ───────────────────────────────────────────────
function smSetSchool(key) {
  SM.sorcery.school = key;
  SM.sorcery.powers = [];
  renderSorcery();
  if (typeof renderTabBar === "function") renderTabBar();
  smSave();
}
function smSorceryBudget() {
  const buys = SM.advantages.filter(a => a === "feiticaria").length + (smFreeAdvantages().has("feiticaria") ? 1 : 0);
  const n = Math.max(buys, 1);
  return { maiores: 1 * n, menores: 2 * n };
}
function smPowerRank(key) {
  const s = SM_SORCERY[SM.sorcery.school];
  if (!s) return null;
  if (s.maiores.some(p => p.key === key)) return "maior";
  if (s.menores.some(p => p.key === key)) return "menor";
  return null;
}
function smToggleSorceryPower(key) {
  const i = SM.sorcery.powers.indexOf(key);
  if (i >= 0) {
    SM.sorcery.powers.splice(i, 1);
  } else {
    const rank = smPowerRank(key);
    if (!rank) return;
    const budget = smSorceryBudget();
    const chosen = SM.sorcery.powers.filter(k => smPowerRank(k) === rank).length;
    if (chosen >= budget[rank + "es"]) return; // "maiores"/"menores"
    SM.sorcery.powers.push(key);
  }
  renderSorcery();
  smSave();
}
function renderSorcery() {
  const el = document.getElementById("sm-sorcery");
  if (!el) return;
  if (!smTemFeiticaria()) {
    el.innerHTML = `<p class="sm-hint">Compre a Vantagem <strong>Feitiçaria</strong> (Passo 5) para desbloquear.</p>`;
    return;
  }
  const nationSchool = SM.nation && SM_NATIONS[SM.nation].feiticaria;
  const schoolKeys = Object.keys(SM_SORCERY);
  const sel = SM.sorcery.school;
  const schoolPicker = `<div class="sm-pill-row">${schoolKeys.map(k => `<button class="sm-pill${sel===k?' sm-selected':''}" onclick="smSetSchool('${k}')">${SM_SORCERY[k].label}</button>`).join("")}</div>`;
  let body = "";
  if (sel) {
    const s = SM_SORCERY[sel];
    const b = smSorceryBudget();
    const card = (p, rank) => {
      const on = SM.sorcery.powers.includes(p.key);
      return `<button class="sm-card sm-adv-card${on?' sm-selected':''}" onclick="smToggleSorceryPower('${p.key}')"><span class="sm-card-name">${p.nome} <span class="sm-tag">${rank}</span></span><span class="sm-card-blurb">${p.desc}</span></button>`;
    };
    body = `<p class="sm-hint">Escola: <strong>${s.label}</strong> · Fonte: ${s.fonte} · Custo: ${s.custo}. Orçamento: ${b.maiores} Maior(es) + ${b.menores} Menor(es).</p>
      <h3 class="sm-sub">Maiores</h3><div class="sm-grid sm-adv-grid">${s.maiores.map(p => card(p, 'Maior')).join("")}</div>
      <h3 class="sm-sub">Menores</h3><div class="sm-grid sm-adv-grid">${s.menores.map(p => card(p, 'Menor')).join("")}</div>`;
  }
  el.innerHTML = `<p class="sm-hint">Escolha a escola${nationSchool?` (a da sua Nação é <strong>${nationSchool}</strong>)`:""}:</p>${schoolPicker}${body}`;
}

// ── Estilos de Duelo (aba 8) ─────────────────────────────────────────
function smSetStyle(key) {
  SM.dueling.style = (SM.dueling.style === key ? null : key);
  renderDueling();
  if (typeof renderTabBar === "function") renderTabBar();
  smSave();
}
function renderDueling() {
  const el = document.getElementById("sm-dueling");
  if (!el) return;
  if (!smTemAcademiaDuelista()) {
    el.innerHTML = `<p class="sm-hint">Compre a Vantagem <strong>Academia Duelista</strong> (Passo 5) para desbloquear.</p>`;
    return;
  }
  const styles = Object.entries(SM_DUELING_STYLES).map(([k, s]) =>
    `<button class="sm-card${SM.dueling.style===k?' sm-selected':''}" onclick="smSetStyle('${k}')"><span class="sm-card-name">${s.label}</span><span class="sm-card-blurb">${s.nacao} — ${s.bonus}</span></button>`
  ).join("");
  const man = SM_MANEUVERS.map(m => `<li><strong>${m.nome}:</strong> ${m.efeito}</li>`).join("");
  el.innerHTML = `<p class="sm-hint">Escolha um Estilo Duelista:</p><div class="sm-grid sm-adv-grid">${styles}</div><h3 class="sm-sub">Manobras (referência)</h3><ul class="sm-sheet-list">${man}</ul>`;
}

// ── Histórias Heroicas (aba 9) ───────────────────────────────────────
function smApplyStoryPreset(key) {
  const p = SM_STORY_PRESETS[key];
  if (!p) return;
  SM.stories[0] = { nome: p.label, final: p.final, recompensa: "", passos: [{ texto: p.primeiroPasso, feito: false }] };
  renderStories();
  smSave();
}
function smSetStoryField(i, field, val) {
  SM.stories[i][field] = val;
  smSave();
}
function smAddStoryStep(i, texto) {
  if (!texto) return;
  SM.stories[i].passos.push({ texto, feito: false });
  renderStories();
  smSave();
}
function smToggleStoryStep(i, j) {
  SM.stories[i].passos[j].feito = !SM.stories[i].passos[j].feito;
  renderStories();
  smSave();
}
function renderStories() {
  const el = document.getElementById("sm-stories");
  if (!el) return;
  const s = SM.stories[0];
  const presets = Object.entries(SM_STORY_PRESETS).map(([k, p]) =>
    `<button class="sm-pill" onclick="smApplyStoryPreset('${k}')">${p.label}</button>`
  ).join("");
  const passos = s.passos.map((p, j) =>
    `<li><label><input type="checkbox" ${p.feito?'checked':''} onchange="smToggleStoryStep(0,${j})"> ${p.texto}</label></li>`
  ).join("");
  el.innerHTML = `<p class="sm-hint">Ponto de Partida (opcional): <span class="sm-pill-row">${presets}</span></p>
    <label class="sm-field"><span>Nome/Mantra</span><input value="${s.nome}" oninput="smSetStoryField(0,'nome',this.value)"></label>
    <label class="sm-field"><span>Final</span><input value="${s.final}" oninput="smSetStoryField(0,'final',this.value)"></label>
    <label class="sm-field"><span>Recompensa</span><input value="${s.recompensa}" oninput="smSetStoryField(0,'recompensa',this.value)"></label>
    <h3 class="sm-sub">Passos</h3><ul class="sm-sheet-list">${passos}</ul>
    <div class="sm-pill-row"><input id="sm-new-step" placeholder="Próximo passo..."><button class="sm-btn" onclick="smAddStoryStep(0,document.getElementById('sm-new-step').value); document.getElementById('sm-new-step').value=''">+ Passo</button></div>`;
}

// ── Sociedades Secretas (aba 10) ─────────────────────────────────────
function smSetSociety(key) {
  SM.society.key = (SM.society.key === key ? null : key);
  renderSocieties();
  if (typeof renderTabBar === "function") renderTabBar();
  smSave();
}
function renderSocieties() {
  const el = document.getElementById("sm-societies");
  if (!el) return;
  el.innerHTML = `<p class="sm-hint">Escolha 0 ou 1 sociedade (começa com Favor 2):</p><div class="sm-grid sm-adv-grid">` +
    Object.entries(SM_SOCIETIES).map(([k, s]) => {
      const dis = s.heroisNao ? ' sm-disabled' : '';
      const on = SM.society.key === k ? ' sm-selected' : '';
      return `<button class="sm-card${on}${dis}" ${s.heroisNao ? 'disabled title="Heróis não entram"' : ''} onclick="smSetSociety('${k}')"><span class="sm-card-name">${s.label}</span><span class="sm-card-blurb">${s.quer}</span></button>`;
    }).join("") + `</div>`;
}

// ── Exportar / Importar / Imprimir ──────────────────────────────────
function smExport() {
  const blob = new Blob([JSON.stringify(SM, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (SM.concept.name || "ficha-7omar").replace(/[^\w\-]+/g, "_");
  a.href = url; a.download = `${safe}.7omar.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function smImportFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      SM = Object.assign(smDefaultState(), data);
      SM_SKILLS.forEach(s => { if (SM.skills[s.key] == null) SM.skills[s.key] = 0; });
      smSave(); renderAll();
      alert("Ficha importada com sucesso.");
    } catch (err) { alert("Arquivo inválido: " + err.message); }
  };
  reader.readAsText(file);
  input.value = "";
}
function smPrint() {
  if (document.getElementById("sm-summary").style.display === "none") renderSummary();
  window.print();
}

// ── Boot ────────────────────────────────────────────────────────────
function renderAll() {
  renderConcept(); renderNation(); renderTraits(); renderBackgrounds();
  renderSkills(); renderAdvantages(); renderArcana(); renderBudgets(); renderSummaryButton();
  renderSorcery();
  renderDueling();
  renderStories();
  renderSocieties();
  const sum = document.getElementById("sm-summary");
  if (sum) sum.style.display = "none";
}
// expõe para os onclick inline (smInit agora vive em app.js)
Object.assign(window, {
  smSetConcept, smSelectNation, smSetNationTrait, smAdjustTrait, smToggleBackground,
  smAdjustSkill, smToggleAdvantage, smSetArcana, smReset, renderSummary,
  smExport, smImportFile, smPrint, renderAll,
  smSetSchool, smSorceryBudget, smPowerRank, smToggleSorceryPower, renderSorcery,
  smSetStyle, renderDueling,
  smApplyStoryPreset, smSetStoryField, smAddStoryStep, smToggleStoryStep, renderStories,
  smSetSociety, renderSocieties,
});
