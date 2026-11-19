// Apaga da raiz do repositório só o que o build anterior gerou (BUILD_OUTPUTS),
// para o novo build não deixar arquivos velhos para trás.
import { rmSync, existsSync } from "node:fs";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { BUILD_OUTPUTS } from "../site.config.mjs";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = resolve(appDir, "..");
const PROTECTED = new Set(["app", "docs", "README.md", ".git", ".github", ".gitignore"]);

for (const out of BUILD_OUTPUTS) {
  const target = resolve(siteRoot, out);
  const rel = relative(siteRoot, target);
  if (!rel || rel.startsWith("..") || PROTECTED.has(rel.split(sep)[0])) {
    throw new Error(`clean-site: recusando apagar "${out}"`);
  }
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`clean-site: removido ${rel}`);
  }
}
