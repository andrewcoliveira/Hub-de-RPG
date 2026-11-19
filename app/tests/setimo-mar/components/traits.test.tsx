import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { TraitsStep } from "@/systems/setimo-mar/views/creation/steps/TraitsStep";
import { ConceptNationStep } from "@/systems/setimo-mar/views/creation/steps/ConceptNationStep";
import { ThemeProvider } from "@/systems/setimo-mar/theme/ThemeProvider";
import { useFicha } from "@/systems/setimo-mar/store/ficha";

beforeEach(() => {
  useFicha.getState().reset();
  document.documentElement.removeAttribute("data-nation");
});

describe("TraitsStep", () => {
  it("stepper de atributo respeita orçamento", () => {
    render(<TraitsStep />);
    const linha = screen.getByTestId("trait-vigor");
    const mais = within(linha).getByRole("button", { name: "+" });
    fireEvent.click(mais);
    fireEvent.click(mais);
    expect(within(linha).getByTestId("trait-vigor-val").textContent).toBe("4");
    expect(mais).toBeDisabled();
  });

  it("aplica data-nation no html ao selecionar nacao", () => {
    act(() => {
      useFicha.getState().selectNation("vodacce");
    });
    render(
      <ThemeProvider>
        <ConceptNationStep />
      </ThemeProvider>
    );
    expect(document.documentElement.getAttribute("data-nation")).toBe("vodacce");
  });
});
