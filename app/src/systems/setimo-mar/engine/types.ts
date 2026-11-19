// ══════════════════════════════════════════════════════════════════
//  7º MAR — Tipos do domínio (núcleo puro)
// ══════════════════════════════════════════════════════════════════

export type TraitKey = "vigor" | "finesse" | "determinacao" | "argucia" | "panache";
export type SkillKey = string; // chaves de SKILLS
export type NationKey = "avalon" | "castilha" | "sarmacia" | "eisen" | "inismore" | "montaigne" | "terrasaltas" | "ussura" | "vesten" | "vodacce";
export type SchoolKey = "glamour" | "hexenwerk" | "condao" | "porte" | "sanderis" | "sortilegio" | "laerdom";

// ── Orçamentos de criação ────────────────────────────────────────────
export interface Creation {
  traitBase: number;
  traitFree: number;
  traitNation: number;
  traitMax: number;
  traitCreationMax: number;
  skillPoints: number;
  skillCreationMax: number;
  advantagePoints: number;
  backgroundsToPick: number;
}

// ── Atributos ─────────────────────────────────────────────────────────
export interface TraitDef {
  key: TraitKey;
  label: string;
  abbr: string;
  desc: string;
}

// ── Perícias ──────────────────────────────────────────────────────────
export interface SkillDef {
  key: string;
  label: string;
  trait: TraitKey;
  desc: string;
}

// ── Nações ────────────────────────────────────────────────────────────
export interface NationDef {
  label: string;
  blurb: string;
  traits: [TraitKey, TraitKey];
  feiticaria: string | null;
  nota: string;
}

// ── Formações (Backgrounds) ──────────────────────────────────────────
export interface BackgroundDef {
  label: string;
  quirk: string;
  skills: string[];
  freeAdvantage: string;
}

// ── Vantagens ─────────────────────────────────────────────────────────
export interface AdvantageDef {
  label: string;
  cost: number;
  desc: string;
  repeatable?: boolean;
}

// ── Arcanos (Virtude & Húbris) ────────────────────────────────────────
export interface ArcanaDef {
  label: string;
  virtude: string;
  hubris: string;
}

// ── Feitiçaria ────────────────────────────────────────────────────────
export interface SorceryPower {
  key: string;
  nome: string;
  desc: string;
}

export interface SorcerySchool {
  label: string;
  fonte: string;
  custo: string;
  nota: string;
  maiores: SorceryPower[];
  menores: SorceryPower[];
}

// ── Duelo ─────────────────────────────────────────────────────────────
export interface DuelingStyleDef {
  label: string;
  nacao: string;
  bonus: string;
}

export interface ManeuverDef {
  nome: string;
  efeito: string;
}

// ── Histórias (Pontos de Partida) ────────────────────────────────────
export interface StoryPresetDef {
  label: string;
  final: string;
  primeiroPasso: string;
}

// ── Sociedades Secretas ───────────────────────────────────────────────
export interface SocietyDef {
  label: string;
  quer: string;
  favorGanha: string;
  favorGasta: string;
  nota: string;
  heroisNao?: boolean;
}

// ── Ficha (estado persistido) ─────────────────────────────────────────
export interface Ficha {
  schemaVersion: 2;
  concept: { name: string; player: string; concept: string; religion: string };
  nation: NationKey | null;
  nationTrait: TraitKey | null;
  traits: Record<TraitKey, number>;
  backgrounds: string[];
  skills: Record<string, number>;
  advantages: string[];
  arcana: { virtude: string | null; hubris: string | null };
  sorcery: { school: SchoolKey | null; powers: string[] };
  dueling: { style: string | null };
  society: { key: string | null };
  stories: { nome: string; final: string; recompensa: string; passos: { texto: string; feito: boolean }[] }[];
  finalTouches: { reputacoes: string[]; idiomas: string[]; fortunaInicial: number };
  play: { ferimentos: number; ferimentosDramaticos: number; pontosHeroicos: number; fortuna: number; favor: number; notas: string };
}
