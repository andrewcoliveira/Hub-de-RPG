// Imagens do Império de Jade, empacotadas pelo Vite (nomes com hash no build).
import logo from "./assets/images/Logo.png";

const IMAGES = import.meta.glob<string>("./assets/images/{races,classes}/*.png", { eager: true, import: "default" });

export const LOGO_URL = logo;

/** "assets/images/races/Humano.png" (caminho usado nos dados) → URL final. */
export function imageUrl(path: string): string {
  return IMAGES[`./${path}`] ?? "";
}
