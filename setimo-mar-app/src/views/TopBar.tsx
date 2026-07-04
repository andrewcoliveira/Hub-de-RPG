import { useRef } from "react";
import { useFicha } from "@/store/ficha";
import { PillToggle } from "@/components/PillToggle";
import { exportFicha, importFichaFromFile, printSheet } from "@/lib/persistIO";

export function TopBar() {
  const mode = useFicha((s) => s.mode);
  const theme = useFicha((s) => s.theme);
  const setMode = useFicha((s) => s.setMode);
  const setTheme = useFicha((s) => s.setTheme);
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
    <header className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-lg text-ink">Criador de Fichas — 7º Mar</h1>
        <PillToggle
          name="Modo"
          value={mode}
          onChange={setMode}
          options={[
            { value: "criar", label: "Criação" },
            { value: "jogo", label: "Jogo" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-ink hover:ring-2 hover:ring-accent"
        >
          {theme === "dark" ? "Tema claro" : "Tema escuro"}
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-ink hover:ring-2 hover:ring-accent"
        >
          Exportar
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-ink hover:ring-2 hover:ring-accent"
        >
          Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={printSheet}
          className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-ink hover:ring-2 hover:ring-accent"
        >
          Imprimir
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window === "undefined" || window.confirm("Recomeçar a ficha do zero?")) {
              reset();
            }
          }}
          className="rounded-md border border-line bg-surface px-3 py-1 text-sm text-accent hover:ring-2 hover:ring-accent"
        >
          Recomeçar
        </button>
      </div>
    </header>
  );
}
