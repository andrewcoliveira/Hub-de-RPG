import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { PAGES } from "./site.config.mjs";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// ══════════════════════════════════════════════════════════════════
//  Hub de RPG — um único app Vite com várias páginas.
//  Cada página publicada (hub, ferramentas de cada sistema) é uma entrada
//  HTML listada em site.config.mjs. O build vai para a RAIZ do repositório
//  (GitHub Pages pela raiz), mantendo os mesmos endereços de sempre.
//  `npm run build` limpa antes só o que o build anterior gerou
//  (scripts/clean-site.mjs), nunca o código-fonte em app/.
// ══════════════════════════════════════════════════════════════════
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "@": here("./src") } },
  build: {
    outDir: here(".."),
    emptyOutDir: false,
    assetsDir: "assets",
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((p) => [p.name, here(`./${p.html}`)])),
      output: {
        // React e Zustand num pedaço próprio, compartilhado por todas as páginas
        manualChunks: { vendor: ["react", "react-dom", "zustand"] },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // O Node 25+ tem um localStorage nativo que sobrepõe o do jsdom nos testes.
    poolOptions: { forks: { execArgv: ["--no-experimental-webstorage"] } },
  },
});
