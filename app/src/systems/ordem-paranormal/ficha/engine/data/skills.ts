// ══════════════════════════════════════════════════════════════════
//  ORDEM PARANORMAL — Perícias (Capítulo 2)
//  "treinada": só pode ser usada por quem é treinado.
//  "carga": sofre a penalidade de carga.
// ══════════════════════════════════════════════════════════════════

import type { Attr } from "./elements";

export interface SkillDef {
  name: string;
  attr: Attr;
  trainedOnly?: boolean;
  load?: boolean;
  desc: string;
}

export const SKILLS: SkillDef[] = [
  { name: "Acrobacia", attr: "agi", load: true, desc: "Proezas acrobáticas: equilíbrio, amortecer quedas, escapar de amarras e passar por inimigos." },
  { name: "Adestramento", attr: "pre", trainedOnly: true, desc: "Lidar com animais: acalmá-los, manejá-los e cavalgar." },
  { name: "Artes", attr: "pre", trainedOnly: true, desc: "Expressão artística — atuação, música, escrita, dança — para impressionar uma plateia." },
  { name: "Atletismo", attr: "for", desc: "Corrida, escalada, natação e saltos." },
  { name: "Atualidades", attr: "int", desc: "Conhecimentos gerais: política, esporte, entretenimento e notícias." },
  { name: "Ciências", attr: "int", trainedOnly: true, desc: "Biologia, química, física, matemática e demais ciências." },
  { name: "Crime", attr: "agi", trainedOnly: true, load: true, desc: "Arrombar fechaduras, furtar, ocultar objetos e sabotar dispositivos." },
  { name: "Diplomacia", attr: "pre", desc: "Convencer, mudar atitudes, acalmar pessoas e negociar." },
  { name: "Enganação", attr: "pre", desc: "Mentir, disfarçar-se, fingir e insinuar." },
  { name: "Fortitude", attr: "vig", desc: "Testes de resistência contra doenças, venenos, fadiga e efeitos que exigem vitalidade." },
  { name: "Furtividade", attr: "agi", load: true, desc: "Esconder-se e mover-se sem ser notado." },
  { name: "Iniciativa", attr: "agi", desc: "Agilidade de reação; define a ordem dos turnos em cenas de ação." },
  { name: "Intimidação", attr: "pre", desc: "Assustar ou coagir outras pessoas." },
  { name: "Intuição", attr: "pre", desc: "Perceber mentiras, intenções e se há algo errado em uma situação." },
  { name: "Investigação", attr: "int", desc: "Descobrir pistas, interrogar e procurar informações." },
  { name: "Luta", attr: "for", desc: "Ataques corpo a corpo." },
  { name: "Medicina", attr: "int", desc: "Primeiros socorros, cuidados prolongados, tratar venenos e necropsia." },
  { name: "Ocultismo", attr: "int", trainedOnly: true, desc: "Conhecimento do paranormal: identificar criaturas, itens amaldiçoados e rituais." },
  { name: "Percepção", attr: "pre", desc: "Observar, ouvir e notar coisas escondidas." },
  { name: "Pilotagem", attr: "agi", trainedOnly: true, desc: "Conduzir veículos terrestres, aquáticos e aéreos." },
  { name: "Pontaria", attr: "agi", desc: "Ataques à distância com armas de disparo, de fogo e de arremesso." },
  { name: "Profissão", attr: "int", trainedOnly: true, desc: "Uma profissão específica, com rendimentos ou contatos ligados a ela." },
  { name: "Reflexos", attr: "agi", desc: "Testes de resistência para evitar armadilhas, explosões e efeitos de área." },
  { name: "Religião", attr: "pre", trainedOnly: true, desc: "Teologia e rituais religiosos; acalmar e confortar pessoas." },
  { name: "Sobrevivência", attr: "int", desc: "Orientar-se, rastrear, acampar e identificar animais e plantas." },
  { name: "Tática", attr: "int", trainedOnly: true, desc: "Analisar terreno e situações de combate." },
  { name: "Tecnologia", attr: "int", trainedOnly: true, desc: "Computadores e eletrônicos: hackear, operar dispositivos e falsificar." },
  { name: "Vontade", attr: "pre", desc: "Testes de resistência contra medo, coação, efeitos mentais e paranormais." },
];

export const SKILL_NAMES = SKILLS.map((s) => s.name);
export const skillIndex = new Map(SKILLS.map((s) => [s.name, s]));
export const isSkill = (n: unknown): n is string => typeof n === "string" && skillIndex.has(n);

/** Testes de resistência (para bônus como Reflexos Defensivos e Precognição). */
export const RESISTANCE_SKILLS = ["Fortitude", "Reflexos", "Vontade"];
