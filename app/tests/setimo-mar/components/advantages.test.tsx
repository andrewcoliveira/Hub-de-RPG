import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AdvantagesStep } from "@/systems/setimo-mar/views/creation/steps/AdvantagesStep";
import { ArcanaStep } from "@/systems/setimo-mar/views/creation/steps/ArcanaStep";
import { useFicha } from "@/systems/setimo-mar/store/ficha";

beforeEach(() => {
  useFicha.getState().reset();
});

describe("AdvantagesStep", () => {
  it("comprar contato(2)+rico(3) zera o orcamento (5) e desabilita uma vantagem de custo 4", () => {
    render(<AdvantagesStep />);

    fireEvent.click(screen.getByTestId("adv-contato"));
    fireEvent.click(screen.getByTestId("adv-rico"));

    expect(useFicha.getState().f.advantages).toEqual(["contato", "rico"]);

    const custo4 = screen.getByTestId("adv-academia");
    expect(custo4).toBeDisabled();
  });

  it("vantagens gratis das Formacoes aparecem marcadas sem custo", () => {
    act(() => {
      useFicha.getState().toggleBackground("duelista"); // da esgrimista gratis
    });
    render(<AdvantagesStep />);

    const esgrimista = screen.getByTestId("adv-esgrimista");
    expect(esgrimista).toHaveAttribute("data-active", "true");
    expect(esgrimista).toHaveTextContent(/gr[aá]tis/i);
  });
});

describe("ArcanaStep", () => {
  it("bloqueia escolher a mesma carta como Virtude e Hubris", () => {
    render(<ArcanaStep />);

    fireEvent.click(screen.getByTestId("arcana-virtude-olouco"));
    expect(useFicha.getState().f.arcana.virtude).toBe("olouco");

    fireEvent.click(screen.getByTestId("arcana-hubris-olouco"));
    // continua null: a mesma carta nao pode ser escolhida nos dois lados
    expect(useFicha.getState().f.arcana.hubris).toBeNull();

    const hubrisOlouco = screen.getByTestId("arcana-hubris-olouco");
    expect(hubrisOlouco).toBeDisabled();

    // outra carta funciona normalmente
    fireEvent.click(screen.getByTestId("arcana-hubris-amorte"));
    expect(useFicha.getState().f.arcana.hubris).toBe("amorte");

    // e agora "amorte" fica desabilitada do lado da virtude
    const virtudeAmorte = screen.getByTestId("arcana-virtude-amorte");
    expect(virtudeAmorte).toBeDisabled();
  });
});
