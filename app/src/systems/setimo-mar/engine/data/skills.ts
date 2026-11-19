// Porte de SM_SKILLS (scripts/setimo-mar/data-core.js) — PERÍCIAS (16)
// Em 7º Mar o pool = Atributo + Perícia, com o Atributo escolhido na hora
// conforme a abordagem. `trait` abaixo é só uma SUGESTÃO de par comum.
import type { SkillDef } from "../types";

export const SKILLS: SkillDef[] = [
  { key: "armas",       label: "Armas",        trait: "finesse",     desc: "Combate com armas brancas." },
  { key: "arteguerra",  label: "Arte da Guerra",trait: "argucia",    desc: "Tática, estratégia, comando." },
  { key: "atletismo",   label: "Atletismo",    trait: "vigor",       desc: "Correr, escalar, saltar, nadar." },
  { key: "atuar",       label: "Atuar",        trait: "panache",     desc: "Representar, cantar, encantar plateias." },
  { key: "briga",       label: "Briga",        trait: "vigor",       desc: "Combate desarmado e sujo." },
  { key: "cavalgar",    label: "Cavalgar",     trait: "finesse",     desc: "Montaria e condução de veículos." },
  { key: "convencer",   label: "Convencer",    trait: "panache",     desc: "Persuasão honesta e negociação." },
  { key: "empatia",     label: "Empatia",      trait: "argucia",     desc: "Ler pessoas e intenções." },
  { key: "erudicao",    label: "Erudição",     trait: "argucia",     desc: "Saber acadêmico, línguas, história." },
  { key: "esconder",    label: "Esconder-se",  trait: "finesse",     desc: "Furtividade e ocultação." },
  { key: "furto",       label: "Furto",        trait: "finesse",     desc: "Batedor de carteiras, fechaduras." },
  { key: "intimidar",   label: "Intimidar",    trait: "determinacao",desc: "Coagir pela força ou pela ameaça." },
  { key: "mirar",       label: "Mirar",        trait: "finesse",     desc: "Armas de fogo e de arremesso." },
  { key: "navegar",     label: "Navegar",      trait: "argucia",     desc: "Pilotar e orientar embarcações." },
  { key: "observar",    label: "Observar",     trait: "argucia",     desc: "Notar detalhes e perigos." },
  { key: "seduzir",     label: "Seduzir",      trait: "panache",     desc: "Charme romântico e sensual." },
];
