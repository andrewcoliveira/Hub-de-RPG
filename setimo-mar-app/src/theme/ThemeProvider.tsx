import { useLayoutEffect, type ReactNode } from "react";
import { useFicha } from "@/store/ficha";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useFicha((s) => s.theme);
  const nation = useFicha((s) => s.f.nation);

  // useLayoutEffect: aplica data-theme/data-nation ANTES da primeira pintura,
  // evitando o flash claro→escuro no load e o estado "preso" de cores de acento
  // em elementos com transition sobre var()-based color.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useLayoutEffect(() => {
    if (nation) document.documentElement.setAttribute("data-nation", nation);
    else document.documentElement.removeAttribute("data-nation");
  }, [nation]);

  return <>{children}</>;
}
