import { ThemeProvider } from "@/theme/ThemeProvider";
import { useFicha } from "@/store/ficha";
import { TopBar } from "@/views/TopBar";
import { CreationView } from "@/views/creation/CreationView";
import { PlayView } from "@/views/play/PlayView";

export default function App() {
  const mode = useFicha((s) => s.mode);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface text-ink">
        <TopBar />
        {mode === "criar" ? <CreationView /> : <PlayView />}
      </div>
    </ThemeProvider>
  );
}
