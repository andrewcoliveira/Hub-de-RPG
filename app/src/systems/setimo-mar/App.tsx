import { ThemeProvider } from "@/systems/setimo-mar/theme/ThemeProvider";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { TopBar } from "@/systems/setimo-mar/views/TopBar";
import { CreationView } from "@/systems/setimo-mar/views/creation/CreationView";
import { PlayView } from "@/systems/setimo-mar/views/play/PlayView";
import { SheetSummary } from "@/systems/setimo-mar/views/SheetSummary";

export default function App() {
  const mode = useFicha((s) => s.mode);
  const f = useFicha((s) => s.f);

  return (
    <ThemeProvider>
      <div className="sm-app-bg min-h-screen text-ink">
        <TopBar />
        <div className="no-print pb-16">
          {mode === "criar" ? <CreationView /> : <PlayView />}
        </div>
        {/* Bloco exclusivo de impressão: só a ficha, sem abas/controles. */}
        <div className="print-only p-4">
          <SheetSummary f={f} />
        </div>
      </div>
    </ThemeProvider>
  );
}
