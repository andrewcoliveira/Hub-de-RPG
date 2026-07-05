import { useRef } from "react";
import { useFicha } from "@/store/ficha";
import { PillToggle } from "@/components/PillToggle";
import { exportFicha, importFichaFromFile, printSheet } from "@/lib/persistIO";

export function TopBar() {
  const mode = useFicha((s) => s.mode);
  const setMode = useFicha((s) => s.setMode);
  const reset = useFicha((s) => s.reset);
  const importFicha = useFicha((s) => s.importFicha);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    exportFicha(useFicha.getState().f);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importFichaFromFile(file, importFicha);
    }
    // Permite reimportar o mesmo arquivo em seguida.
    e.target.value = "";
  }

  return (
    <header className="sm-topbar no-print">
      <div className="sm-brand">
        <div className="sm-brand-mark" aria-hidden="true">
          ✦
        </div>
        <div>
          <h1 className="sm-brand-title">7ºMAR</h1>
          <span className="sm-brand-sub">Criador de Fichas</span>
        </div>
      </div>

      <PillToggle
        name="Modo"
        value={mode}
        onChange={setMode}
        options={[
          { value: "criar", label: "Criação" },
          { value: "jogo", label: "Jogo" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleExport} className="sm-btn">
          <span aria-hidden="true">⭳</span> Exportar
        </button>
        <button type="button" onClick={handleImportClick} className="sm-btn">
          <span aria-hidden="true">⭱</span> Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
        <button type="button" onClick={printSheet} className="sm-btn">
          <span aria-hidden="true">⎙</span> Imprimir
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window === "undefined" || window.confirm("Recomeçar a ficha do zero?")) {
              reset();
            }
          }}
          className="sm-btn sm-btn-danger"
        >
          Recomeçar
        </button>
      </div>
    </header>
  );
}
