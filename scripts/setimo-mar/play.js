// ══ 7º MAR — Play: ficha viva (stub) ══
function renderPlay() {
  const el = document.getElementById("sm-play");
  if (!el) return;
  el.innerHTML = `<p class="sm-hint">Ficha de Jogo — em construção.</p>`;
}
Object.assign(window, { renderPlay });
