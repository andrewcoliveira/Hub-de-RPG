import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StoriesStep } from "@/views/creation/steps/StoriesStep";
import { SocietyStep } from "@/views/creation/steps/SocietyStep";
import { FinalTouchesStep } from "@/views/creation/steps/FinalTouchesStep";
import { useFicha } from "@/store/ficha";

beforeEach(() => {
  act(() => {
    useFicha.getState().reset();
  });
});

describe("StoriesStep", () => {
  it("aplicar preset vendeta preenche o Final e cria 1 passo", () => {
    render(<StoriesStep />);
    act(() => {
      fireEvent.click(screen.getByTestId("story-preset-vendeta"));
    });
    const f = useFicha.getState().f;
    expect(f.stories[0].nome).toBe("Vendeta");
    expect(f.stories[0].final).toBe(
      "Fazer justiça com as próprias mãos contra quem lhe tirou tudo."
    );
    expect(f.stories[0].passos).toHaveLength(1);
    expect(screen.getByTestId("story-step-0")).toBeTruthy();
  });

  it("adicionar e alternar passo funciona", () => {
    render(<StoriesStep />);
    act(() => {
      fireEvent.click(screen.getByTestId("story-preset-vendeta"));
    });

    const input = screen.getByTestId("story-step-input") as HTMLInputElement;
    act(() => {
      fireEvent.change(input, { target: { value: "Investigar a cena do crime" } });
      fireEvent.click(screen.getByTestId("story-step-add"));
    });
    expect(useFicha.getState().f.stories[0].passos).toHaveLength(2);

    const checkbox1 = screen.getByTestId("story-step-1") as HTMLInputElement;
    expect(checkbox1.checked).toBe(false);
    act(() => {
      fireEvent.click(checkbox1);
    });
    expect(useFicha.getState().f.stories[0].passos[1].feito).toBe(true);
  });

  it("ignora texto vazio ao adicionar passo", () => {
    render(<StoriesStep />);
    act(() => {
      fireEvent.click(screen.getByTestId("story-preset-vendeta"));
    });
    const before = useFicha.getState().f.stories[0].passos.length;
    act(() => {
      fireEvent.click(screen.getByTestId("story-step-add"));
    });
    expect(useFicha.getState().f.stories[0].passos.length).toBe(before);
  });
});

describe("SocietyStep", () => {
  it("não seleciona novusOrdo, mas seleciona outra sociedade", () => {
    render(<SocietyStep />);
    act(() => {
      fireEvent.click(screen.getByTestId("society-novusOrdo"));
    });
    expect(useFicha.getState().f.society.key).toBeNull();

    act(() => {
      fireEvent.click(screen.getByTestId("society-exploradores"));
    });
    expect(useFicha.getState().f.society.key).toBe("exploradores");
  });

  it("card de novusOrdo fica desabilitado", () => {
    render(<SocietyStep />);
    const btn = screen.getByTestId("society-novusOrdo") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("FinalTouchesStep", () => {
  it("mostra contador de idiomas x / Argúcia", () => {
    act(() => {
      useFicha.getState().selectNation("vodacce");
      useFicha.getState().setNationTrait("argucia");
    });
    render(<FinalTouchesStep />);
    const numIdiomas = useFicha.getState().f.traits.argucia + 1; // +1 nação
    expect(screen.getByTestId("idioma-count").textContent).toBe(`0 / ${numIdiomas}`);

    act(() => {
      fireEvent.change(screen.getByTestId("idioma-input"), { target: { value: "montanhês" } });
      fireEvent.click(screen.getByTestId("idioma-add"));
    });
    expect(screen.getByTestId("idioma-count").textContent).toBe(`1 / ${numIdiomas}`);
  });

  it("ignora reputação só-espaço", () => {
    render(<FinalTouchesStep />);
    act(() => {
      fireEvent.change(screen.getByTestId("reputacao-input"), { target: { value: "   " } });
      fireEvent.click(screen.getByTestId("reputacao-add"));
    });
    expect(useFicha.getState().f.finalTouches.reputacoes).toHaveLength(0);

    act(() => {
      fireEvent.change(screen.getByTestId("reputacao-input"), { target: { value: "Honrado" } });
      fireEvent.click(screen.getByTestId("reputacao-add"));
    });
    expect(useFicha.getState().f.finalTouches.reputacoes).toEqual(["Honrado"]);
  });

  it("mostra nota de Fortuna conforme fortunaPersiste", () => {
    render(<FinalTouchesStep />);
    expect(screen.getByTestId("fortuna-note").textContent).toMatch(/Zera a cada sessão/);

    act(() => {
      useFicha.getState().toggleAdvantage("rico");
    });
    expect(screen.getByTestId("fortuna-note").textContent).toMatch(/Persiste/);
  });
});
