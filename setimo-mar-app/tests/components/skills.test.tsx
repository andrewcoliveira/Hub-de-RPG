import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { BackgroundsStep } from "@/views/creation/steps/BackgroundsStep";
import { SkillsStep } from "@/views/creation/steps/SkillsStep";
import { useFicha } from "@/store/ficha";

beforeEach(() => {
  useFicha.getState().reset();
});

describe("BackgroundsStep", () => {
  it("escolher 2 formacoes desabilita as demais", () => {
    render(<BackgroundsStep />);
    const duelista = screen.getByTestId("bg-duelista");
    const soldado = screen.getByTestId("bg-soldado");
    const orfao = screen.getByTestId("bg-orfao");

    fireEvent.click(within(duelista).getByRole("button"));
    fireEvent.click(within(soldado).getByRole("button"));

    expect(useFicha.getState().f.backgrounds).toEqual(["duelista", "soldado"]);
    expect(within(orfao).getByRole("button")).toBeDisabled();
    // já selecionadas permanecem clicáveis (para poder desmarcar)
    expect(within(duelista).getByRole("button")).not.toBeDisabled();
    expect(within(soldado).getByRole("button")).not.toBeDisabled();
  });

  it("mostra contador x / 2", () => {
    render(<BackgroundsStep />);
    expect(screen.getByText(/0 \/ 2/)).toBeTruthy();
    fireEvent.click(within(screen.getByTestId("bg-duelista")).getByRole("button"));
    expect(screen.getByText(/1 \/ 2/)).toBeTruthy();
  });
});

describe("SkillsStep", () => {
  it("mostra grau final = pontos alocados + bonus de formacao", () => {
    act(() => {
      useFicha.getState().toggleBackground("duelista"); // da +1 em armas
    });
    render(<SkillsStep />);
    const armasFinal = screen.getByTestId("skill-armas-final");
    expect(armasFinal.textContent).toBe("1");

    act(() => {
      useFicha.getState().adjustSkill("armas", 1);
    });
    expect(screen.getByTestId("skill-armas-final").textContent).toBe("2");
  });

  it("+ desabilita ao zerar o orcamento de 10 pontos", () => {
    render(<SkillsStep />);
    const skillKeys = [
      "armas", "arteguerra", "atletismo", "atuar", "briga", "cavalgar",
      "convencer", "empatia", "erudicao", "esconder",
    ];
    // gasta os 10 pontos disponiveis, 1 em cada uma das 10 primeiras pericias
    skillKeys.forEach((key) => {
      const linha = screen.getByTestId(`skill-${key}`);
      fireEvent.click(within(linha).getByRole("button", { name: "+" }));
    });

    expect(useFicha.getState().f.skills.armas).toBe(1);
    const outra = screen.getByTestId("skill-furto");
    expect(within(outra).getByRole("button", { name: "+" })).toBeDisabled();
  });

  it("- desabilita no 0", () => {
    render(<SkillsStep />);
    const linha = screen.getByTestId("skill-armas");
    expect(within(linha).getByRole("button", { name: "-" })).toBeDisabled();
  });
});
