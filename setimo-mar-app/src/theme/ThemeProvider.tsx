import { useEffect, type ReactNode } from "react";
import { useFicha } from "@/store/ficha";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useFicha((s) => s.theme);
  const nation = useFicha((s) => s.f.nation);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (nation) document.documentElement.setAttribute("data-nation", nation);
    else document.documentElement.removeAttribute("data-nation");
  }, [nation]);

  return <>{children}</>;
}
