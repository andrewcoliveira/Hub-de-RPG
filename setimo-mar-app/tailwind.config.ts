import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)", "surface-2": "var(--surface-2)",
        ink: "var(--ink)", "ink-soft": "var(--ink-soft)", line: "var(--line)",
        accent: "var(--accent)", "accent-ink": "var(--accent-ink)",
        danger: "var(--danger)", "danger-ink": "var(--danger-ink)",
      },
      fontFamily: { serif: ["Georgia", "serif"], sans: ["system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
