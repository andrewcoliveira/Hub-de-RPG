import { useTheme } from "@/shared/theme";

/** Botão sol/lua usado nos cabeçalhos do hub e dos sistemas (classe .theme-toggle). */
export function ThemeToggle({ className = "theme-toggle" }: { className?: string }) {
  const [theme, toggle] = useTheme();
  const label = theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
  return (
    <button className={className} type="button" data-mode={theme} aria-label={label} title={theme === "dark" ? "Tema claro" : "Tema escuro"} onClick={toggle}>
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
      </svg>
    </button>
  );
}
