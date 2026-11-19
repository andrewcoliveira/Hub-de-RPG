import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SorceryStep } from "@/systems/setimo-mar/views/creation/steps/SorceryStep";
import { DuelingStep } from "@/systems/setimo-mar/views/creation/steps/DuelingStep";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { SORCERY, DUELING_STYLES } from "@/systems/setimo-mar/engine";

beforeEach(() => useFicha.getState().reset());

describe("SorceryStep", () => {
  it("sem a Vantagem Feitiçaria, mostra o aviso de bloqueio", () => {
    render(<SorceryStep />);
    expect(screen.getByTestId("sorcery-locked")).toBeTruthy();
  });

  it("com a Vantagem + escola glamour, selecionar um 2º Maior é bloqueado (orçamento 1 Maior)", () => {
    useFicha.getState().selectNation("avalon");
    useFicha.getState().toggleAdvantage("feiticaria");
    useFicha.getState().setSchool("glamour");
    render(<SorceryStep />);

    expect(screen.queryByTestId("sorcery-locked")).toBeNull();

    const [primeiroMaior, segundoMaior] = SORCERY.glamour.maiores;
    fireEvent.click(screen.getByTestId(`sorcery-power-${primeiroMaior.key}`));
    fireEvent.click(screen.getByTestId(`sorcery-power-${segundoMaior.key}`));

    const powers = useFicha.getState().f.sorcery.powers;
    expect(powers).toContain(primeiroMaior.key);
    expect(powers).not.toContain(segundoMaior.key);
  });
});

describe("DuelingStep", () => {
  it("sem a Vantagem Academia Duelista, mostra o aviso de bloqueio", () => {
    render(<DuelingStep />);
    expect(screen.getByTestId("dueling-locked")).toBeTruthy();
  });

  it("com a Vantagem, seleciona um estilo e mostra as manobras", () => {
    useFicha.getState().toggleAdvantage("academiaduelista");
    render(<DuelingStep />);

    expect(screen.queryByTestId("dueling-locked")).toBeNull();

    const [styleKey] = Object.keys(DUELING_STYLES);
    fireEvent.click(screen.getByTestId(`dueling-style-${styleKey}`));
    expect(useFicha.getState().f.dueling.style).toBe(styleKey);

    expect(screen.getByText("Cutilada")).toBeTruthy();
  });
});
