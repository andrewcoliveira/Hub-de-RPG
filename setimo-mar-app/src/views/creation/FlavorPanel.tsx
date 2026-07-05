/** Coluna de pergaminho — flavor náutico do 7º Mar. Decorativa (no-print).
 *  Some no mobile via CSS (.sm-paper-col vira full-width acima de tudo). */
const FLAVOR = [
  { text: "O mar não é um obstáculo — é um estilo de vida.", doodle: "≈⛵" },
  { text: "Um Herói se mede pelo Panache, não pelo ouro no bolso.", doodle: "⚜" },
  { text: "Gaste um Ponto Heroico. A sorte favorece os audazes.", doodle: "🎲" },
  { text: "Toda boa história começa com uma péssima ideia e um bom porto.", doodle: "🗺" },
  { text: "Meu navio, minhas regras, meu rum.", doodle: "☠" },
];

export function FlavorPanel() {
  return (
    <aside className="sm-frame sm-paper-col no-print" aria-label="Notas de bordo">
      <div className="sm-paper">
        <div className="sm-paper-head">Notas de Bordo</div>
        {FLAVOR.map((f, i) => (
          <div key={i} className="sm-joke">
            {f.text}
            <span className="sm-doodle" aria-hidden="true">
              {f.doodle}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
