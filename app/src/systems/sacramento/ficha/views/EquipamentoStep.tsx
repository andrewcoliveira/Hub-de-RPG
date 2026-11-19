// ══════════════════════════════════════════════════════════════════
//  7 · EQUIPAMENTO — O Grande Catálogo de Equipamento (1880)
// ══════════════════════════════════════════════════════════════════

import {
  CARRIED_WEAPONS, ITEMS, ITEM_CATS, STARTING_MONEY, canBuy, fmtLines, fmtMoney, hasDiscount, itemPrice, moneyLeft,
  moneySpent, ownedItems, packing, setQty, totalMoney,
} from "../engine";
import { useFicha, useSacramento } from "../store";
import { DamageTag, Meter, Stepper, useUi } from "./ui";

export function EquipamentoStep() {
  const s = useSacramento();
  const update = useFicha((x) => x.update);
  const cat = useUi((u) => u.itemCat);
  const search = useUi((u) => u.itemSearch);
  const p = packing(s);
  const left = moneyLeft(s);
  const owned = ownedItems(s);
  const q = search.trim().toLocaleLowerCase("pt");
  const shown = ITEMS.filter((i) =>
    (q ? i.name.toLocaleLowerCase("pt").includes(q) : cat === "all" || (cat === "mine" ? !!s.items[i.key] : i.cat === cat)));
  const catInfo = ITEM_CATS.find((c) => c.key === cat);
  const isWeaponCat = cat === "armas" || cat === "estrangeiro";

  return (
    <>
      <div className="panel toolbar gear-toolbar">
        <div className="money-box">
          <span className="eyebrow">Na algibeira</span>
          <b className={`money num ${left < 0 ? "neg" : ""}`}>{fmtMoney(left)}</b>
          <small>{fmtMoney(totalMoney(s))} − {fmtMoney(moneySpent(s))} gastos</small>
        </div>
        <div className="toolbar-meter">
          <Meter label="Mochila (linhas)" used={p.used} total={p.capacity} format={(n) => `${Math.floor(n) || (n % 1 ? "" : "0")}${n % 1 ? "½" : ""}`}
            note={`Mochila com 10 linhas${p.capacity > 10 ? ` + ${p.capacity - 10} de montaria/veículos` : ""}. Armas no corpo: ${p.carried.length ? p.carried.join(", ") : "nenhuma"}.`} />
        </div>
        <label className="field extra-money">
          <span className="field-label">Dinheiro extra</span>
          <input type="number" className="input" min={0} step={1} value={s.extraMoney}
            onChange={(e) => { const v = Math.max(0, Number(e.target.value) || 0); update((d) => { d.extraMoney = v; }); }} />
        </label>
      </div>
      <p className="muted small">
        Você começa com <b>${STARTING_MONEY}</b> para gastar com tudo, das ceroulas às armas. Nesta primeira compra vale o <b>preço máximo</b> (nada de barganhar);
        o que sobrar fica com você. Até {CARRIED_WEAPONS} armas vão em coldres, bandoleiras e bainhas sem ocupar a mochila, mais uma faca.
        {s.skills.includes("sorrisao-chapeu-na-mao") ? <> Com <b>Sorrisão, Chapéu na Mão</b>, itens comuns saem com 25% de desconto.</> : null}
      </p>

      <div className="gear-filters">
        <div className="chip-row" role="group" aria-label="Seções do catálogo">
          {ITEM_CATS.map((c) => (
            <button key={c.key} type="button" className="chip" aria-pressed={!q && cat === c.key} onClick={() => useUi.setState({ itemCat: c.key, itemSearch: "" })}>{c.label}</button>
          ))}
          <button type="button" className="chip" aria-pressed={!q && cat === "mine"} onClick={() => useUi.setState({ itemCat: "mine", itemSearch: "" })}>
            Comprados <span className="count">{owned.length}</span>
          </button>
        </div>
        <div className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input type="search" placeholder="Buscar no catálogo…" aria-label="Buscar no catálogo" value={search} onChange={(e) => useUi.setState({ itemSearch: e.target.value })} />
        </div>
      </div>
      {!q && catInfo?.note && <p className="cat-note small">{catInfo.note}</p>}

      <div className="table-wrap catalog-wrap">
        <table className="catalog">
          <thead>
            <tr>
              <th>Item</th>
              {(isWeaponCat || q || cat === "mine") && <th>Dano</th>}
              {(isWeaponCat) && <th>Balas · Recarga</th>}
              {cat === "protecao" && <th>Redução · Limite · Penalidade</th>}
              <th className="num">Preço</th>
              <th>Espaço</th>
              <th className="num">Qtd.</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => {
              const qty = s.items[i.key] ?? 0;
              const price = itemPrice(s, i);
              return (
                <tr key={i.key} className={qty ? "is-owned" : ""}>
                  <td>
                    <b>{i.name}</b>
                    {i.desc && <small className="item-desc">{i.desc}</small>}
                  </td>
                  {(isWeaponCat || q || cat === "mine") && (
                    <td>{i.damage ? <><DamageTag {...i.damage} />{i.damage2 && <DamageTag {...i.damage2} />}</> : <span className="muted">—</span>}</td>
                  )}
                  {isWeaponCat && <td className="small">{[i.bullets, i.reload].filter(Boolean).join(" · ") || "—"}</td>}
                  {cat === "protecao" && <td className="small">{i.armor ? <><DamageTag vida={i.armor.reduction} /> · limite <DamageTag vida={i.armor.limit} /><br />{i.armor.penalty}</> : "—"}</td>}
                  <td className="num">
                    {canBuy(i) ? (
                      <>
                        <b>{fmtMoney(price)}</b>
                        {i.min !== i.max && <small className="price-range">{fmtMoney(i.min)}–{fmtMoney(i.max)}</small>}
                        {hasDiscount(s, i) && <small className="price-range">−25%</small>}
                      </>
                    ) : <span className="muted small">não se vende</span>}
                  </td>
                  <td className="small">{i.holster === "coldre" ? "coldre" : i.holster === "bainha" ? "bainha" : i.cat === "roupas" ? "vestida" : fmtLines(i.space)}{i.stack ? ` (até ${i.stack})` : ""}{i.carries ? ` · +${i.carries} linhas` : ""}</td>
                  <td className="num">
                    {canBuy(i) && <Stepper value={qty} min={0} max={99} label={i.name} onChange={(v) => update((d) => setQty(d, i.key, v))} />}
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={6} className="muted">Nada encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {s.items[ITEMS.find((i) => i.name === "Bolsa de montaria")!.key] && !s.mount.enabled && (
        <p className="warn-text small">A Bolsa de montaria só conta espaço se o personagem tiver uma montaria (etapa Montaria).</p>
      )}
    </>
  );
}
