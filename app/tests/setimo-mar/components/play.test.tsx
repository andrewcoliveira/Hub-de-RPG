import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { PlayView } from "@/systems/setimo-mar/views/play/PlayView";
import { useFicha } from "@/systems/setimo-mar/store/ficha";
import { STORY_PRESETS } from "@/systems/setimo-mar/engine";

beforeEach(() => {
  act(() => {
    useFicha.getState().reset();
    useFicha.getState().setMode("jogo");
  });
});

describe("PlayView", () => {
  it("incrementar a Espiral 5x fica fixa em 4 e exibe Desamparado", () => {
    render(<PlayView />);
    const linha = screen.getByTestId("track-espiral");
    const mais = within(linha).getByRole("button", { name: "+" });
    act(() => {
      for (let i = 0; i < 5; i++) fireEvent.click(mais);
    });
    expect(screen.getByTestId("track-espiral-val").textContent).toBe("4");
    expect(screen.getByTestId("spiral-text").textContent).toMatch(/Desamparado/);
  });

  it("decrementar Pontos Heroicos nao passa de 0", () => {
    render(<PlayView />);
    const linha = screen.getByTestId("track-pontos");
    const menos = within(linha).getByRole("button", { name: "-" });
    act(() => {
      for (let i = 0; i < 5; i++) fireEvent.click(menos);
    });
    expect(screen.getByTestId("track-pontos-val").textContent).toBe("0");
  });

  it("avancar um passo de Historia marca feito", () => {
    act(() => {
      const preset = STORY_PRESETS.vendeta;
      useFicha.getState().applyStoryPreset(preset.label, preset.final, preset.primeiroPasso);
    });
    render(<PlayView />);
    const passo = screen.getByTestId("play-story-step-0");
    const checkbox = within(passo).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    act(() => {
      fireEvent.click(checkbox);
    });
    expect(useFicha.getState().f.stories[0].passos[0].feito).toBe(true);
  });
});
