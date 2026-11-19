import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import GeradorApp from "@/systems/imperio-de-jade/gerador/GeradorApp";
import { useGerador } from "@/systems/imperio-de-jade/gerador/store";
import FichaApp from "@/systems/imperio-de-jade/ficha/FichaApp";
import { useFicha } from "@/systems/imperio-de-jade/ficha/store";
import { blankState, finalValueFor } from "@/systems/imperio-de-jade/ficha/engine";

describe("gerador (tela)", () => {
  beforeEach(() => {
    act(() => {
      useGerador.getState().clear();
      useGerador.setState({ nd: "20", qty: 1, treasure: 1 });
    });
  });

  it("rola 15 tesouros com 5 criaturas e triplo", () => {
    vi.useFakeTimers();
    render(<GeradorApp />);
    const plus = screen.getByRole("button", { name: "Aumentar" });
    for (let i = 0; i < 4; i++) fireEvent.click(plus);
    fireEvent.click(screen.getByRole("radio", { name: "Triplo" }));
    const rollBtn = screen.getByRole("button", { name: /Rolar 15 tesouros/ });
    fireEvent.click(rollBtn);
    act(() => { vi.advanceTimersByTime(700); });
    vi.useRealTimers();

    const feed = useGerador.getState().feed;
    expect(feed).toHaveLength(1);
    expect(feed[0].times).toBe(15);
    expect(screen.getByText("5 criaturas · triplo")).toBeInTheDocument();
  });

  it("muda o ND pelos botões da grade", () => {
    render(<GeradorApp />);
    fireEvent.click(screen.getByRole("radio", { name: "ND 7" }));
    expect(useGerador.getState().nd).toBe("7");
    expect(screen.getByText("ND 7", { selector: "output" })).toBeInTheDocument();
  });
});

describe("ficha (tela)", () => {
  beforeEach(() => {
    act(() => useFicha.setState({ s: blankState(), step: "atributos" }));
  });

  it("compra de pontos atualiza o atributo e a ficha ao vivo", () => {
    render(<FichaApp />);
    fireEvent.click(screen.getByRole("button", { name: /Compra de pontos/ }));
    fireEvent.click(screen.getByRole("button", { name: "Aumentar Força" }));
    expect(useFicha.getState().s.pointValues.for).toBe(11);
  });

  it("escolher raça e classe mostra a Honra com o ajuste da classe", () => {
    act(() => useFicha.setState({ s: { ...blankState(), mode: "points" }, step: "raca" }));
    render(<FichaApp />);
    fireEvent.click(screen.getByRole("button", { name: /Ryuujin/ }));
    act(() => useFicha.getState().setStep("classe"));
    fireEvent.click(screen.getByRole("button", { name: /Samurai/ }));
    const s = useFicha.getState().s;
    expect(s.race).toBe("ryuujin");
    expect(s.classKey).toBe("samurai");
    expect(finalValueFor(s, "hon")).toBe(14); // 10 + 2 raça + 2 classe
    const stats = document.querySelector(".stat-row") as HTMLElement;
    expect(within(stats).getByText("14")).toBeInTheDocument();
  });

  it("navega pelas etapas com o botão Próximo", () => {
    render(<FichaApp />);
    const next = document.querySelector<HTMLButtonElement>(".step-nav .btn-primary")!;
    expect(next).toHaveTextContent("Raça");
    fireEvent.click(next);
    expect(useFicha.getState().step).toBe("raca");
    expect(location.hash).toBe("#raca");
  });
});
