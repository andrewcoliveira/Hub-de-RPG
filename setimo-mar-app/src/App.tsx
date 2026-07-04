import { ThemeProvider } from "@/theme/ThemeProvider";
import { useFicha } from "@/store/ficha";
import { TopBar } from "@/views/TopBar";
import { CreationView } from "@/views/creation/CreationView";

export default function App() {
  const mode = useFicha((s) => s.mode);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface text-ink">
        <TopBar />
        {mode === "criar" ? <CreationView /> : <div className="p-6">Jogo (em construção)</div>}
      </div>
    </ThemeProvider>
  );
}
