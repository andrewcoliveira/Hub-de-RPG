import { ThemeProvider } from "@/theme/ThemeProvider";
import { useFicha } from "@/store/ficha";
import { TopBar } from "@/views/TopBar";
import { CreationView } from "@/views/creation/CreationView";
import { PlayView } from "@/views/play/PlayView";
import { SheetSummary } from "@/views/SheetSummary";

export default function App() {
  const mode = useFicha((s) => s.mode);
  const f = useFicha((s) => s.f);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface text-ink">
        <TopBar />
        <div className="no-print">
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
